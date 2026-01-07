import { IsIn, IsISO8601, IsOptional } from "class-validator";

export class SetUserSubscriptionDto {
  @IsOptional()
  @IsIn(["ADMIN", "TRIAL", "BLUE"])
  role?: "ADMIN" | "TRIAL" | "BLUE";

  @IsOptional()
  @IsISO8601()
  subscriptionStartedAt?: string;

  @IsOptional()
  @IsISO8601()
  subscriptionEndsAt?: string;
}
