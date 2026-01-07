import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { TemplatesModule } from "../templates/templates.module";
import { AiService } from "./ai.service";
import { AiPolicyService } from "./ai-policy.service";
import { PromptBuilderService } from "./prompt-builder.service";
import { FileExtractionService } from "./file-extraction.service";

@Module({
	imports: [AuthModule, TemplatesModule],
	providers: [AiService, AiPolicyService, PromptBuilderService, FileExtractionService],
	exports: [AiService, AiPolicyService, PromptBuilderService, FileExtractionService],
})
export class AiModule {}
