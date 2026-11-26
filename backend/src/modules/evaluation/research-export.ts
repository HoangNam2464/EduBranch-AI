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
  "attempt_band",
  "completed",
  "decision_count_band",
  "reasoning_word_band",
  "reflection_word_band",
  "challenge_rounds",
  "duration_band",
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
 * R-L3b option B (PO 2026-11-26): generalise quasi-identifiers that appear verbatim
 * in the lecturer feedback queue / dashboard to reduce 1-to-1 linkage while keeping
 * ordinal research signal (FR-EVAL-04).
 */
export function attemptBand(attemptNumber: number): "1" | "2+" {
  if (!Number.isFinite(attemptNumber) || attemptNumber <= 1) return "1";
  return "2+";
}

export function decisionCountBand(count: number): "0" | "1-2" | "3+" {
  if (!Number.isFinite(count) || count <= 0) return "0";
  if (count <= 2) return "1-2";
  return "3+";
}

export function wordCountBand(words: number): "0" | "1-25" | "26-75" | "76-150" | "151+" {
  if (!Number.isFinite(words) || words <= 0) return "0";
  if (words <= 25) return "1-25";
  if (words <= 75) return "26-75";
  if (words <= 150) return "76-150";
  return "151+";
}

export function durationBand(seconds: number | null | undefined): "" | "0-59s" | "1-5m" | "5-15m" | "15-30m" | "30m+" {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return "";
  if (seconds < 60) return "0-59s";
  if (seconds < 300) return "1-5m";
  if (seconds < 900) return "5-15m";
  if (seconds < 1800) return "15-30m";
  return "30m+";
}

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
