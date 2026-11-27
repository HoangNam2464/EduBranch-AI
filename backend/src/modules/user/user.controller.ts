import { Body, Controller, Get, Patch } from "@nestjs/common";
import { UserService } from "./user.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UpdateProfileDto } from "./dto/update-profile.dto";

/**
 * UserController — profile of the signed-in user (any role).
 *
 * GET   /api/v1/users/me — current profile
 * PATCH /api/v1/users/me — update own full name / interface language (BE-031)
 */
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getMyProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
    const profile = await this.userService.getProfile(user.id);
    return { status: "SUCCESS", data: profile };
  }

  @Patch("me")
  async updateMyProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const profile = await this.userService.updateProfile(user.id, dto);
    return { status: "SUCCESS", data: profile };
  }
}
