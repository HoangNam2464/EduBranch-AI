/**
 * EduBranch AI — Route path dictionary (single source of truth).
 *
 * Every URL used by the router, <Link>, <Navigate> and navigate() must come
 * from this file. Do not hardcode path strings in pages or layouts.
 *
 * Patterns with ":param" segments are filled with `buildPath()`.
 */

import type { Role } from "@/types";

export const PATHS = {
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    ADMIN_LOGIN: "/admin/login",
  },

  LECTURER: {
    ROOT: "/lecturer",
    DASHBOARD: "/lecturer/dashboard",
    COURSES: "/lecturer/courses",
    COURSE_MATERIALS: "/lecturer/courses/:courseId/materials",
    MATERIAL_SOURCES: "/lecturer/courses/:courseId/materials/:materialId/rag",
    COURSE_CASES: "/lecturer/courses/:courseId/cases",
    CASES: "/lecturer/cases",
    AI_STUDIO: "/lecturer/ai-studio",
    CASE_REVIEW: "/lecturer/cases/:caseId/review",
    CASE_RUBRIC: "/lecturer/cases/:caseId/rubric",
    CASE_FEEDBACK: "/lecturer/cases/:caseId/feedback",
    RUBRIC: "/lecturer/rubric",
    FEEDBACK: "/lecturer/feedback",
    FEEDBACK_DETAIL: "/lecturer/feedback/:submissionId",
    STATISTICS: "/lecturer/statistics",
    PROFILE: "/lecturer/profile",
    SETTINGS: "/lecturer/settings",
    FORBIDDEN: "/lecturer/403",
  },

  STUDENT: {
    ROOT: "/student",
    DESK: "/student/desk",
    COURSES: "/student/courses",
    HISTORY: "/student/history",
    BRANCHING_PLAY: "/student/cases/:caseId/branching-play",
    BRANCHING_REVIEW: "/student/cases/:caseId/attempt/:attemptId/review",
    REFLECTION: "/student/cases/:caseId/attempt/:attemptId/reflect",
    CASE_HISTORY: "/student/cases/:caseId/history",
    REVIEW_STUDY: "/student/cases/:caseId/review-study",
    REVIEW_FEEDBACK: "/student/cases/:caseId/review-study/:submissionId/feedback",
    CHALLENGE: "/student/cases/:caseId/challenge/:sessionId",
    PROFILE: "/student/profile",
    SETTINGS: "/student/settings",
    FORBIDDEN: "/student/403",
  },

  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    COURSES: "/admin/courses",
    CASES: "/admin/cases",
    RUBRIC: "/admin/rubric",
    LOGS: "/admin/logs",
    AI_SERVICE: "/admin/ai-service",
    SETTINGS: "/admin/settings",
    PROFILE: "/admin/profile",
    FORBIDDEN: "/admin/403",
  },
} as const;

/** Landing page of each role after sign-in or after a denied role check. */
export const ROLE_HOME: Record<Role, string> = {
  LECTURER: PATHS.LECTURER.COURSES,
  STUDENT: PATHS.STUDENT.ROOT,
  ADMIN: PATHS.ADMIN.DASHBOARD,
};

/** Route tree each role may enter (used to validate returnUrl after login). */
export const ROLE_ROOT: Record<Role, string> = {
  LECTURER: PATHS.LECTURER.ROOT,
  STUDENT: PATHS.STUDENT.ROOT,
  ADMIN: PATHS.ADMIN.ROOT,
};

/** `undefined` is accepted so values from useParams() can be passed as-is. */
type ParamValue = string | number | null | undefined;

/**
 * Fills ":param" segments of a path pattern.
 * Values are URI-encoded. A missing or empty param throws, so a broken link
 * fails loudly instead of navigating to "/x/undefined".
 *
 * @example buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: "c1" }) // "/lecturer/cases/c1/review"
 */
export function buildPath(pattern: string, params: Record<string, ParamValue> = {}): string {
  return pattern.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`buildPath: missing param "${key}" for "${pattern}"`);
    }
    return encodeURIComponent(String(value));
  });
}

/** Appends a query string built from the given entries (empty values are skipped). */
export function withQuery(path: string, query: Record<string, ParamValue | boolean>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}
