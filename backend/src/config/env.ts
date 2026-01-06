import { plainToInstance, Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min, validateSync } from "class-validator";

class EnvVars {
  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsString()
  GEMINI_API_KEY?: string;

  @IsOptional()
  @IsString()
  GEMINI_MODEL?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1000)
  @Max(120000)
  GEMINI_TIMEOUT_MS?: number;
}

export function validateEnv(env: NodeJS.ProcessEnv): EnvVars {
  const instance = plainToInstance(EnvVars, {
    JWT_SECRET: env.JWT_SECRET,
    JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
    PORT: env.PORT,
    GEMINI_API_KEY: env.GEMINI_API_KEY,
    GEMINI_MODEL: env.GEMINI_MODEL,
    GEMINI_TIMEOUT_MS: env.GEMINI_TIMEOUT_MS,
  });

  const errors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const flattened = errors
      .flatMap((e) => (e.constraints ? Object.values(e.constraints) : []))
      .join("; ");
    throw new Error(`Invalid environment variables: ${flattened}`);
  }

  return instance;
}
