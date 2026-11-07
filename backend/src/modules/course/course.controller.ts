import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * CourseController — Lecturer Course Management.
 *
 * All routes require JWT authentication (global guard).
 *
 * POST   /api/v1/courses               — Create a new course
 * GET    /api/v1/courses               — List my courses (as lecturer)
 * GET    /api/v1/courses/:courseId     — Get course details
 * PUT    /api/v1/courses/:courseId     — Update course
 * DELETE /api/v1/courses/:courseId     — Delete course
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
  @Delete(":courseId")
  @HttpCode(HttpStatus.OK)
  async deleteCourse(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const result = await this.courseService.deleteCourse(courseId, user.id);
    return { status: "SUCCESS", data: result };
  }
}
