import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { RolesGuard } from "./modules/auth/guards/roles.guard";
import { PgErrorFilter } from "./common/database/pg-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all API endpoints
  app.setGlobalPrefix("api/v1");

  // Global validation pipe — enforces DTO validation on all request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global guards — JWT authentication by default, followed by Role-based authorization
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // Client-caused database errors (bad UUID, FK, unique) become 4xx instead of 500
  app.useGlobalFilters(new PgErrorFilter());

  // Enable CORS
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173"];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = process.env.SERVER_PORT || 8080;
  await app.listen(port);
  console.log(`EduBranch AI Backend Gateway listening on port ${port} (prefix: /api/v1)`);
}

bootstrap().catch((err) => {
  console.error("FATAL: Application failed to start:", err.message);
  process.exit(1);
});
