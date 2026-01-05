import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AuditMiddleware } from "./common/middleware/audit.middleware";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AiModule } from "./modules/ai/ai.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BillingModule } from "./modules/billing/billing.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SecurityModule } from "./modules/security/security.module";
import { TemplatesModule } from "./modules/templates/templates.module";
import { TrialModule } from "./modules/trial/trial.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    PrismaModule,
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
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes("reports");
  }
}
