import { ForbiddenException, Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class TrialService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureTrialForUser(userId: string): Promise<void> {
    const existing = await this.prisma.trial.findUnique({ where: { userId } });
    if (existing) return;

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.trial.create({
      data: {
        userId,
        startedAt,
        endsAt,
      },
    });
  }

  async assertTrialActive(userId: string): Promise<void> {
    const trial = await this.prisma.trial.findUnique({ where: { userId } });
    if (!trial) {
      throw new ForbiddenException("Trial não encontrado");
    }

    const now = new Date();
    if (trial.endsAt.getTime() <= now.getTime()) {
      throw new ForbiddenException("Trial expirado");
    }
  }
}
