import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { StatisticsService } from "./statistics.service";

/**
 * StatisticsController — E8 route (contracts/api.md §C).
 * Prefixed with /api/v1 by global prefix in main.ts.
 * Controller uses @Controller() without route prefix.
 */
@Controller()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * E8: GET /api/v1/cases/:caseId/statistics
   * LECTURER role (course owner only).
   */
  @Roles("LECTURER")
  @Get("cases/:caseId/statistics")
  async getStatistics(
    @Param("caseId", ParseUUIDPipe) caseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.statisticsService.getCaseStatistics(caseId, user.id);
    return {
      status: "SUCCESS",
      data,
    };
  }
}
