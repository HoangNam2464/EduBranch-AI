import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from "@nestjs/common";
import { CaseService } from "./case.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * CaseController — Flow 2: AI Case Generation & Lecturer Review Lifecycle
 *
 * Routes (automatically prefixed with /api/v1):
 *   POST  /api/v1/cases/generate         (Lecturer only)
 *   GET   /api/v1/courses/:courseId/cases (Lecturer or Student)
 *   GET   /api/v1/cases/:id              (Lecturer: full tree; Student: published metadata only)
 *   PUT   /api/v1/cases/:id              (Lecturer course owner only)
 *   PATCH /api/v1/cases/:id/status       (Lecturer course owner only)
 */
@Controller()
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Roles("LECTURER")
  @Post("cases/generate")
  @HttpCode(HttpStatus.CREATED)
  async generateCase(
    @Body()
    body: {
      courseId: string;
      materialIds: string[];
      topicHint?: string;
      numNodes?: number;
    },
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can generate cases");
    }
    const result = await this.caseService.generateCase(body.courseId, user.id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Get("courses/:courseId/cases")
  async getCasesByCourse(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const cases = await this.caseService.getCasesByCourse(courseId, user.role);
    return {
      status: "SUCCESS",
      data: cases,
    };
  }

  @Get("cases/:id")
  async getCaseById(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const caseData = await this.caseService.getCaseById(id, user.role, user.id);
    return {
      status: "SUCCESS",
      data: caseData,
    };
  }

  @Roles("LECTURER")
  @Put("cases/:id")
  async updateCase(
    @Param("id") id: string,
    @Body() body: { title?: string; description?: string; nodes?: any[] },
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can edit cases");
    }
    const updated = await this.caseService.updateCase(id, user.id, body);
    return {
      status: "SUCCESS",
      data: updated,
    };
  }

  @Roles("LECTURER")
  @Patch("cases/:id/status")
  async updateCaseStatus(
    @Param("id") id: string,
    @Body() body: { status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED" },
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can change case lifecycle status");
    }
    const result = await this.caseService.updateCaseStatus(id, user.id, body.status);
    return {
      status: "SUCCESS",
      data: result,
    };
  }
}
