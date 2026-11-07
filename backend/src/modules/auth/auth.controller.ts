import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RateLimit } from "./decorators/rate-limit.decorator";
import { RateLimiterGuard } from "./guards/rate-limiter.guard";

/**
 * AuthController — Authentication endpoints.
 *
 * Public routes:
 *   POST /api/v1/auth/register  — Create a new Lecturer or Student account (rate limited)
 *   POST /api/v1/auth/login     — Authenticate and receive JWT access token (rate limited)
 *
 * Protected routes:
 *   GET  /api/v1/auth/me        — Get current user profile (matches EBA-105 AC 3)
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(RateLimiterGuard)
  @RateLimit()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Public()
  @UseGuards(RateLimiterGuard)
  @RateLimit()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Get("me")
  async getProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
    const profile = await this.authService.validateToken({ sub: user.id } as any);
    return {
      status: "SUCCESS",
      data: profile,
    };
  }
}
