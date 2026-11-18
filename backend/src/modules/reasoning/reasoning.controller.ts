import { Controller, Get, Param } from "@nestjs/common";
import { ReasoningService } from "./reasoning.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller()
export class ReasoningController {
  constructor(private readonly reasoningService: ReasoningService) {}

  @Get("reasoning/:id")
  async getReasoningById(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reasoningService.getReasoningById(id, user);
    return {
      status: "SUCCESS",
      data,
    };
  }

  @Get("branching-attempts/:attemptId/reasonings")
  async getReasoningsByAttempt(
    @Param("attemptId") attemptId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reasoningService.getReasoningsByAttempt(attemptId, user);
    return {
      status: "SUCCESS",
      data,
    };
  }
}
