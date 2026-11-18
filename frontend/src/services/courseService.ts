/**
 * EduBranch AI — Course Service
 * Lecturer course operations (backend `CourseController`, prefix /courses): list, read,
 * create, update and archive. There is no delete route.
 */

import apiClient from "@/services/apiClient";
import { Course } from "@/types";
import { toCourse, type CourseRow } from "@/services/mappers/course";
import { invalidateLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";

interface CreateCourseRequest {
  name: string;
  description?: string;
  courseCode?: string;
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
};
