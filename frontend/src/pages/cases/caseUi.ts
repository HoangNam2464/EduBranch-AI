import { FileText, GitBranch, type LucideIcon } from "lucide-react";
import type { CaseStatus, LearningMode } from "@/types";
import type { StatusPillTone, StatusTabTone } from "@/components/ds";
import type { CaseLifecycleStatus } from "@/components/ds";

/** Lifecycle order of FND §4 (DRAFT → REVIEWED → APPROVED → PUBLISHED). */
export const CASE_STATUSES: CaseStatus[] = ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"];

/** Status pill / tab tones of 03.1 (status/* variables). */
export const STATUS_PILL_TONE: Record<CaseStatus, StatusPillTone> = {
  DRAFT: "neutral",
  REVIEWED: "info",
  APPROVED: "warning",
  PUBLISHED: "success",
};

export const STATUS_TAB_TONE: Record<CaseStatus, StatusTabTone> = {
  DRAFT: "neutral",
  REVIEWED: "info",
  APPROVED: "warning",
  PUBLISHED: "success",
};

export const LIFECYCLE: Record<CaseStatus, CaseLifecycleStatus> = {
  DRAFT: "draft",
  REVIEWED: "reviewed",
  APPROVED: "approved",
  PUBLISHED: "published",
};

/** Thumbnail / tag / marker styling per learning mode (03.1 "Course card", "Category tag", "Category marker"). */
export const MODE_UI: Record<LearningMode, { icon: LucideIcon; iconStroke: number; tile: string; tag: string; marker: string }> = {
  BRANCHING_STUDY: { icon: GitBranch, iconStroke: 1.5, tile: "bg-selected text-link", tag: "bg-selected text-link", marker: "bg-primary" },
  REVIEW_STUDY: {
    icon: FileText,
    iconStroke: 1.7,
    tile: "bg-mode-review-bg text-mode-review-text",
    tag: "bg-mode-review-bg text-mode-review-text",
    marker: "bg-accent",
  },
};

/** Lecturers may edit a case only while it is DRAFT or REVIEWED (backend CaseService.updateCase). */
export function isEditable(status: CaseStatus): boolean {
  return status === "DRAFT" || status === "REVIEWED";
}

/** dd/mm/yyyy as drawn on 03.1 ("Cập nhật 30/11/2026"). */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
