import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { EnrollCourseDto } from "./dto/enroll-course.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * CourseController — Course Management and Student Enrollment.
 *
 * All routes require JWT authentication (global guard).
 *
 * POST   /api/v1/courses               — Create a new course (Lecturer)
 * GET    /api/v1/courses               — List my courses (Lecturer)
 * POST   /api/v1/courses/enroll        — Enroll in course using invite code (Student)
 * GET    /api/v1/courses/:courseId     — Get course details
 * PUT    /api/v1/courses/:courseId     — Update course (Lecturer)
 * PATCH  /api/v1/courses/:courseId/archive — Archive course (Lecturer, soft, C1-B / OPD-014)
 * GET    /api/v1/courses/:courseId/invite-code — Get or generate invite code (Lecturer)
 * POST   /api/v1/courses/:courseId/invite-code — Rotate invite code (Lecturer)
 * DELETE /api/v1/courses/:courseId/invite-code — Disable invite code (Lecturer)
 */
@Controller("courses")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Roles("LECTURER")
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCourse(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const course = await this.courseService.createCourse(user.id, dto);
    return { status: "SUCCESS", data: course };
  }

  @Roles("LECTURER")
  @Get()
  async getMyCourses(@CurrentUser() user: { id: string; role: string }) {
    const courses = await this.courseService.getCoursesByLecturer(user.id);
    return { status: "SUCCESS", data: courses };
  }

  @Roles("STUDENT")
  @Post("enroll")
  @HttpCode(HttpStatus.OK)
  async enrollCourse(
    @Body() dto: EnrollCourseDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const course = await this.courseService.enrollStudentByInviteCode(
      user.id,
      dto.inviteCode,
    );
    return { status: "SUCCESS", data: course };
  }

  @Get(":courseId")
  async getCourse(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const course = await this.courseService.getCourseById(courseId, user.id);
    return { status: "SUCCESS", data: course };
  }

  @Roles("LECTURER")
  @Put(":courseId")
  async updateCourse(
    @Param("courseId") courseId: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const course = await this.courseService.updateCourse(courseId, user.id, dto);
    return { status: "SUCCESS", data: course };
  }

  @Roles("LECTURER")
  @Patch(":courseId/archive")
  @HttpCode(HttpStatus.OK)
  async archiveCourse(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const course = await this.courseService.archiveCourse(courseId, user.id);
    return { status: "SUCCESS", data: course };
  }

  @Roles("LECTURER")
  @Get(":courseId/invite-code")
  async getInviteCode(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.courseService.getInviteCode(courseId, user.id);
    return { status: "SUCCESS", data };
  }

  @Roles("LECTURER")
  @Post(":courseId/invite-code")
  async rotateInviteCode(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.courseService.rotateInviteCode(courseId, user.id);
    return { status: "SUCCESS", data };
  }

  @Roles("LECTURER")
  @Delete(":courseId/invite-code")
  async disableInviteCode(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const data = await this.courseService.disableInviteCode(courseId, user.id);
    return { status: "SUCCESS", data };
  }
}
