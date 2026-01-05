import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { validateEnv } from "./config/env";

async function bootstrap() {
	validateEnv(process.env);

	const app = await NestFactory.create(AppModule, {
		logger: ["error", "warn", "log"],
	});

	app.enableShutdownHooks();

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

void bootstrap();

