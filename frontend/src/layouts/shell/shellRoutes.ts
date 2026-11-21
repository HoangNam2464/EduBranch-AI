/**
 * EduBranch AI — App shell route logic (pure, unit-tested).
 *
 * Decides, from the current URL, which sidebar menu to show, which item is
 * active and which page title the header shows. Mirrors Figma page EduBranch AI – Screens:
 * - Lecturer: Khóa học · Case Study · Phản hồi sinh viên · Thống kê học tập
 *   (dashboard 07.1 and profile 09.1 have no active item).
 * - Student, main area: Bàn học · Khóa học của tôi · Tham gia lớp học.
 * - Student inside a Branching case (05.x): Tình huống · Lịch sử lần làm · Journey Review.
 * - Student inside a Review Study case (06.x): Bài làm · Phản hồi.
 * - Admin: 8 items (10.x).
 */

import { matchPath } from "react-router-dom";
import { PATHS, buildPath, withQuery } from "@/routes/paths";
import type { Role } from "@/types";

/** Lucide icon names used by the sidebar (mapped to components in Sidebar.tsx). */
export type ShellIconName =
  | "book-open"
  | "git-branch"
  | "message-square"
  | "chart-column"
  | "layout-dashboard"
  | "key-round"
  | "users"
  | "flask-conical"
  | "file-text"
  | "cpu"
  | "sliders-horizontal"
  | "compass"
  | "rotate-ccw"
  | "square-pen"
  | "pen-line"
  | "user-check";

export interface ShellNavItem {
  id: string;
  labelKey: string;
  icon: ShellIconName;
  /** Target URL; null when the destination does not exist yet (item is disabled). */
  to: string | null;
  active: boolean;
  /** Tooltip / screen-reader hint shown when the item is disabled. */
  disabledHintKey?: string;
}

export interface ShellNav {
  workspaceKey: string;
  items: ShellNavItem[];
}

export interface ShellLocation {
  pathname: string;
  search: string;
}

const startsWithPath = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const match = (pattern: string, pathname: string) => matchPath({ path: pattern, end: true }, pathname);

function isJoinClass(search: string): boolean {
  return new URLSearchParams(search).get("join") === "true";
}

function lecturerNav({ pathname }: ShellLocation): ShellNav {
  const L = PATHS.LECTURER;
  const casesArea =
    startsWithPath(pathname, L.CASES) || startsWithPath(pathname, L.AI_STUDIO) || startsWithPath(pathname, L.RUBRIC);
  return {
    workspaceKey: "shell.workspace.lecturer",
    items: [
      { id: "courses", labelKey: "nav.lecturer.courses", icon: "book-open", to: L.COURSES, active: startsWithPath(pathname, L.COURSES) },
      { id: "cases", labelKey: "nav.lecturer.cases", icon: "git-branch", to: L.CASES, active: casesArea },
      { id: "feedback", labelKey: "nav.lecturer.feedback", icon: "message-square", to: L.FEEDBACK, active: startsWithPath(pathname, L.FEEDBACK) },
      { id: "statistics", labelKey: "nav.lecturer.statistics", icon: "chart-column", to: L.STATISTICS, active: startsWithPath(pathname, L.STATISTICS) },
    ],
  };
}

function adminNav({ pathname }: ShellLocation): ShellNav {
  const A = PATHS.ADMIN;
  const item = (id: string, labelKey: string, icon: ShellIconName, to: string, active = startsWithPath(pathname, to)) => ({
    id,
    labelKey,
    icon,
    to,
    active,
  });
  return {
    workspaceKey: "shell.workspace.admin",
    items: [
      item("dashboard", "nav.admin.dashboard", "layout-dashboard", A.DASHBOARD, pathname === A.ROOT || startsWithPath(pathname, A.DASHBOARD)),
      item("users", "nav.admin.users", "users", A.USERS),
      item("courses", "nav.admin.courses", "book-open", A.COURSES),
      item("cases", "nav.admin.cases", "git-branch", A.CASES),
      item("rubric", "nav.admin.rubric", "flask-conical", A.RUBRIC),
      item("logs", "nav.admin.logs", "file-text", A.LOGS),
      item("aiService", "nav.admin.aiService", "cpu", A.AI_SERVICE),
      item("settings", "nav.admin.settings", "sliders-horizontal", A.SETTINGS),
    ],
  };
}

