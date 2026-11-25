import { createHmac } from "crypto";

/**
 * Pure helpers for the anonymised research export (BE-033, spec 007 AC-R4/R5; FR-EVAL-04/05).
 */

const PSEUDONYM_LABEL = "edubranch-research-export-v1";

/**
 * Stable pseudonym for a user id: "P-" + 12 hex chars of
 * HMAC-SHA256(HMAC-SHA256(secret, label), userId). Same id → same code across
 * exports; not reversible without the secret.
 */
export function pseudonymFactory(secret: string): (userId: string) => string {
  if (!secret) throw new Error("A secret is required for pseudonymous export codes");
  const key = createHmac("sha256", secret).update(PSEUDONYM_LABEL).digest();
  return (userId: string) => `P-${createHmac("sha256", key).update(userId).digest("hex").slice(0, 12)}`;
}

/** Word count of free text; the text itself is never exported (FR-EVAL-05). */
export function wordCount(text: string | null | undefined): number {
  if (!text) return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

/** One CSV cell: neutralises spreadsheet formulas (CSV injection) and quotes per RFC 4180. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const CSV_BOM = "﻿";

export function toCsv(header: readonly string[], rows: readonly unknown[][]): string {
  const lines = [header.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
  return `${CSV_BOM}${lines.join("\r\n")}\r\n`;
}

export const ACTIVITY_COLUMNS = [
  "participant_code",
  "course_code",
  "case_id",
  "learning_mode",
  "attempt_number",
  "completed",
  "decision_count",
  "choice_path",
  "outcome_node_id",
  "reasoning_word_count",
  "reflection_word_count",
  "challenge_rounds",
  "duration_seconds",
] as const;

export const RUBRIC_COLUMNS = [
  "case_id",
  "course_code",
  "learning_mode",
  "evaluator_code",
  "realism_score",
  "difficulty_score",
  "alignment_score",
  "average_score",
] as const;

/**
 * L3 option C (PO 2026-11-25): rows are ordered by case and pseudonym only, never by
 * time or by a raw user id, so row position cannot be joined with the dashboard.
 */
export function compareRows(keys: readonly number[]): (a: unknown[], b: unknown[]) => number {
  return (a, b) => {
    for (const k of keys) {
      const x = a[k];
      const y = b[k];
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "en");
      if (c !== 0) return c;
    }
    return 0;
  };
}

export function averageScore(realism: number, difficulty: number, alignment: number): number {
  return Math.round(((realism + difficulty + alignment) / 3) * 10) / 10;
}
