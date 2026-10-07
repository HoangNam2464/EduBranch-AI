import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";

/**
 * AuthController — Authentication endpoints.
 *
 * All routes here are @Public() — no JWT required.
 *
 * POST /api/v1/auth/register  — Create a new Lecturer or Student account
 * POST /api/v1/auth/login     — Authenticate and receive JWT access token
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
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
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      status: "SUCCESS",
      data: result,
    };
  }
}
