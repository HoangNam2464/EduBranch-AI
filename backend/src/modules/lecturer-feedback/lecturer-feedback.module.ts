import { Module } from "@nestjs/common";
import { LecturerFeedbackController } from "./lecturer-feedback.controller";
import { LecturerFeedbackService } from "./lecturer-feedback.service";

@Module({
  controllers: [LecturerFeedbackController],
  providers: [LecturerFeedbackService],
  exports: [LecturerFeedbackService],
})
export class LecturerFeedbackModule {}
