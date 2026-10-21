import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { RolesGuard } from "./modules/auth/guards/roles.guard";

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

bootstrap();
