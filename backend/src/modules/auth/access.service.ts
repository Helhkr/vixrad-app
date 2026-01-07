import { ForbiddenException, Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

export type UserAccessRole = "ADMIN" | "TRIAL" | "BLUE";

export type UserAccessContext = {
  userId: string;
  role: UserAccessRole;
  active: boolean;
  // Rolling window used for quota checks
  windowStart: Date;
  windowEnd: Date;
};

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAccessContext(userId: string): Promise<UserAccessContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { trial: true },
    });

    if (!user) {
      throw new ForbiddenException("Usuário não encontrado");
    }

    const role = user.role as UserAccessRole;
    const now = new Date();

    if (role === "ADMIN") {
      // Admin never blocked; window is still defined for logging.
      const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      return { userId, role, active: true, windowStart, windowEnd };
    }

    if (role === "TRIAL") {
      const trial = user.trial;
      if (!trial) {
        throw new ForbiddenException("Trial não encontrado");
      }
      const active = trial.endsAt.getTime() > now.getTime();
      return { userId, role, active, windowStart: trial.startedAt, windowEnd: trial.endsAt };
    }

    // BLUE
    const startedAt = user.subscriptionStartedAt;
    const endsAt = user.subscriptionEndsAt;
    if (!startedAt || !endsAt) {
      return {
        userId,
        role,
        active: false,
        windowStart: now,
        windowEnd: now,
      };
    }

    const active = endsAt.getTime() > now.getTime();
    return { userId, role, active, windowStart: startedAt, windowEnd: endsAt };
  }

  async assertUserActive(userId: string): Promise<void> {
    const ctx = await this.getUserAccessContext(userId);
    if (!ctx.active) {
      throw new ForbiddenException("Assinatura/trial inativo");
    }
  }
}
