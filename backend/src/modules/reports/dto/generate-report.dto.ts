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
  @IsIn(["convencional", "digital", "3d"], { message: "type inválido" })
  type?: "convencional" | "digital" | "3d";

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
