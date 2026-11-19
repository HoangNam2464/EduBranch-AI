import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ChallengeSupportService } from "./challenge-support.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SendReplyDto } from "./dto/send-reply.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * ChallengeSupportController — AI Reasoning / Challenge Support API.
 *
 * Socratic counter-questions only, maximum 2 rounds hard cap.
 * Zero grading, scoring, or pass/fail evaluation.
 *
 * Routes (under global prefix /api/v1):
 *   POST /api/v1/challenge-support/sessions            (Create or get session, generates Round 1 question)
 *   POST /api/v1/challenge-support/sessions/:id/replies (Send reply for Round 1, generates Round 2 question, marks completed)
 *   GET  /api/v1/challenge-support/sessions/:id        (Get session and message history)
 *   POST /api/v1/challenge-support/sessions/:id/complete (Conclude session early)
 */
@Roles("STUDENT")
@Controller("challenge-support")
export class ChallengeSupportController {
  constructor(private readonly service: ChallengeSupportService) {}

  @Post("sessions")
  @HttpCode(HttpStatus.OK)
  async createOrGetSession(
    @Body() dto: CreateSessionDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can use challenge support");
    }
    const session = await this.service.createOrGetSession(user.id, dto);
    return {
      status: "SUCCESS",
      data: session,
    };
  }

  @Post("sessions/:id/replies")
  @HttpCode(HttpStatus.OK)
  async sendReply(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendReplyDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can reply to challenge support");
    }
    const session = await this.service.sendReply(user.id, id, dto);
    return {
      status: "SUCCESS",
      data: session,
    };
  }

  @Get("sessions/:id")
  async getSession(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const session = await this.service.getSession(user.id, id);
    return {
      status: "SUCCESS",
      data: session,
    };
  }

  @Post("sessions/:id/complete")
  @HttpCode(HttpStatus.OK)
  async completeSession(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Only students can complete challenge support");
    }
    const session = await this.service.completeSession(user.id, id);
    return {
      status: "SUCCESS",
      data: session,
    };
  }
}
