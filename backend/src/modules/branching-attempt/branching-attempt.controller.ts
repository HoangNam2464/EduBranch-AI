import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  BranchingAttemptService,
  ChooseOptionDto,
  SaveReasoningDto,
  SubmitReflectionDto,
} from "./branching-attempt.service";

/**
 * BranchingAttemptController — Flow 4: Branching Study Lifecycle
 *
 * Routes (prefixed with /api/v1):
 *   POST /api/v1/cases/:caseId/branching-attempts   (Start or retry attempt)
 *   GET  /api/v1/cases/:caseId/attempts             (List student attempts for case)
 *   GET  /api/v1/branching-attempts/:id             (Get attempt details & steps)
 *   POST /api/v1/branching-attempts/:id/step        (Experience phase: pick option)
 *   PUT  /api/v1/branching-attempts/:id/reasoning   (Review phase: save retrospective reasoning)
 *   POST /api/v1/branching-attempts/:id/reflection  (Reflection submission)
 */
@Controller()
export class BranchingAttemptController {
  constructor(private readonly attemptService: BranchingAttemptService) {}

  @Post("cases/:caseId/branching-attempts")
  @HttpCode(HttpStatus.CREATED)
  async startAttempt(
    @Param("caseId") caseId: string,
    @Req() req: any,
  ) {
    const studentId = req.user?.id;
    const result = await this.attemptService.startAttempt(caseId, studentId);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Get("cases/:caseId/attempts")
  async getAttemptsByCase(
    @Param("caseId") caseId: string,
    @Req() req: any,
  ) {
    const studentId = req.user?.id;
    const attempts = await this.attemptService.getAttemptsByCase(caseId, studentId);
    return {
      status: "SUCCESS",
      data: attempts,
    };
  }

  @Get("branching-attempts/:id")
  async getAttempt(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    const studentId = req.user?.id;
    const result = await this.attemptService.getAttempt(id, studentId);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Post("branching-attempts/:id/step")
  async chooseOption(
    @Param("id") id: string,
    @Body() body: ChooseOptionDto,
  ) {
    const result = await this.attemptService.chooseOption(id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Put("branching-attempts/:id/reasoning")
  async saveRetrospectiveReasoning(
    @Param("id") id: string,
    @Body() body: SaveReasoningDto,
  ) {
    const result = await this.attemptService.saveRetrospectiveReasoning(id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Post("branching-attempts/:id/reflection")
  async submitReflection(
    @Param("id") id: string,
    @Body() body: SubmitReflectionDto,
  ) {
    const result = await this.attemptService.submitReflection(id, body);
    return {
      status: "SUCCESS",
      data: result,
    };
  }
}
