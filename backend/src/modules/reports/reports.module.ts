import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { TrialModule } from "../trial/trial.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { TemplatesModule } from "../templates/templates.module";

import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
	imports: [AuthModule, TrialModule, TemplatesModule],
	controllers: [ReportsController],
	providers: [ReportsService, JwtAuthGuard, TrialGuard],
})
export class ReportsModule {}
