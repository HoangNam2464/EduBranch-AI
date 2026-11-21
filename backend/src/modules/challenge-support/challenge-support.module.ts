import { Module } from "@nestjs/common";
import { ChallengeSupportController } from "./challenge-support.controller";
import { ChallengeSupportService } from "./challenge-support.service";
import { DatabaseModule } from "../../common/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [ChallengeSupportController],
  providers: [ChallengeSupportService],
  exports: [ChallengeSupportService],
})
export class ChallengeSupportModule {}
