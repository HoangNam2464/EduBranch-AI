import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { randomUUID } from "crypto";

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly db: DatabaseService) {}

  async createCourse(lecturerId: string, dto: CreateCourseDto) {
    const courseId = randomUUID();
    const result = await this.db.query(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, course_code, lecturer_id, is_active AS active, is_active, created_at, updated_at`,
      [courseId, dto.name, dto.description ?? null, dto.courseCode ?? null, lecturerId],
    );
    this.logger.log(`Course created: ${courseId} by lecturer ${lecturerId}`);
    return result.rows[0];
  }

  async getCoursesByLecturer(lecturerId: string) {
    const result = await this.db.query(
      `SELECT id, name, description, course_code, lecturer_id, is_active AS active, is_active, created_at, updated_at
       FROM courses
       WHERE lecturer_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [lecturerId],
    );
    return result.rows;
  }

  async getCourseById(courseId: string, requesterId?: string) {
    const result = await this.db.query(
      `SELECT id, name, description, course_code, lecturer_id, is_active AS active, is_active, created_at, updated_at
       FROM courses
       WHERE id = $1`,
      [courseId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    return result.rows[0];
  }

  async updateCourse(courseId: string, lecturerId: string, dto: UpdateCourseDto) {
    const course = await this.getCourseById(courseId);

    if (course.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only edit your own courses");
    }

    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (dto.name !== undefined) { updates.push(`name = $${i++}`); params.push(dto.name); }
    if (dto.description !== undefined) { updates.push(`description = $${i++}`); params.push(dto.description); }
    if (dto.courseCode !== undefined) { updates.push(`course_code = $${i++}`); params.push(dto.courseCode); }

    if (updates.length === 0) return course;

    updates.push(`updated_at = NOW()`);
    params.push(courseId);

    const result = await this.db.query(
      `UPDATE courses SET ${updates.join(", ")} WHERE id = $${i}
       RETURNING id, name, description, course_code, lecturer_id, is_active AS active, is_active, created_at, updated_at`,
      params,
    );
    return result.rows[0];
  }

  /**
   * Soft-archive a course (C1-B, PO decision 2026-11-16; OPD-014 / PO Q4).
   * Sets is_active = FALSE and keeps every child record: teaching materials,
   * pgvector chunks, MinIO objects and cases are not touched. Archived courses
   * leave the lecturer's active list and reject new uploads and case generation.
   * Archiving an already archived course is a no-op that returns the course.
   */
  async archiveCourse(courseId: string, lecturerId: string) {
    const course = await this.getCourseById(courseId);

    if (course.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only archive your own courses");
    }

    if (course.is_active === false) {
      return course;
    }

    const result = await this.db.query(
      `UPDATE courses SET is_active = FALSE, updated_at = NOW() WHERE id = $1
       RETURNING id, name, description, course_code, lecturer_id, is_active AS active, is_active, created_at, updated_at`,
      [courseId],
    );
    this.logger.log(`Course archived: ${courseId} by lecturer ${lecturerId}`);
    return result.rows[0];
  }
}
