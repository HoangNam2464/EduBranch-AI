import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  GoneException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { randomUUID, randomInt } from "crypto";

export function generateInviteCode(length = 8): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(randomInt(0, chars.length));
  }
  return code;
}

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

  async getCourseForViewer(courseId: string, user?: { id?: string; role?: string }) {
    const role = user?.role;
    const userId = user?.id;
    if (role !== "ADMIN" && role !== "LECTURER" && role !== "STUDENT") {
      throw new ForbiddenException("Access denied");
    }
    if (role !== "ADMIN" && !userId) {
      throw new ForbiddenException("Access denied");
    }

    if (role === "ADMIN") {
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

    if (role === "LECTURER") {
      const result = await this.db.query(
        `SELECT id, name, description, course_code, lecturer_id, is_active AS active, is_active, created_at, updated_at
         FROM courses
         WHERE id = $1 AND lecturer_id = $2`,
        [courseId, userId],
      );
      if (result.rows.length === 0) {
        const existsRes = await this.db.query("SELECT id FROM courses WHERE id = $1", [courseId]);
        if (existsRes.rows.length === 0) {
          throw new NotFoundException(`Course ${courseId} not found`);
        }
        throw new ForbiddenException("You can only view your own courses");
      }
      return result.rows[0];
    }

    const result = await this.db.query(
      `SELECT c.id, c.name, c.description, c.course_code, c.is_active AS active, c.is_active, c.created_at, c.updated_at
       FROM courses c
       WHERE c.id = $1
         AND (
           EXISTS (SELECT 1 FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.student_id = $2)
           OR EXISTS (SELECT 1 FROM cases cs WHERE cs.course_id = c.id AND cs.status = 'PUBLISHED')
         )`,
      [courseId, userId],
    );
    if (result.rows.length === 0) {
      const existsRes = await this.db.query("SELECT id FROM courses WHERE id = $1", [courseId]);
      if (existsRes.rows.length === 0) {
        throw new NotFoundException(`Course ${courseId} not found`);
      }
      throw new ForbiddenException("You do not have access to this course");
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

  // ==============================================================================
  // Invite Code Management (Lecturer)
  // ==============================================================================

  async getInviteCode(courseId: string, lecturerId: string) {
    const result = await this.db.query(
      `SELECT lecturer_id, invite_code, invite_code_active FROM courses WHERE id = $1`,
      [courseId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    const course = result.rows[0];
    if (course.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only manage invite codes for your own courses");
    }

    return {
      inviteCode: course.invite_code || null,
      isActive: course.invite_code ? course.invite_code_active !== false : false,
    };
  }

  async getOrGenerateInviteCode(courseId: string, lecturerId: string) {
    return this.getInviteCode(courseId, lecturerId);
  }

  async rotateInviteCode(courseId: string, lecturerId: string) {
    const course = await this.getCourseById(courseId);
    if (course.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only rotate invite codes for your own courses");
    }
    if (course.is_active === false) {
      throw new ConflictException("Course is archived");
    }

    const maxRetries = 5;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const newCode = generateInviteCode();
      try {
        await this.db.query(
          `UPDATE courses SET invite_code = $1, invite_code_active = TRUE, updated_at = NOW() WHERE id = $2`,
          [newCode, courseId],
        );
        this.logger.log(`Invite code rotated for course ${courseId}`);
        return { inviteCode: newCode, isActive: true };
      } catch (err: any) {
        if (err?.code === "23505" && attempt < maxRetries - 1) {
          continue;
        }
        if (err?.code === "23505") {
          throw new ConflictException("Failed to generate a unique invite code, please try again");
        }
        throw err;
      }
    }
    throw new ConflictException("Failed to generate a unique invite code, please try again");
  }

  async disableInviteCode(courseId: string, lecturerId: string) {
    const course = await this.getCourseById(courseId);
    if (course.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only disable invite codes for your own courses");
    }

    const result = await this.db.query(
      `UPDATE courses SET invite_code_active = FALSE, updated_at = NOW() WHERE id = $1
       RETURNING invite_code, invite_code_active`,
      [courseId],
    );
    this.logger.log(`Invite code disabled for course ${courseId}`);
    const row = result.rows[0];
    return { inviteCode: row?.invite_code || null, isActive: false };
  }

  // ==============================================================================
  // Student Enrollment (BE-029)
  // ==============================================================================

  async enrollStudentByInviteCode(studentId: string, inviteCode: string) {
    const trimmed = (inviteCode || "").trim().toUpperCase();
    if (!trimmed) {
      throw new BadRequestException("Invite code is required");
    }

    const courseRes = await this.db.query(
      `SELECT id, name, description, course_code, lecturer_id, is_active AS active, is_active, invite_code, invite_code_active, created_at, updated_at
       FROM courses
       WHERE invite_code = $1`,
      [trimmed],
    );

    if (courseRes.rows.length === 0) {
      throw new NotFoundException("Invalid invite code");
    }

    const course = courseRes.rows[0];

    if (course.is_active === false) {
      throw new ConflictException("Course is archived");
    }

    if (course.invite_code_active === false) {
      throw new GoneException("Invite code has expired or is disabled");
    }

    const enrollmentId = randomUUID();
    let insertRes;
    try {
      insertRes = await this.db.query(
        `INSERT INTO course_enrollments (id, course_id, student_id, enrolled_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (course_id, student_id) DO NOTHING
         RETURNING id`,
        [enrollmentId, course.id, studentId],
      );
    } catch (err: any) {
      if (err?.code === "23505") {
        throw new ConflictException("Already enrolled in this course");
      }
      throw err;
    }

    if (!insertRes || insertRes.rows.length === 0) {
      throw new ConflictException("Already enrolled in this course");
    }

    this.logger.log(`Student ${studentId} enrolled in course ${course.id}`);
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      course_code: course.course_code,
      lecturer_id: course.lecturer_id,
      active: course.active,
      is_active: course.is_active,
      created_at: course.created_at,
      updated_at: course.updated_at,
    };
  }

  async getStudentEnrolledCourses(studentId: string) {
    const result = await this.db.query(
      `SELECT c.id, c.name, c.description, c.course_code, c.lecturer_id, c.is_active AS active, c.is_active, c.created_at, c.updated_at, ce.enrolled_at
       FROM course_enrollments ce
       JOIN courses c ON c.id = ce.course_id
       WHERE ce.student_id = $1 AND c.is_active = TRUE
       ORDER BY ce.enrolled_at DESC`,
      [studentId],
    );
    return result.rows;
  }

  async getStudentDashboard(studentId: string) {
    const enrolledCourses = await this.getStudentEnrolledCourses(studentId);

    const casesRes = await this.db.query(
      `SELECT cs.id, cs.title, cs.description, cs.learning_mode, cs.course_id, cs.status, cs.created_at, cs.updated_at, c.name AS course_name, c.course_code
       FROM cases cs
       JOIN course_enrollments ce ON ce.course_id = cs.course_id
       JOIN courses c ON c.id = cs.course_id
       WHERE ce.student_id = $1 AND cs.status = 'PUBLISHED' AND c.is_active = TRUE
       ORDER BY cs.created_at DESC`,
      [studentId],
    );

    const attemptsRes = await this.db.query(
      `SELECT ba.id, ba.case_id, ba.attempt_number, ba.current_node_id, ba.is_completed, ba.started_at, ba.completed_at, cs.title AS case_title, c.name AS course_name
       FROM branching_attempts ba
       JOIN cases cs ON cs.id = ba.case_id
       JOIN course_enrollments ce ON ce.course_id = cs.course_id
       JOIN courses c ON c.id = cs.course_id
       WHERE ba.student_id = $1 AND ba.is_completed = FALSE AND cs.status = 'PUBLISHED' AND c.is_active = TRUE
       ORDER BY ba.started_at DESC`,
      [studentId],
    );

    return {
      enrolledCourses,
      recentCases: casesRes.rows,
      activeCases: attemptsRes.rows,
      stats: {
        totalEnrolled: enrolledCourses.length,
        totalActiveCases: attemptsRes.rows.length,
        totalPublishedCases: casesRes.rows.length,
      },
    };
  }
}
