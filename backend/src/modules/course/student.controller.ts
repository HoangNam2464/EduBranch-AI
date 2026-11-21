import { Controller, Get } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * StudentController — Student Desk and Enrolled Courses.
 *
 * GET /api/v1/student/courses   — Courses enrolled by the signed-in student
 * GET /api/v1/student/dashboard — Enrolled courses, active cases & attempts
 */
@Controller("student")
export class StudentController {
  constructor(private readonly courseService: CourseService) {}

  @Roles("STUDENT")
  @Get("courses")
  async getStudentCourses(@CurrentUser() user: { id: string; role: string }) {
    const courses = await this.courseService.getStudentEnrolledCourses(user.id);
    return { status: "SUCCESS", data: courses };
  }

  @Roles("STUDENT")
  @Get("dashboard")
  async getStudentDashboard(@CurrentUser() user: { id: string; role: string }) {
    const data = await this.courseService.getStudentDashboard(user.id);
    return { status: "SUCCESS", data };
  }
}
