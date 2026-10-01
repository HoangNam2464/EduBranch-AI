import { Module } from "@nestjs/common";
import { BranchingAttemptController } from "./branching-attempt.controller";
import { BranchingAttemptService } from "./branching-attempt.service";

@Module({
  controllers: [BranchingAttemptController],
  providers: [BranchingAttemptService],
  exports: [BranchingAttemptService],
})
export class BranchingAttemptModule {}
