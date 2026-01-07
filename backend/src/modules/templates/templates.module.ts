import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { TrialModule } from "../trial/trial.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AccessGuard } from "../auth/guards/access.guard";

import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";

@Module({
	imports: [AuthModule, TrialModule],
	controllers: [TemplatesController],
	providers: [TemplatesService, JwtAuthGuard, AccessGuard],
	exports: [TemplatesService],
})
export class TemplatesModule {}
