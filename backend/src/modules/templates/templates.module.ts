import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TemplateEntity } from "./template.entity";
import { TemplatesService } from "./templates.service";

@Module({
	imports: [TypeOrmModule.forFeature([TemplateEntity])],
	providers: [TemplatesService],
	exports: [TemplatesService],
})
export class TemplatesModule {}
