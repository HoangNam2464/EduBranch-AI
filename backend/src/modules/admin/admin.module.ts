import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AiHealthService } from "./ai-health.service";

@Module({
  controllers: [AdminController],
  providers: [AdminService, AiHealthService],
})
export class AdminModule {}
