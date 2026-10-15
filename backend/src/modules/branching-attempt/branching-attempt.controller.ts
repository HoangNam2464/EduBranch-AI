import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from "@nestjs/common";
import {
  BranchingAttemptService,
  ChooseOptionDto,
  SaveReasoningDto,
  SubmitReflectionDto,
} from "./branching-attempt.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

/**
 * BranchingAttemptController — Flow 4: Branching Study Lifecycle
 *
 * Routes (prefixed with /api/v1):
 *   POST /api/v1/cases/:caseId/branching-attempts   (Start or retry attempt - Student only)
 *   GET  /api/v1/cases/:caseId/attempts             (List student attempts for case)
 *   GET  /api/v1/branching-attempts/:id             (Get attempt details & steps - Owner only)
 *   POST /api/v1/branching-attempts/:id/step        (Experience phase: pick option - Owner only)
 *   PUT  /api/v1/branching-attempts/:id/reasoning   (Review phase: save retrospective reasoning)
 *   POST /api/v1/branching-attempts/:id/reflection  (Reflection submission - Owner only)
 */
@Controller()
export class BranchingAttemptController {
  constructor(private readonly attemptService: BranchingAttemptService) {}

  @Post("cases/:caseId/branching-attempts")
  @HttpCode(HttpStatus.CREATED)
  async startAttempt(
    @Param("caseId") caseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can start branching attempts");
    }
    const result = await this.attemptService.startAttempt(caseId, user.id);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Get("cases/:caseId/attempts")
  async getAttemptsByCase(
    @Param("caseId") caseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const attempts = await this.attemptService.getAttemptsByCase(caseId, user.id);
    return {
      status: "SUCCESS",
      data: attempts,
    };
  }

  @Get("branching-attempts/:id")
  async getAttempt(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const result = await this.attemptService.getAttempt(id, user.id);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Post("branching-attempts/:id/step")
  async chooseOption(
    @Param("id") id: string,
    @Body() body: ChooseOptionDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can perform branching attempts");
    }
    const result = await this.attemptService.chooseOption(id, user.id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Put("branching-attempts/:id/reasoning")
  async saveRetrospectiveReasoning(
    @Param("id") id: string,
    @Body() body: SaveReasoningDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can submit reasoning");
    }
    const result = await this.attemptService.saveRetrospectiveReasoning(id, user.id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Post("branching-attempts/:id/reflection")
  async submitReflection(
    @Param("id") id: string,
    @Body() body: SubmitReflectionDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can submit reflections");
    }
    const result = await this.attemptService.submitReflection(id, user.id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }
}
