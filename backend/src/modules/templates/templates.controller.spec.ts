import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";

describe("TemplatesController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        {
          provide: TemplatesService,
          useValue: {
            listTemplates: () => [
              { id: "ct-cranio-normal-v1", name: "TOMOGRAFIA COMPUTADORIZADA DO CRÂNIO", examType: "CT" },
            ],
          },
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true });
    moduleBuilder.overrideGuard(TrialGuard).useValue({ canActivate: () => true });

    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /templates returns template metadata", async () => {
    const res = await request(app.getHttpServer()).get("/templates").expect(200);
    expect(res.body).toEqual([
      { id: "ct-cranio-normal-v1", name: "TOMOGRAFIA COMPUTADORIZADA DO CRÂNIO", examType: "CT" },
    ]);
  });
});
