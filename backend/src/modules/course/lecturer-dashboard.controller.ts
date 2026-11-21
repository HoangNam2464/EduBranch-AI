import { Controller, Get, ParseUUIDPipe, Query } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { LecturerDashboardService } from "./lecturer-dashboard.service";

/**
 * GET /api/v1/lecturer/dashboard?courseId= — aggregates for 07.1 (BE-030, spec 007 US2). LECTURER only.
 */
@Roles("LECTURER")
@Controller("lecturer")
export class LecturerDashboardController {
  constructor(private readonly dashboard: LecturerDashboardService) {}

  @Get("dashboard")
  async get(
    @CurrentUser() user: { id: string },
    @Query("courseId", new ParseUUIDPipe({ optional: true })) courseId?: string,
  ) {
    return { status: "SUCCESS", data: await this.dashboard.getDashboard(user.id, courseId) };
  }
}
