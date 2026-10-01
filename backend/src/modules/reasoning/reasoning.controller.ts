import { Controller, Get, Param } from "@nestjs/common";
import { ReasoningService } from "./reasoning.service";

@Controller()
export class ReasoningController {
  constructor(private readonly reasoningService: ReasoningService) {}

  @Get("reasoning/:id")
  async getReasoningById(@Param("id") id: string) {
    const data = await this.reasoningService.getReasoningById(id);
    return {
      status: "SUCCESS",
      data,
    };
  }

  @Get("branching-attempts/:attemptId/reasonings")
  async getReasoningsByAttempt(@Param("attemptId") attemptId: string) {
    const data = await this.reasoningService.getReasoningsByAttempt(attemptId);
    return {
      status: "SUCCESS",
      data,
    };
  }
}
