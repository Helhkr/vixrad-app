import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";

import { AccessService } from "../access.service";
import type { JwtPayload } from "../jwt.strategy";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly accessService: AccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    const ctx = await this.accessService.getUserAccessContext(user.sub);
    if (ctx.role !== "ADMIN") {
      throw new ForbiddenException("Apenas admin");
    }

    return true;
  }
}
