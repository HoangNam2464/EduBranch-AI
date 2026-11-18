import {
  Activity,
  ChartNoAxesCombined,
  Database,
  GitBranch,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CourseThumbnailTone } from "@/components/ds";
import { caseService } from "@/services/caseService";
import { materialService } from "@/services/materialService";
import type { Case, TeachingMaterial } from "@/types";

/**
 * Per-course figures shown on 02.1 / 02.4, derived only from real endpoints:
 * GET /courses/:id/materials (processing_status) and GET /courses/:id/cases (status).
 * The course API itself returns no counts (BE gap: aggregate counts on GET /courses).
 */
export interface CourseInsights {
  materials: TeachingMaterial[];
  cases: Case[];
}

export interface CourseSummary {
  documents: number;
  ready: number;
  failed: number;
  /** PENDING or PROCESSING. */
  inProgress: number;
  cases: number;
  published: number;
  drafts: number;
  reviewed: number;
}

export async function loadCourseInsights(courseId: string): Promise<CourseInsights> {
  const [materials, cases] = await Promise.all([
    materialService.getMaterialsByCourse(courseId),
    caseService.getCasesByCourse(courseId),
  ]);
  return { materials, cases };
}

export function summarize({ materials, cases }: CourseInsights): CourseSummary {
  const count = <T,>(list: T[], test: (item: T) => boolean) => list.filter(test).length;
  return {
    documents: materials.length,
    ready: count(materials, (m) => m.processingStatus === "COMPLETED"),
    failed: count(materials, (m) => m.processingStatus === "FAILED"),
    inProgress: count(materials, (m) => m.processingStatus === "PENDING" || m.processingStatus === "PROCESSING"),
    cases: cases.length,
    published: count(cases, (c) => c.status === "PUBLISHED"),
    drafts: count(cases, (c) => c.status === "DRAFT"),
    reviewed: count(cases, (c) => c.status === "REVIEWED"),
  };
}

/**
 * Course thumbnails on 02.1 are decorative (the API has no course image): icon and tone cycle
 * with the list position exactly as drawn in Figma, with the stroke measured on each icon.
 */
const VISUALS: Array<{ icon: LucideIcon; stroke: number }> = [
  { icon: ShieldCheck, stroke: 1.7 },
  { icon: GitBranch, stroke: 1.5 },
  { icon: Database, stroke: 2 },
  { icon: ChartNoAxesCombined, stroke: 1.5 },
  { icon: SlidersHorizontal, stroke: 0.8 },
  { icon: TrendingUp, stroke: 1.51 },
  { icon: Users, stroke: 1.7 },
  { icon: Activity, stroke: 1.33 },
];
const TONES: CourseThumbnailTone[] = ["subtle", "primary", "review"];

export function courseVisual(index: number): { icon: LucideIcon; stroke: number; tone: CourseThumbnailTone } {
  const visual = VISUALS[((index % VISUALS.length) + VISUALS.length) % VISUALS.length];
  return { ...visual, tone: TONES[((index % TONES.length) + TONES.length) % TONES.length] };
}

/** "2.4 MB" style size (decimal point, one decimal for MB/KB as on 02.4 / 02.7). */
export function formatFileSize(bytes: number, t: (key: string, opts: { value: string }) => string): string {
  if (bytes >= 1024 * 1024) return t("g2.common.fileSize.mb", { value: trim(bytes / (1024 * 1024)) });
  if (bytes >= 1024) return t("g2.common.fileSize.kb", { value: trim(bytes / 1024) });
  return t("g2.common.fileSize.b", { value: String(bytes) });
}

function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
