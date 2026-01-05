import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { sign, verify } from "jsonwebtoken";
import * as request from "supertest";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { ReportsRateLimitGuard } from "../security/reports-rate-limit.guard";
import { TrialService } from "../trial/trial.service";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Injectable()
class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers?.authorization;

    if (typeof header !== "string" || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException();
    }

    const token = header.slice("Bearer ".length).trim();
    if (token.length === 0) {
      throw new UnauthorizedException();
    }

    try {
      const payload = verify(token, process.env.JWT_SECRET as string);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

class StubReportsService {
  generateStructuredBaseReport() {
    return { reportText: "ok" };
  }
}

describe("Reports security", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-jwt-secret";

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60_000,
            limit: 10,
          },
        ]),
      ],
      controllers: [ReportsController],
      providers: [
        ReportsRateLimitGuard,
        TrialGuard,
        {
          provide: TrialService,
          useValue: {
            assertTrialActive: async () => undefined,
          },
        },
        { provide: ReportsService, useClass: StubReportsService },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("returns 401 when access token is expired", async () => {
    const expiredToken = sign(
      {
        sub: "user-1",
        exp: Math.floor(Date.now() / 1000) - 10,
      },
      process.env.JWT_SECRET as string,
    );

    await request(app.getHttpServer())
      .post("/reports/generate")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({
        examType: "CT",
        templateId: "ct-cranio-normal-v1",
      })
      .expect(401);
  });

  it("returns 429 after 10 requests/min per user", async () => {
    const validToken = sign({ sub: "user-2" }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post("/reports/generate")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          examType: "CT",
          templateId: "ct-cranio-normal-v1",
        })
        .expect(200);
    }

    await request(app.getHttpServer())
      .post("/reports/generate")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        examType: "CT",
        templateId: "ct-cranio-normal-v1",
      })
      .expect(429);
  });
});
