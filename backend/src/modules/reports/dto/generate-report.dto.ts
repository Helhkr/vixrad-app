import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class GenerateReportDto {
  @IsString()
  @IsIn(["CT"], { message: "examType inválido" })
  examType!: string;

  @IsString()
  @MaxLength(64)
  templateId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  indication?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  findings?: string;
}