function studentNav({ pathname, search }: ShellLocation): ShellNav {
  const S = PATHS.STUDENT;

  // Review Study case context (06.x)
  const reviewFeedback = match(S.REVIEW_FEEDBACK, pathname);
  const reviewStudy = match(S.REVIEW_STUDY, pathname);
  if (reviewFeedback || reviewStudy) {
    const caseId = (reviewFeedback ?? reviewStudy)!.params.caseId!;
    const submissionId = reviewFeedback?.params.submissionId;
    return {
      workspaceKey: "shell.workspace.student",
      items: [
        { id: "work", labelKey: "nav.studentReview.work", icon: "pen-line", to: buildPath(S.REVIEW_STUDY, { caseId }), active: Boolean(reviewStudy) },
        {
          id: "feedback",
          labelKey: "nav.studentReview.feedback",
          icon: "user-check",
          to: submissionId ? buildPath(S.REVIEW_FEEDBACK, { caseId, submissionId }) : null,
          active: Boolean(reviewFeedback),
          disabledHintKey: "nav.studentReview.feedbackUnavailable",
        },
      ],
    };
  }

  // Branching case context (05.x)
  const play = match(S.BRANCHING_PLAY, pathname);
  const history = match(S.CASE_HISTORY, pathname);
  const review = match(S.BRANCHING_REVIEW, pathname);
  const reflect = match(S.REFLECTION, pathname);
  const challenge = match(S.CHALLENGE, pathname);
  const caseMatch = play ?? history ?? review ?? reflect ?? challenge;
  if (caseMatch) {
    const caseId = caseMatch.params.caseId!;
    const attemptId = (review ?? reflect)?.params.attemptId;
    return {
      workspaceKey: "shell.workspace.student",
      items: [
        { id: "case", labelKey: "nav.studentCase.case", icon: "compass", to: buildPath(S.BRANCHING_PLAY, { caseId }), active: Boolean(play) },
        { id: "history", labelKey: "nav.studentCase.history", icon: "rotate-ccw", to: buildPath(S.CASE_HISTORY, { caseId }), active: Boolean(history) },
        {
          id: "journey",
          labelKey: "nav.studentCase.journey",
          icon: "square-pen",
          to: attemptId ? buildPath(S.BRANCHING_REVIEW, { caseId, attemptId }) : null,
          active: Boolean(review ?? reflect ?? challenge),
          disabledHintKey: "nav.studentCase.journeyUnavailable",
        },
      ],
    };
  }

  // Main student area (07.x)
  const onCourses = startsWithPath(pathname, S.COURSES);
  const join = onCourses && isJoinClass(search);
  return {
    workspaceKey: "shell.workspace.student",
    items: [
      { id: "desk", labelKey: "nav.student.desk", icon: "layout-dashboard", to: S.ROOT, active: pathname === S.ROOT || startsWithPath(pathname, S.DESK) },
      { id: "courses", labelKey: "nav.student.courses", icon: "book-open", to: S.COURSES, active: onCourses && !join },
      { id: "join", labelKey: "nav.student.joinClass", icon: "key-round", to: withQuery(S.COURSES, { join: true }), active: join },
    ],
  };
}

/** Sidebar menu for a role at the given location. */
export function resolveShellNav(role: Role, location: ShellLocation): ShellNav {
  if (role === "LECTURER") return lecturerNav(location);
  if (role === "ADMIN") return adminNav(location);
  return studentNav(location);
}

