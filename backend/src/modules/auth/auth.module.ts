import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { DatabaseModule } from "../../common/database/database.module";

import { RolesGuard } from "./guards/roles.guard";
import { RateLimiterGuard } from "./guards/rate-limiter.guard";
import { RateLimiterService } from "./rate-limiter/rate-limiter.service";

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "edubranch-dev-secret-change-in-prod",
        signOptions: {
          expiresIn: (configService.get<string>("JWT_EXPIRES_IN") || "8h") as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    RateLimiterService,
    RateLimiterGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    RolesGuard,
    RateLimiterService,
    RateLimiterGuard,
  ],
})
export class AuthModule {}
