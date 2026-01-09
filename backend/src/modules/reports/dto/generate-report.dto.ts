import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class GenerateReportDto {
  @IsString()
  @IsIn(["CT", "XR", "US", "MR", "MG", "DXA", "NM"], { message: "examType inválido" })
  examType!: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";

  @IsString()
  @MaxLength(64)
  templateId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;

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
  @IsIn(["RIGHT", "LEFT", "BILATERAL"], { message: "side inválido" })
  side?: "RIGHT" | "LEFT" | "BILATERAL";

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
  @MaxLength(64)
  dxaLumbarBmd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaLumbarTScore?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaLumbarZScore?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaFemoralNeckBmd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaFemoralNeckTScore?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaFemoralNeckZScore?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaTotalHipBmd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaTotalHipTScore?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaTotalHipZScore?: string;

  // DXA Forearm (rádio 33%)
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "dxaIncludeForearm inválido" })
  dxaIncludeForearm?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaForearmBmd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaForearmTScore?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaForearmZScore?: string;

  // DXA Previous exam
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "dxaHasPreviousExam inválido" })
  dxaHasPreviousExam?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "dxaAttachPreviousExam inválido" })
  dxaAttachPreviousExam?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaPreviousExamDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaPreviousLumbarBmd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaPreviousFemoralNeckBmd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dxaPreviousTotalHipBmd?: string;

  // DXA Limitations
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "dxaLimitationsEnabled inválido" })
  dxaLimitationsEnabled?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return [value];
    }
    return value;
  })
  @IsArray({ message: "dxaLimitationTypes inválido" })
  @IsString({ each: true })
  @IsIn(
    ["escoliose", "fraturas_vertebrais", "protese_quadril", "calcificacoes_aorticas", "artefatos_movimento", "obesidade"],
    { each: true, message: "dxaLimitationTypes inválido" },
  )
  dxaLimitationTypes?: Array<
    | "escoliose"
    | "fraturas_vertebrais"
    | "protese_quadril"
    | "calcificacoes_aorticas"
    | "artefatos_movimento"
    | "obesidade"
  >;

  // DXA Score type (T-score vs Z-score)
  @IsOptional()
  @IsString()
  @IsIn(["t-score", "z-score"], { message: "dxaScoreType inválido" })
  dxaScoreType?: "t-score" | "z-score";

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "academic inválido" })
  academic?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  findings?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(["omit", "without", "with"], { message: "ecgGating inválido" })
  ecgGating?: "omit" | "without" | "with";

  @IsOptional()
  @IsString()
  @IsIn(["omit", "without", "with"], { message: "phases inválido" })
  phases?: "omit" | "without" | "with";

  @IsOptional()
  @IsString()
  @IsIn(["omit", "1.5T", "3.0T"], { message: "coil inválido" })
  coil?: "omit" | "1.5T" | "3.0T";

  @IsOptional()
  @IsString()
  @IsIn(["omit", "without", "with"], { message: "sedation inválido" })
  sedation?: "omit" | "without" | "with";

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "artifactSourceEnabled inválido" })
  artifactSourceEnabled?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      // Support either repeated keys (string) or JSON array as a string.
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return [value];
    }
    return value;
  })
  @IsArray({ message: "artifactSourceTypes inválido" })
  @IsString({ each: true })
  @IsIn(
    [
      "Movimento",
      "Beam hardening",
      "Susceptibilidade magnética",
      "Aliasing",
      "Deslocamento químico",
      "Volume parcial",
      "Ghosting",
      "Truncamento",
      "Zipper",
      "Ruído",
      "Interferência de radiofrequência",
      "Crosstalk",
    ],
    { each: true, message: "artifactSourceTypes inválido" },
  )
  artifactSourceTypes?: Array<
    | "Movimento"
    | "Beam hardening"
    | "Susceptibilidade magnética"
    | "Aliasing"
    | "Deslocamento químico"
    | "Volume parcial"
    | "Ghosting"
    | "Truncamento"
    | "Zipper"
    | "Ruído"
    | "Interferência de radiofrequência"
    | "Crosstalk"
  >;
}
