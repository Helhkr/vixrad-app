import { IsString, MaxLength } from "class-validator";

export class RefreshDto {
  @IsString()
  @MaxLength(5000)
  refreshToken!: string;
}
