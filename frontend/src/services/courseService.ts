/**
 * EduBranch AI — Course Service
 * Lecturer course operations (backend `CourseController`, prefix /courses): list, read,
 * create, update, archive, and invite-code management.
 * Student course operations: join by invite code, my courses, and student desk dashboard.
 */

import apiClient from "@/services/apiClient";
import { Course } from "@/types";
import { toCourse, type CourseRow, type EnrolledCourse } from "@/services/mappers/course";
import { invalidateLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";

interface CreateCourseRequest {
  name: string;
  description?: string;
  courseCode?: string;
}

export interface StudentDashboardCase {
  id: string;
  title: string;
  description: string | null;
  learning_mode: string;
  course_id: string;
  status: string;
  course_name: string;
  course_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentDashboardAttempt {
  id: string;
  case_id: string;
  attempt_number: number;
  current_node_id: string;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  case_title: string;
  course_name: string;
}

export interface StudentDashboardData {
  enrolledCourses: EnrolledCourse[];
  recentCases: StudentDashboardCase[];
  activeCases: StudentDashboardAttempt[];
  stats: {
    totalEnrolled: number;
    totalActiveCases: number;
    totalPublishedCases: number;
  };
}

interface StudentDashboardRow {
  enrolledCourses: CourseRow[];
  recentCases: StudentDashboardCase[];
  activeCases: StudentDashboardAttempt[];
  stats: {
    totalEnrolled: number;
    totalActiveCases: number;
    totalPublishedCases: number;
  };
}

export interface InviteCodeResult {
  inviteCode: string | null;
  isActive: boolean;
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
    invalidateLecturerCourseCases();
    return toCourse(res.data.data);
  },

  async updateCourse(courseId: string, data: Partial<CreateCourseRequest>): Promise<Course> {
    const res = await apiClient.put<Envelope<CourseRow>>(`/courses/${courseId}`, data);
    invalidateLecturerCourseCases();
    return toCourse(res.data.data);
  },

  /**
   * Archives a course (`PATCH /courses/:courseId/archive`, owner lecturer, idempotent).
   * Courses are archived, never deleted (PO decision C1-B / OPD-014): materials and cases are kept,
   * the course leaves `GET /courses`, and uploads / case generation on it return 409.
   */
  async archiveCourse(courseId: string): Promise<Course> {
    const res = await apiClient.patch<Envelope<CourseRow>>(`/courses/${courseId}/archive`);
    invalidateLecturerCourseCases();
    return toCourse(res.data.data);
  },

  // ============================================================================
  // Student Portal Operations (BE-029 / FE-028)
  // ============================================================================

  /** Enroll current student into course via invite code (`POST /courses/enroll`). */
  async enrollCourse(inviteCode: string): Promise<EnrolledCourse> {
    const res = await apiClient.post<Envelope<CourseRow>>("/courses/enroll", { inviteCode });
    return toCourse(res.data.data);
  },

  /** Get enrolled courses for student (`GET /student/courses`). */
  async getStudentCourses(): Promise<EnrolledCourse[]> {
    const res = await apiClient.get<Envelope<CourseRow[]>>("/student/courses");
    return res.data.data.map(toCourse);
  },

  /** Get student dashboard data (`GET /student/dashboard`). */
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const res = await apiClient.get<Envelope<StudentDashboardRow>>("/student/dashboard");
    return {
      enrolledCourses: res.data.data.enrolledCourses.map(toCourse),
      recentCases: res.data.data.recentCases,
      activeCases: res.data.data.activeCases,
      stats: res.data.data.stats,
    };
  },

  // ============================================================================
  // Lecturer Invite Code Operations
  // ============================================================================

  /** Get or generate invite code for course (`GET /courses/:courseId/invite-code`). */
  async getInviteCode(courseId: string): Promise<InviteCodeResult> {
    const res = await apiClient.get<Envelope<InviteCodeResult>>(`/courses/${courseId}/invite-code`);
    return res.data.data;
  },

  /** Rotate invite code for course (`POST /courses/:courseId/invite-code`). */
  async rotateInviteCode(courseId: string): Promise<InviteCodeResult> {
    const res = await apiClient.post<Envelope<InviteCodeResult>>(`/courses/${courseId}/invite-code`);
    return res.data.data;
  },

  /** Disable invite code for course (`DELETE /courses/:courseId/invite-code`). */
  async disableInviteCode(courseId: string): Promise<InviteCodeResult> {
    const res = await apiClient.delete<Envelope<InviteCodeResult>>(`/courses/${courseId}/invite-code`);
    return res.data.data;
  },
};