/** [pattern, title key] — first match wins; patterns are matched exactly. */
const TITLE_TABLE: Array<[string, string]> = [
  [PATHS.LECTURER.ROOT, "shell.titles.lecturerDashboard"],
  [PATHS.LECTURER.DASHBOARD, "shell.titles.lecturerDashboard"],
  [PATHS.LECTURER.COURSES, "shell.titles.courses"],
  [PATHS.LECTURER.COURSE_MATERIALS, "shell.titles.courseDetail"],
  [PATHS.LECTURER.MATERIAL_SOURCES, "shell.titles.materialSources"],
  [PATHS.LECTURER.COURSE_CASES, "shell.titles.cases"],
  [PATHS.LECTURER.CASES, "shell.titles.cases"],
  [PATHS.LECTURER.AI_STUDIO, "shell.titles.aiStudio"],
  [PATHS.LECTURER.CASE_REVIEW, "shell.titles.caseEditor"],
  [PATHS.LECTURER.CASE_RUBRIC, "shell.titles.rubric"],
  [PATHS.LECTURER.RUBRIC, "shell.titles.rubric"],
  [PATHS.LECTURER.CASE_FEEDBACK, "shell.titles.feedbackQueue"],
  [PATHS.LECTURER.FEEDBACK, "shell.titles.feedbackQueue"],
  [PATHS.LECTURER.FEEDBACK_DETAIL, "shell.titles.feedbackDetail"],
  [PATHS.LECTURER.STATISTICS, "shell.titles.statistics"],
  [PATHS.LECTURER.PROFILE, "shell.titles.profile"],
  [PATHS.LECTURER.SETTINGS, "shell.titles.profile"],

  [PATHS.STUDENT.ROOT, "shell.titles.desk"],
  [PATHS.STUDENT.DESK, "shell.titles.desk"],
  [PATHS.STUDENT.COURSES, "shell.titles.myCourses"],
  [PATHS.STUDENT.HISTORY, "shell.titles.attemptHistory"],
  [PATHS.STUDENT.CASE_HISTORY, "shell.titles.attemptHistory"],
  [PATHS.STUDENT.BRANCHING_PLAY, "shell.titles.case"],
  [PATHS.STUDENT.BRANCHING_REVIEW, "shell.titles.journeyReview"],
  [PATHS.STUDENT.CHALLENGE, "shell.titles.journeyReview"],
  [PATHS.STUDENT.REFLECTION, "shell.titles.reflection"],
  [PATHS.STUDENT.REVIEW_STUDY, "shell.titles.reviewStudy"],
  [PATHS.STUDENT.REVIEW_FEEDBACK, "shell.titles.reviewStudy"],
  [PATHS.STUDENT.PROFILE, "shell.titles.profile"],
  [PATHS.STUDENT.SETTINGS, "shell.titles.profile"],

  [PATHS.ADMIN.ROOT, "shell.titles.adminDashboard"],
  [PATHS.ADMIN.DASHBOARD, "shell.titles.adminDashboard"],
  [PATHS.ADMIN.USERS, "shell.titles.adminUsers"],
  [PATHS.ADMIN.COURSES, "shell.titles.adminCourses"],
  [PATHS.ADMIN.CASES, "shell.titles.adminCases"],
  [PATHS.ADMIN.RUBRIC, "shell.titles.adminRubric"],
  [PATHS.ADMIN.LOGS, "shell.titles.adminLogs"],
  [PATHS.ADMIN.AI_SERVICE, "shell.titles.adminAiService"],
  [PATHS.ADMIN.SETTINGS, "shell.titles.adminSettings"],
  [PATHS.ADMIN.PROFILE, "shell.titles.profile"],
];

/**
 * Default header title key for a location. Screens that show a record name
 * (course, case) override it at runtime with useShellTitle().
 */
export function resolveTitleKey({ pathname, search }: ShellLocation): string | null {
  if (pathname === PATHS.STUDENT.COURSES && isJoinClass(search)) return "shell.titles.joinClass";
  for (const [pattern, key] of TITLE_TABLE) {
    if (match(pattern, pathname)) return key;
  }
  return null;
}

/** Where "Hồ sơ", "Cài đặt" and sign-out lead for each role. */
export const ROLE_SHELL_LINKS: Record<Role, { profile: string; settings: string; signedOut: string }> = {
  LECTURER: { profile: PATHS.LECTURER.PROFILE, settings: PATHS.LECTURER.SETTINGS, signedOut: PATHS.AUTH.LOGIN },
  STUDENT: { profile: PATHS.STUDENT.PROFILE, settings: PATHS.STUDENT.SETTINGS, signedOut: PATHS.AUTH.LOGIN },
  ADMIN: { profile: PATHS.ADMIN.PROFILE, settings: PATHS.ADMIN.SETTINGS, signedOut: PATHS.AUTH.ADMIN_LOGIN },
};

/** Search placeholder per role (header search, Figma EB/Header Actions). */
export const ROLE_SEARCH_PLACEHOLDER: Record<Role, string> = {
  LECTURER: "shell.search.lecturer",
  STUDENT: "shell.search.student",
  ADMIN: "shell.search.admin",
};

/** Avatar initials: first + last word of the name, ignoring academic titles. */
export function initialsOf(fullName: string | undefined | null): string {
  const words = (fullName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !/^(TS|ThS|PGS|GS|CN|KS)\.?$/i.test(w.replace(/\.$/, "")) && !/\.$/.test(w));
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}
