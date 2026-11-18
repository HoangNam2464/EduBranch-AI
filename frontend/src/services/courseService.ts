/**
 * EduBranch AI — Course Service
 * Lecturer & Student course operations (backend `CourseController`, prefix /courses).
 *
 * Lecturer: list, read, create, update, archive.
 * Student (FE-028): join by invite code (BE-029), list enrolled courses, student desk data.
 *
 * NON-NEGOTIABLE (OPD-001 -> A, FND §1.1):
 * - Students can only access courses they have joined via invite code or direct link.
 * - Browsing or searching un-enrolled courses is strictly prohibited.
 */

import apiClient from "@/services/apiClient";
import { Course } from "@/types";
import { toCourse, type CourseRow } from "@/services/mappers/course";

interface CreateCourseRequest {
  name: string;
  description?: string;
  courseCode?: string;
}

export interface StudentDeskDataRaw {
  enrolledCourses: CourseRow[];
  activeCases: any[];
  recentCases: any[];
}

export interface StudentDeskData {
  enrolledCourses: Course[];
  activeCases: any[];
  recentCases: any[];
}

type Envelope<T> = { status: string; data: T };

export const courseService = {
  /** Courses owned by the signed-in lecturer (`GET /courses`, LECTURER only). */
  async getMyCourses(): Promise<Course[]> {
    const res = await apiClient.get<Envelope<CourseRow[]>>("/courses");
    return res.data.data.map(toCourse);
  },

  async getCourseById(courseId: string): Promise<Course> {
    const res = await apiClient.get<Envelope<CourseRow>>(`/courses/${courseId}`);
    return toCourse(res.data.data);
  },

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    const res = await apiClient.post<Envelope<CourseRow>>("/courses", data);
    return toCourse(res.data.data);
  },

  async updateCourse(courseId: string, data: Partial<CreateCourseRequest>): Promise<Course> {
    const res = await apiClient.put<Envelope<CourseRow>>(`/courses/${courseId}`, data);
    return toCourse(res.data.data);
  },

  /**
   * Archives a course (`PATCH /courses/:courseId/archive`, owner lecturer, idempotent).
   * Courses are archived, never deleted (PO decision C1-B / OPD-014): materials and cases are kept,
   * the course leaves `GET /courses`, and uploads / case generation on it return 409.
   */
  async archiveCourse(courseId: string): Promise<Course> {
    const res = await apiClient.patch<Envelope<CourseRow>>(`/courses/${courseId}/archive`);
    return toCourse(res.data.data);
  },

  // ============================================================================
  // Student Enrolment & Desk Operations (FE-028 / BE-029)
  // ============================================================================

  /**
   * Enrolls student into a course using invite code (`POST /courses/join` - BE-029).
   * Validates invite code format and maps error responses (400/404 invalid, 410 expired, 409 already joined).
   */
  async joinCourseByInviteCode(inviteCode: string): Promise<Course> {
    const trimmed = inviteCode.trim().toUpperCase();
    if (!trimmed) {
      throw new Error("EMPTY_INVITE_CODE");
    }
    const res = await apiClient.post<Envelope<CourseRow>>("/courses/join", { inviteCode: trimmed });
    return toCourse(res.data.data);
  },

  /**
   * List of courses the signed-in student is enrolled in (`GET /student/courses`).
   * Only returns enrolled courses (AC-1, AC-3).
   */
  async getStudentCourses(): Promise<Course[]> {
    const res = await apiClient.get<Envelope<CourseRow[]>>("/student/courses");
    return res.data.data.map(toCourse);
  },

  /**
   * Data for the Student Desk ("Bàn học" - Figma 07.2).
   * Aggregates enrolled courses, active ongoing attempts, and published cases.
   */
  async getStudentDeskData(): Promise<StudentDeskData> {
    const res = await apiClient.get<Envelope<StudentDeskDataRaw>>("/student/desk");
    return {
      enrolledCourses: (res.data.data.enrolledCourses || []).map(toCourse),
      activeCases: res.data.data.activeCases || [],
      recentCases: res.data.data.recentCases || [],
    };
  },
};
