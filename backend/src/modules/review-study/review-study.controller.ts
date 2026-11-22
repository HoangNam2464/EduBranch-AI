import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { SubmitReflectionDto } from "./dto/submit-reflection.dto";
import { SubmitReviewStudyDto } from "./dto/submit-review-study.dto";
import { ReviewStudyService } from "./review-study.service";

/**
 * ReviewStudyController — E1..E5 routes (contracts/api.md §A, C1-A).
 * Prefixed with /api/v1 by global prefix in main.ts.
 * Controller uses @Controller() without route prefix.
 */
@Controller()
export class ReviewStudyController {
  constructor(private readonly reviewStudyService: ReviewStudyService) {}

  /**
   * E1: POST /api/v1/cases/:caseId/review-study/submit
   * STUDENT role. Submits Review Study solution.
   */
  @Roles("STUDENT")
  @Post("cases/:caseId/review-study/submit")
  @HttpCode(HttpStatus.CREATED)
  async submit(
    @Param("caseId", ParseUUIDPipe) caseId: string,
    @Body() dto: SubmitReviewStudyDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reviewStudyService.submit(caseId, user.id, dto);
    return {
      status: "SUCCESS",
      data,
    };
  }

  /**
   * E2: GET /api/v1/cases/:caseId/review-study/submissions/me
   * STUDENT role. Gets current student's submission for case.
   */
  @Roles("STUDENT")
  @Get("cases/:caseId/review-study/submissions/me")
  async getMine(
    @Param("caseId", ParseUUIDPipe) caseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reviewStudyService.getMine(caseId, user.id);
    return {
      status: "SUCCESS",
      data,
    };
  }

  /**
   * E3: GET /api/v1/review-study/submissions/:submissionId
   * STUDENT (author) or LECTURER (course owner).
   */
  @Roles("STUDENT", "LECTURER")
  @Get("review-study/submissions/:submissionId")
  async getById(
    @Param("submissionId", ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reviewStudyService.getById(submissionId, user);
    return {
      status: "SUCCESS",
      data,
    };
  }

  /**
   * E4: POST /api/v1/review-study/submissions/:submissionId/reflection
   * STUDENT role (author only).
   */
  @Roles("STUDENT")
  @Post("review-study/submissions/:submissionId/reflection")
  @HttpCode(HttpStatus.OK)
  async submitReflection(
    @Param("submissionId", ParseUUIDPipe) submissionId: string,
    @Body() dto: SubmitReflectionDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reviewStudyService.submitReflection(submissionId, user.id, dto);
    return {
      status: "SUCCESS",
      data,
    };
  }

  /**
   * E5: GET /api/v1/review-study/submissions/:submissionId/feedback
   * STUDENT role (author only).
   */
  @Roles("STUDENT")
  @Get("review-study/submissions/:submissionId/feedback")
  async getFeedback(
    @Param("submissionId", ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reviewStudyService.getFeedback(submissionId, user.id);
    return {
      status: "SUCCESS",
      data,
    };
  }
}
