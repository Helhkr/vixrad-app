import { Module } from "@nestjs/common";

import { TemplatesModule } from "../templates/templates.module";
import { AiService } from "./ai.service";
import { PromptBuilderService } from "./prompt-builder.service";
import { FileExtractionService } from "./file-extraction.service";

@Module({
	imports: [TemplatesModule],
	providers: [AiService, PromptBuilderService, FileExtractionService],
	exports: [AiService, PromptBuilderService, FileExtractionService],
})
export class AiModule {}
