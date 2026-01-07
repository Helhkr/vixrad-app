import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AccessGuard } from "../auth/guards/access.guard";
import { TemplatesModule } from "../templates/templates.module";
import { AiModule } from "../ai/ai.module";
import { ReportsRateLimitGuard } from "../security/reports-rate-limit.guard";

import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
	imports: [
		AuthModule,
		AiModule,
		TemplatesModule,
		ThrottlerModule.forRoot([
			{
				ttl: 60_000,
				limit: 10,
			},
		]),
	],
	controllers: [ReportsController],
	providers: [ReportsService, JwtAuthGuard, AccessGuard, ReportsRateLimitGuard],
})
export class ReportsModule {}
