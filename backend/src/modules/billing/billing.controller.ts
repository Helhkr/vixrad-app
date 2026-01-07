import { BadRequestException, Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { SetUserSubscriptionDto } from "./dto/set-user-subscription.dto";

@Controller("billing/admin")
export class BillingAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch("users/:userId/subscription")
  async setUserSubscription(
    @Param("userId") userId: string,
    @Body() dto: SetUserSubscriptionDto,
  ) {
    const role = dto.role;

    const parseDate = (raw?: string): Date | undefined => {
      if (!raw) return undefined;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException("Data inválida");
      }
      return d;
    };

    const startedAt = parseDate(dto.subscriptionStartedAt);
    const endsAt = parseDate(dto.subscriptionEndsAt);

    if (role && role !== "BLUE" && (startedAt || endsAt)) {
      throw new BadRequestException("subscriptionStartedAt/subscriptionEndsAt só pode ser usado com role=BLUE");
    }

    let finalStartedAt: Date | null | undefined = undefined;
    let finalEndsAt: Date | null | undefined = undefined;

    if (role === "BLUE") {
      const baseStart = startedAt ?? new Date();
      const baseEnd = endsAt ?? new Date(baseStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (baseEnd.getTime() <= baseStart.getTime()) {
        throw new BadRequestException("subscriptionEndsAt deve ser maior que subscriptionStartedAt");
      }

      finalStartedAt = baseStart;
      finalEndsAt = baseEnd;
    }

    if (role && role !== "BLUE") {
      finalStartedAt = null;
      finalEndsAt = null;
    }

    const data: any = {};
    if (role) data.role = role;
    if (finalStartedAt !== undefined) data.subscriptionStartedAt = finalStartedAt;
    if (finalEndsAt !== undefined) data.subscriptionEndsAt = finalEndsAt;

    const selectSafe: any = {
      id: true,
      email: true,
      role: true,
      subscriptionStartedAt: true,
      subscriptionEndsAt: true,
    };

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: selectSafe,
    });

    return updated;
  }
}
