import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

/**
 * UserController — User profile endpoints.
 *
 * GET /api/v1/users/me  — Get current authenticated user profile
 */
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getMyProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
    const profile = await this.userService.getProfile(user.id);
    return { status: "SUCCESS", data: profile };
  }
}
