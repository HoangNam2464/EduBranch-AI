import type { Course } from "@/types";

/**
 * Wire format of a course as the backend returns it today (raw SQL rows,
 * snake_case columns; see backend/src/modules/course/course.service.ts).
 * Requests already use camelCase DTOs. Mapping happens here, in one place,
 * so pages only ever see the typed domain model.
 */
export interface CourseRow {
  id: string;
  name: string;
  description: string | null;
  course_code: string | null;
  lecturer_id: string;
  active?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    courseCode: row.course_code ?? undefined,
    lecturerId: row.lecturer_id,
    active: row.active ?? row.is_active ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
