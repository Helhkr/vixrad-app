import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class GenerateReportDto {
  @IsString()
  @IsIn(["CT", "XR", "US", "MR", "MG", "DXA", "NM"], { message: "examType inválido" })
  examType!: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";

  @IsString()
  @MaxLength(64)
  templateId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  indication?: string;

  @IsOptional()
  @IsString()
  @IsIn(["M", "F"], { message: "sex inválido" })
  sex?: "M" | "F";

  @IsOptional()
  @IsString()
  @IsIn(["RIGHT", "LEFT"], { message: "side inválido" })
  side?: "RIGHT" | "LEFT";

  @IsOptional()
  @IsString()
  @IsIn(["with", "without"], { message: "contrast inválido" })
  contrast?: "with" | "without";

  @IsOptional()
  @IsString()
  @MaxLength(128)
  incidence?: string;

  @IsOptional()
  @IsString()
  @IsIn(["ventral", "dorsal", "lateral"], { message: "decubitus inválido" })
  decubitus?: "ventral" | "dorsal" | "lateral";

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  findings?: string | null;
}
