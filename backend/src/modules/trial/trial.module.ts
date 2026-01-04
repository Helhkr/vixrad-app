import { Module } from "@nestjs/common";

import { TrialService } from "./trial.service";

@Module({
	providers: [TrialService],
	exports: [TrialService],
})
export class TrialModule {}

