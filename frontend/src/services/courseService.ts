/**
 * EduBranch AI — Course Service
 * CRUD operations for lecturer courses.
 */

import apiClient from "./apiClient";
import { Course } from "../types";

interface CreateCourseRequest {
  name: string;
  description?: string;
  courseCode?: string;
}

export const courseService = {
  async getMyCourses(): Promise<Course[]> {
    try {
      const res = await apiClient.get<{ status: string; data: Course[] }>("/courses/my-courses");
      return res.data.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await apiClient.get<{ status: string; data: Course[] }>("/courses");
        return fallback.data.data;
      }
      throw err;
    }
  },

  async getCourseById(courseId: string): Promise<Course> {
    const res = await apiClient.get<{ status: string; data: Course }>(`/courses/${courseId}`);
    return res.data.data;
  },

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    const res = await apiClient.post<{ status: string; data: Course }>("/courses", data);
    return res.data.data;
  },

  async updateCourse(courseId: string, data: Partial<CreateCourseRequest>): Promise<Course> {
    const res = await apiClient.put<{ status: string; data: Course }>(`/courses/${courseId}`, data);
    return res.data.data;
  },

  async deleteCourse(courseId: string): Promise<void> {
    await apiClient.delete(`/courses/${courseId}`);
  },
};
