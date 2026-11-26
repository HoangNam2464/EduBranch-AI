/**
 * Navigation targets of the case-quality rubric screens (FE-029, PO decisions D3a/D3c, Figma 10.8 header).
 * Pure so it runs under the Node test runner.
 */
import { PATHS, buildPath } from "../../routes/paths.ts";

export type RubricRole = "LECTURER" | "ADMIN";

/** The case list the rubric is entered from ("Case Study" breadcrumb step). */
export function rubricCasesPath(role: RubricRole): string {
  return role === "ADMIN" ? PATHS.ADMIN.CASES : PATHS.LECTURER.CASES;
}

/** The rubric screen of one case. */
export function rubricCasePath(role: RubricRole, caseId: string): string {
  return buildPath(role === "ADMIN" ? PATHS.ADMIN.CASE_RUBRIC : PATHS.LECTURER.CASE_RUBRIC, { caseId });
}

/**
 * Header back target when a case is open (D3c entry points): admin returns to the system case
 * list (10.6, where "Xem" opened the rubric); a lecturer returns to the review page of that case.
 * When the case could not be opened (403 / 404) the review page would be another dead end, so
 * back goes to the case list instead.
 */
export function rubricBackPath(role: RubricRole, caseId: string, caseErrorCode?: number): string {
  if (role === "ADMIN" || caseErrorCode === 403 || caseErrorCode === 404) return rubricCasesPath(role);
  return buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId });
}
