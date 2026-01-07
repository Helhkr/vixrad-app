import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { AccessService } from "../access.service";
import type { JwtPayload } from "../jwt.strategy";

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly accessService: AccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    await this.accessService.assertUserActive(user.sub);
    return true;
  }
}
