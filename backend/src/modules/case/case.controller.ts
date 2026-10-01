import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CaseService } from "./case.service";

/**
 * CaseController — Flow 2: AI Case Generation & Lecturer Review Lifecycle
 *
 * Routes (automatically prefixed with /api/v1):
 *   POST  /api/v1/cases/generate
 *   GET   /api/v1/courses/:courseId/cases
 *   GET   /api/v1/cases/:id
 *   PUT   /api/v1/cases/:id
 *   PATCH /api/v1/cases/:id/status
 */
@Controller()
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

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
    @Req() req: any,
  ) {
    const lecturerId = req.user?.id;
    const result = await this.caseService.generateCase(body.courseId, lecturerId, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Get("courses/:courseId/cases")
  async getCasesByCourse(
    @Param("courseId") courseId: string,
    @Req() req: any,
    @Query("role") role?: string,
  ) {
    const userRole = role || req.user?.role;
    const cases = await this.caseService.getCasesByCourse(courseId, userRole);
    return {
      status: "SUCCESS",
      data: cases,
    };
  }

  @Get("cases/:id")
  async getCaseById(
    @Param("id") id: string,
    @Req() req: any,
    @Query("role") role?: string,
  ) {
    const userRole = role || req.user?.role;
    const caseData = await this.caseService.getCaseById(id, userRole);
    return {
      status: "SUCCESS",
      data: caseData,
    };
  }

  @Put("cases/:id")
  async updateCase(
    @Param("id") id: string,
    @Body() body: { title?: string; description?: string; nodes?: any[] },
  ) {
    const updated = await this.caseService.updateCase(id, body);
    return {
      status: "SUCCESS",
      data: updated,
    };
  }

  @Patch("cases/:id/status")
  async updateCaseStatus(
    @Param("id") id: string,
    @Body() body: { status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED" },
  ) {
    const result = await this.caseService.updateCaseStatus(id, body.status);
    return {
      status: "SUCCESS",
      data: result,
    };
  }
}
