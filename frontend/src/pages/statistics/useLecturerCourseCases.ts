import { useCallback, useEffect, useState } from "react";
import { courseService } from "@/services/courseService";
import { caseService } from "@/services/caseService";
import { materialService } from "@/services/materialService";
import { useAuthStore, onAuthLogout } from "@/stores/authStore";
import type { Case, CaseStatus, Course, TeachingMaterial } from "@/types";

/**
 * Courses of the signed-in lecturer with the cases (and optionally the teaching materials)
 * of each course — the only lecturer-side aggregate the backend can serve today:
 * `GET /courses`, then per course `GET /courses/:courseId/cases` and
 * `GET /courses/:courseId/materials`. Used by 07.1, 09.1 and 04.3.
 */
export interface CourseWithCases {
  course: Course;
  cases: Case[];
  /** Present only when the hook was asked for materials. */
  materials?: TeachingMaterial[];
}

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; code?: number; at: Date }
  | { status: "ready"; data: T };

export function httpStatusOf(error: unknown): number | undefined {
  const status = (error as { response?: { status?: unknown } })?.response?.status;
  return typeof status === "number" ? status : undefined;
}

// In-memory cache scoped strictly by userId and subKey to prevent cross-user data leakage
const CACHE_TTL_MS = 60000; // 60 seconds

interface CacheEntry {
  userId: string;
  subKey: string;
  data: CourseWithCases[];
  timestamp: number;
}

let globalCache: CacheEntry | null = null;

export function invalidateLecturerCourseCases(): void {
  globalCache = null;
}

// Reset cache whenever any user logs out
onAuthLogout(() => {
  invalidateLecturerCourseCases();
});

export function getFreshCache(userId: string, subKey: string, now: number = Date.now()): CourseWithCases[] | null {
  if (
    globalCache &&
    globalCache.userId === userId &&
    globalCache.subKey === subKey &&
    now - globalCache.timestamp < CACHE_TTL_MS
  ) {
    return globalCache.data;
  }
  return null;
}

export function setLecturerCourseCasesCache(
  userId: string,
  subKey: string,
  data: CourseWithCases[],
  timestamp: number = Date.now(),
): void {
  globalCache = { userId, subKey, data, timestamp };
}

export function useLecturerCourseCases({ withMaterials = false }: { withMaterials?: boolean } = {}) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "anonymous";
  const subKey = withMaterials ? "with-mat" : "no-mat";

  const [state, setState] = useState<LoadState<CourseWithCases[]>>(() => {
    const cached = getFreshCache(userId, subKey);
    return cached ? { status: "ready", data: cached } : { status: "loading" };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const cached = getFreshCache(userId, subKey);
    if (cached && attempt === 0) {
      setState({ status: "ready", data: cached });
    } else {
      setState({ status: "loading" });
    }

    (async () => {
      try {
        const courses = await courseService.getMyCourses();
        const data = await Promise.all(
          courses.map(async (course) => {
            const [cases, materials] = await Promise.all([
              caseService.getCasesByCourse(course.id),
              withMaterials ? materialService.getMaterialsByCourse(course.id) : Promise.resolve(undefined),
            ]);
            return { course, cases, materials };
          }),
        );

        setLecturerCourseCasesCache(userId, subKey, data);

        if (!cancelled) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (!cancelled) {
          // Never fall back to expired cache or cache belonging to another user
          const fresh = getFreshCache(userId, subKey);
          if (fresh && attempt === 0) {
            setState({ status: "ready", data: fresh });
          } else {
            setState({ status: "error", code: httpStatusOf(error), at: new Date() });
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, withMaterials, attempt, subKey]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}

export function countCases(items: CourseWithCases[], statuses: CaseStatus[]): number {
  return items.reduce((sum, { cases }) => sum + cases.filter((c) => statuses.includes(c.status)).length, 0);
}

/** Share of a course's materials whose AI ingestion COMPLETED (0–100), or null without materials. */
export function materialReadiness(materials: TeachingMaterial[] | undefined): number | null {
  if (!materials || materials.length === 0) return null;
  const ready = materials.filter((m) => m.processingStatus === "COMPLETED").length;
  return Math.round((ready / materials.length) * 100);
}

/**
 * Lecturer to-dos derived from real states (07.1 / 09.1 "Việc cần làm"):
 * materials whose indexing FAILED, DRAFT cases to review, REVIEWED cases to approve.
 */
export type LecturerTodo =
  | { kind: "draft" | "reviewed"; key: string; courseId: string; courseCode: string; courseName: string; count: number }
  | { kind: "materialFailed"; key: string; courseId: string; courseCode: string; courseName: string; filename: string };

export function lecturerTodos(items: CourseWithCases[]): LecturerTodo[] {
  const todos: LecturerTodo[] = [];
  for (const { course, cases, materials } of items) {
    const base = { courseId: course.id, courseCode: course.courseCode ?? "", courseName: course.name };
    for (const m of materials ?? []) {
      if (m.processingStatus === "FAILED") todos.push({ ...base, kind: "materialFailed", key: `m-${m.id}`, filename: m.originalFilename });
    }
    const drafts = cases.filter((c) => c.status === "DRAFT").length;
    const reviewed = cases.filter((c) => c.status === "REVIEWED").length;
    if (drafts > 0) todos.push({ ...base, kind: "draft", key: `d-${course.id}`, count: drafts });
    if (reviewed > 0) todos.push({ ...base, kind: "reviewed", key: `r-${course.id}`, count: reviewed });
  }
  return todos;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Lead glyph, title and meta line of a to-do, as worded on 07.1 ("List row") and 09.1. */
export function describeTodo(todo: LecturerTodo, t: Translate, variant: "dashboard" | "profile") {
  const code = todo.courseCode || todo.courseName;
  if (todo.kind === "materialFailed") {
    return { lead: "!", title: todo.filename, meta: t("g4.todo.materialFailed", { code }) };
  }
  if (todo.kind === "draft") {
    return {
      lead: String(todo.count),
      title: t(variant === "dashboard" ? "g4.todo.drafts" : "g4.todo.reviewDrafts", { count: todo.count }),
      meta: t(variant === "dashboard" ? "g4.todo.meta" : "g4.todo.metaCode", { code }),
    };
  }
  return {
    lead: String(todo.count),
    title: t("g4.todo.reviewed", { count: todo.count }),
    meta: t(variant === "dashboard" ? "g4.todo.meta" : "g4.todo.metaCode", { code }),
  };
}
