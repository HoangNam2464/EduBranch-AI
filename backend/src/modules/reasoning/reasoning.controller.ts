import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { ReasoningService } from "./reasoning.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller()
export class ReasoningController {
  constructor(private readonly reasoningService: ReasoningService) {}

  @Roles("STUDENT")
  @Get("reasoning/:id")
  async getReasoningById(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reasoningService.getReasoningById(id, user.id);
    return {
      status: "SUCCESS",
      data,
    };
  }

  @Roles("STUDENT")
  @Get("branching-attempts/:attemptId/reasonings")
  async getReasoningsByAttempt(
    @Param("attemptId", ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.reasoningService.getReasoningsByAttempt(attemptId, user.id);
    return {
      status: "SUCCESS",
      data,
    };
  }
}
