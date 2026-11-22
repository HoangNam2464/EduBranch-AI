import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateLecturerFeedbackDto } from "./dto/create-lecturer-feedback.dto";
import { SubmissionQueueQueryDto } from "./dto/submission-queue-query.dto";
import { LecturerFeedbackService } from "./lecturer-feedback.service";

/**
 * LecturerFeedbackController — E6, E7 routes (contracts/api.md §B).
 * Prefixed with /api/v1 by global prefix in main.ts.
 * Controller uses @Controller() without route prefix.
 */
@Controller()
export class LecturerFeedbackController {
  constructor(private readonly feedbackService: LecturerFeedbackService) {}

  /**
   * E6: POST /api/v1/lecturer-feedback
   * LECTURER role. Leave qualitative feedback on student work.
   */
  @Roles("LECTURER")
  @Post("lecturer-feedback")
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateLecturerFeedbackDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.feedbackService.create(user.id, dto);
    return {
      status: "SUCCESS",
      data,
    };
  }

  /**
   * E7: GET /api/v1/lecturer-feedback/submissions
   * LECTURER role. Submissions queue across courses/cases owned by lecturer.
   */
  @Roles("LECTURER")
  @Get("lecturer-feedback/submissions")
  async getQueue(
    @Query() query: SubmissionQueueQueryDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.feedbackService.getQueue(user.id, query);
    return {
      status: "SUCCESS",
      data,
    };
  }
}
