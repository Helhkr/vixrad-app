import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

import { BillingAdminController } from "./billing.controller";

@Module({
	imports: [AuthModule],
	controllers: [BillingAdminController],
	providers: [JwtAuthGuard, AdminGuard],
})
export class BillingModule {}
