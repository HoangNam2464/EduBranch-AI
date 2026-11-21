import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { EvaluationService } from "./evaluation.service";
import { CreateRubricDto, ExportQueryDto, ListRubricsQueryDto, UpdateRubricDto } from "./dto/rubric.dto";

/**
 * Case quality rubric and anonymised research export (BE-033, spec 007 US4).
 * LECTURER (own courses) and ADMIN (all); STUDENT is refused on every route (AC-R3).
 *
 * GET    /api/v1/evaluation/rubrics?caseId=
 * GET    /api/v1/evaluation/rubrics/:id
 * POST   /api/v1/evaluation/rubrics
 * PUT    /api/v1/evaluation/rubrics/:id
 * DELETE /api/v1/evaluation/rubrics/:id
 * GET    /api/v1/evaluation/export?dataset=activity|rubrics&courseId=&caseId=
 */
@Roles("LECTURER", "ADMIN")
@Controller("evaluation")
export class EvaluationController {
  constructor(private readonly evaluation: EvaluationService) {}

  @Get("rubrics")
  async list(@CurrentUser() user: { id: string; role: string }, @Query() q: ListRubricsQueryDto) {
    return { status: "SUCCESS", data: await this.evaluation.list(user, q.caseId) };
  }

  @Get("rubrics/:id")
  async get(@CurrentUser() user: { id: string; role: string }, @Param("id", ParseUUIDPipe) id: string) {
    return { status: "SUCCESS", data: await this.evaluation.getById(user, id) };
  }

  @Post("rubrics")
  async create(@CurrentUser() user: { id: string; role: string }, @Body() dto: CreateRubricDto) {
    return { status: "SUCCESS", data: await this.evaluation.create(user, dto) };
  }

  @Put("rubrics/:id")
  async update(
    @CurrentUser() user: { id: string; role: string },
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRubricDto,
  ) {
    return { status: "SUCCESS", data: await this.evaluation.update(user, id, dto) };
  }

  @Delete("rubrics/:id")
  async remove(@CurrentUser() user: { id: string; role: string }, @Param("id", ParseUUIDPipe) id: string) {
    return { status: "SUCCESS", data: await this.evaluation.remove(user, id) };
  }

  @Get("export")
  async export(
    @CurrentUser() user: { id: string; role: string },
    @Query() q: ExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.evaluation.exportCsv(user, q);
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="edubranch-${q.dataset}-${day}.csv"`);
    res.setHeader("Cache-Control", "no-store");
    return csv;
  }
}
