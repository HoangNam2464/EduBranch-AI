import type { CaseStatisticsDto } from "@/services/statisticsService";

/**
 * Pure helper functions for StatisticsPage and BranchStatsChart.
 * Kept in a dedicated helpers file to satisfy react(only-export-components) and support unit testing.
 */

export function isCaseStatisticsEmpty(stats: CaseStatisticsDto | null): boolean {
  if (!stats) return true;
  if (stats.learningMode === "BRANCHING_STUDY" || stats.branching) {
    return !stats.branching || stats.branching.totalAttempts === 0;
  }
  if (stats.learningMode === "REVIEW_STUDY" || stats.reviewStudy) {
    return !stats.reviewStudy || stats.reviewStudy.totalSubmissions === 0;
  }
  return true;
}

export function formatPercentage(val: number): string {
  if (typeof val !== "number" || Number.isNaN(val)) return "0%";
  const clamped = Math.min(Math.max(val, 0), 100);
  return `${Math.round(clamped)}%`;
}

export function mapStatisticsErrorStatus(status?: number): string {
  switch (status) {
    case 400:
    case 404:
      return "g4.stats.errors.notFound";
    case 403:
      return "g4.stats.errors.forbidden";
    case 500:
    case 502:
    case 503:
      return "g4.stats.errors.serverError";
    default:
      return "g4.stats.errors.network";
  }
}

export function truncateSituation(text: string, maxLength = 80): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function getOptionBarColor(isFocal: boolean, optIdx: number): string {
  if (isFocal) return "bg-primary";
  if (optIdx === 1) return "bg-primary/75";
  return "bg-primary/50";
}
