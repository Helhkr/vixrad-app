import { Module } from "@nestjs/common";

import { TemplatesModule } from "../templates/templates.module";
import { AiService } from "./ai.service";
import { PromptBuilderService } from "./prompt-builder.service";

@Module({
	imports: [TemplatesModule],
	providers: [AiService, PromptBuilderService],
	exports: [AiService, PromptBuilderService],
})
export class AiModule {}
