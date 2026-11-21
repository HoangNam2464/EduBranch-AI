import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { caseService } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import { branchingAttemptService } from "@/services/branchingAttemptService";
import type { AttemptDetail, AttemptSummary, Case, Course } from "@/types";

/** Load state of a student screen: data, or the HTTP status of the failure. */
export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; code?: number | string; at: Date }
  | { status: "ready"; data: T };

export function errorCode(error: unknown): number | string | undefined {
  if (isAxiosError(error)) return error.response?.status ?? error.code;
  return undefined;
}

/** Message the backend put in a 4xx body (Nest: { message }), if any. */
export function errorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const message = (error.response?.data as { message?: unknown } | undefined)?.message;
  return typeof message === "string" ? message : Array.isArray(message) ? message.join(", ") : undefined;
}

/**
 * Runs `load` on mount and whenever `deps` change; `reload()` runs it again.
 * Failures become `{ status: "error" }` — never sample data.
 */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): [LoadState<T>, () => void] {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    load().then(
      (data) => alive && setState({ status: "ready", data }),
      (error: unknown) => alive && setState({ status: "error", code: errorCode(error), at: new Date() }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return [state, reload];
}

/** Published case (student projection) and the course it belongs to. */
export interface StudentCaseContext {
  caseData: Case;
  course: Course;
}

export async function loadStudentCase(caseId: string): Promise<StudentCaseContext> {
  const caseData = await caseService.getCaseById(caseId);
  const course = await courseService.getCourseById(caseData.courseId);
  return { caseData, course };
}

/** Case + course + the student's attempts (newest first) + details of every attempt. */
export interface CaseAttemptsContext extends StudentCaseContext {
  attempts: AttemptSummary[];
  details: Record<string, AttemptDetail>;
}

export async function loadCaseAttempts(caseId: string): Promise<CaseAttemptsContext> {
  const [ctx, attempts] = await Promise.all([loadStudentCase(caseId), branchingAttemptService.getAttemptsByCase(caseId)]);
  const detailList = await Promise.all(attempts.map((a) => branchingAttemptService.getAttempt(a.id)));
  const details = Object.fromEntries(detailList.map((d) => [d.id, d]));
  return { ...ctx, attempts, details };
}

/** Attempt + its case + course (Journey Review, Reflection). */
export interface AttemptContext extends StudentCaseContext {
  attempt: AttemptDetail;
}

export async function loadAttempt(caseId: string, attemptId: string): Promise<AttemptContext> {
  const [ctx, attempt] = await Promise.all([loadStudentCase(caseId), branchingAttemptService.getAttempt(attemptId)]);
  return { ...ctx, attempt };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "18/11/2026, 09:15" — local date and time as written on 05.1 / 05.9. */
export function formatAttemptTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** "A", "B", … key of the n-th option (0-based). */
export function optionKey(index: number): string {
  return String.fromCharCode(65 + index);
}
