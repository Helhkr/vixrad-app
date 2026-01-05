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

	app.enableCors({
		origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
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

