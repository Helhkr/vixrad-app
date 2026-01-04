import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

import { TrialService } from "../trial/trial.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly trialService: TrialService,
    private readonly jwtService: JwtService,
  ) {}

  async register(params: { email: string; password: string }): Promise<{ accessToken: string }> {
    const passwordHash = await bcrypt.hash(params.password, 12);
    const user = await this.usersService.createUser({
      email: params.email,
      passwordHash,
    });

    await this.trialService.ensureTrialForUser(user.id);
    await this.trialService.assertTrialActive(user.id);

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return { accessToken };
  }

  async login(params: { email: string; password: string }): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(params.email);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    await this.trialService.assertTrialActive(user.id);

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return { accessToken };
  }
}
