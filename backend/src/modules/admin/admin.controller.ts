import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Put, Query } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminService } from "./admin.service";
import {
  AdminCasesQueryDto,
  AdminCoursesQueryDto,
  AdminLogsQueryDto,
  AdminUsersQueryDto,
  UpdateSettingsDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from "./dto/admin-query.dto";

/**
 * Admin portal API (BE-032, spec 007 US3; OPD-015 -> B). Every route is ADMIN only (AC-A1).
 *
 * GET   /api/v1/admin/overview            10.2
 * GET   /api/v1/admin/users               10.3
 * PATCH /api/v1/admin/users/:id/status    10.4 lock / unlock
 * PATCH /api/v1/admin/users/:id/role      role change (PO 2026-11-21)
 * GET   /api/v1/admin/courses             10.5
 * GET   /api/v1/admin/cases               10.6
 * GET   /api/v1/admin/ai-service          10.7 (read-only, OPD-013)
 * GET   /api/v1/admin/logs                10.9
 * GET   /api/v1/admin/settings            10.10
 * PUT   /api/v1/admin/settings            10.10
 */
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("overview")
  async overview() {
    return { status: "SUCCESS", data: await this.admin.getOverview() };
  }

  @Get("users")
  async users(@Query() query: AdminUsersQueryDto) {
    return { status: "SUCCESS", data: await this.admin.listUsers(query) };
  }

  @Patch("users/:id/status")
  async setStatus(
    @CurrentUser() user: { id: string },
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return { status: "SUCCESS", data: await this.admin.setUserStatus(user.id, id, dto.status) };
  }

  @Patch("users/:id/role")
  async setRole(
    @CurrentUser() user: { id: string },
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return { status: "SUCCESS", data: await this.admin.setUserRole(user.id, id, dto.role) };
  }

  @Get("courses")
  async courses(@Query() query: AdminCoursesQueryDto) {
    return { status: "SUCCESS", data: await this.admin.listCourses(query) };
  }

  @Get("cases")
  async cases(@Query() query: AdminCasesQueryDto) {
    return { status: "SUCCESS", data: await this.admin.listCases(query) };
  }

  @Get("ai-service")
  async aiService() {
    return { status: "SUCCESS", data: await this.admin.getAiService() };
  }

  @Get("logs")
  async logs(@Query() query: AdminLogsQueryDto) {
    return { status: "SUCCESS", data: await this.admin.listLogs(query) };
  }

  @Get("settings")
  async settings() {
    return { status: "SUCCESS", data: await this.admin.getSettings() };
  }

  @Put("settings")
  async updateSettings(@CurrentUser() user: { id: string }, @Body() dto: UpdateSettingsDto) {
    return { status: "SUCCESS", data: await this.admin.updateSettings(user.id, dto) };
  }
}
