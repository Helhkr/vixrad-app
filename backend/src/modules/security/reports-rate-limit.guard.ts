import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ReportsRateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.sub;
    if (typeof userId === "string" && userId.length > 0) {
      return userId;
    }

    const ip = req.ip;
    if (typeof ip === "string" && ip.length > 0) {
      return ip;
    }

    return "anonymous";
  }
}
