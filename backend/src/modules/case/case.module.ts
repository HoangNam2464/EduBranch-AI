import { Module } from "@nestjs/common";
import { CaseController } from "./case.controller";
import { CaseService } from "./case.service";
import { DatabaseModule } from "../../common/database/database.module";
import { AiClientModule } from "../../common/ai-client/ai-client.module";

@Module({
  imports: [DatabaseModule, AiClientModule],
  controllers: [CaseController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
