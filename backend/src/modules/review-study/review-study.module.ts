import { Module } from "@nestjs/common";
import { ReviewStudyController } from "./review-study.controller";
import { ReviewStudyService } from "./review-study.service";

@Module({
  controllers: [ReviewStudyController],
  providers: [ReviewStudyService],
  exports: [ReviewStudyService],
})
export class ReviewStudyModule {}
