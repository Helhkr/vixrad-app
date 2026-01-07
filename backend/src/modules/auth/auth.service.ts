import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

import { TrialService } from "../trial/trial.service";
import { AccessService } from "./access.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly trialService: TrialService,
    private readonly accessService: AccessService,
    private readonly jwtService: JwtService,
  ) {}

  private async issueTokens(params: {
    userId: string;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: params.userId, email: params.email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: "60m",
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: params.userId, type: "refresh" },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d",
      },
    );

    return { accessToken, refreshToken };
  }

  async register(
    params: {
      email: string;
      password: string;
    },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const passwordHash = await bcrypt.hash(params.password, 12);
    const user = await this.usersService.createUser({
      email: params.email,
      passwordHash,
    });

    await this.trialService.ensureTrialForUser(user.id);
    await this.accessService.assertUserActive(user.id);

    return this.issueTokens({ userId: user.id, email: user.email });
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(params.email);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    await this.accessService.assertUserActive(user.id);

    return this.issueTokens({ userId: user.id, email: user.email });
  }

  async refresh(params: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(params.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }

    if (!payload || payload.type !== "refresh" || typeof payload.sub !== "string") {
      throw new UnauthorizedException("Refresh token inválido");
    }

    // Ensure user still exists and is allowed.
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    await this.accessService.assertUserActive(user.id);

    return this.issueTokens({ userId: user.id, email: user.email });
  }
}
