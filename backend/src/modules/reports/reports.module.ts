import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "../auth/auth.module";
import { TrialModule } from "../trial/trial.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { TemplatesModule } from "../templates/templates.module";
import { ReportsRateLimitGuard } from "../security/reports-rate-limit.guard";

import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
	imports: [
		AuthModule,
		TrialModule,
		TemplatesModule,
		ThrottlerModule.forRoot([
			{
				ttl: 60,
				limit: 10,
			},
		]),
	],
	controllers: [ReportsController],
	providers: [ReportsService, JwtAuthGuard, TrialGuard, ReportsRateLimitGuard],
})
export class ReportsModule {}
