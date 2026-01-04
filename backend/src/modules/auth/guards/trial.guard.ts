import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { TrialService } from "../../trial/trial.service";
import type { JwtPayload } from "../jwt.strategy";

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private readonly trialService: TrialService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    await this.trialService.assertTrialActive(user.sub);
    return true;
  }
}
