import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AiModule } from "./modules/ai/ai.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BillingModule } from "./modules/billing/billing.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SecurityModule } from "./modules/security/security.module";
import { TemplatesModule } from "./modules/templates/templates.module";
import { TemplateEntity } from "./modules/templates/template.entity";
import { TrialModule } from "./modules/trial/trial.module";
import { UsersModule } from "./modules/users/users.module";
import { getTypeOrmOptions } from "./common/database";

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmOptions([TemplateEntity])),
    AuthModule,
    UsersModule,
    TrialModule,
    BillingModule,
    TemplatesModule,
    ReportsModule,
    AiModule,
    AuditModule,
    SecurityModule,
  ],
})
export class AppModule {}
