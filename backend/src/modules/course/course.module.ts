import { Module } from "@nestjs/common";
import { CourseController } from "./course.controller";
import { StudentController } from "./student.controller";
import { CourseService } from "./course.service";
import { LecturerDashboardController } from "./lecturer-dashboard.controller";
import { LecturerDashboardService } from "./lecturer-dashboard.service";
import { DatabaseModule } from "../../common/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [CourseController, StudentController, LecturerDashboardController],
  providers: [CourseService, LecturerDashboardService],
  exports: [CourseService],
})
export class CourseModule {}
