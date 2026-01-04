import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import type { DataSourceOptions } from "typeorm";

function getEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getTypeOrmOptions(entities: DataSourceOptions["entities"]): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;

  const synchronize =
    process.env.TYPEORM_SYNC === "true" ||
    (process.env.TYPEORM_SYNC !== "false" && process.env.NODE_ENV !== "production");

  if (databaseUrl) {
    return {
      type: "postgres",
      url: databaseUrl,
      entities,
      synchronize,
      logging: false,
    };
  }

  return {
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: getEnvInt("DB_PORT", 5432),
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "vixrad",
    entities,
    synchronize,
    logging: false,
  };
}
