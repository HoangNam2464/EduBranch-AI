/**
 * EduBranch AI — Lecturer Statistics Service
 * Read-only statistics aggregation for lecturer learning-flow monitoring.
 *
 * Rules (feature-statistics.md):
 * - Simple descriptive statistics only: completion rate, branch selection frequency,
 *   single vs. retry attempts, terminal outcomes.
 * - Read-only, no mutation.
 * - Zero third-party chart libraries (no Chart.js, Recharts).
 * - Zero student ranking or grading.
 */

import { isAxiosError } from "axios";
import apiClient from "@/services/apiClient";

export interface BranchOptionStat {
  optionId: string;
  text: string;
  count: number;
  percentage: number; // 0 - 100
  nextNodeId?: string | null;
}

export interface NodeBranchStat {
  nodeId: string;
  nodeTitle: string;
  totalSelections: number;
  options: BranchOptionStat[];
}

export interface OutcomeStat {
  nodeId: string;
  title: string;
  count: number;
  percentage: number; // 0 - 100
}

export interface CaseStatistics {
  caseId: string;
  caseTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number; // e.g. 78.5%
  singleAttempts: number;
  retryAttempts: number;
  reflectionsSubmitted: number;
  nodeDistributions: NodeBranchStat[];
  outcomeDistributions: OutcomeStat[];
}

export interface StatisticsOverview {
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number;
  singleAttempts: number;
  retryAttempts: number;
  reflectionsSubmitted: number;
  publishedCasesCount: number;
}

type Envelope<T> = { status?: string; data: T };

function unwrap<T>(body: Envelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}

export const statisticsService = {
  /**
   * Fetch detailed branch distribution, outcomes, and attempts for a specific case.
   * Returns null if backend endpoint is not yet mounted (404/501).
   */
  async getCaseStatistics(caseId: string): Promise<CaseStatistics | null> {
    try {
      const res = await apiClient.get<Envelope<CaseStatistics> | CaseStatistics>(
        `/statistics/cases/${caseId}/flow`,
      );
      return unwrap(res.data);
    } catch (err: unknown) {
      if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch overview statistics across all courses or a specific course.
   * Returns null if backend endpoint is not yet mounted (404/501).
   */
  async getStatisticsOverview(courseId?: string): Promise<StatisticsOverview | null> {
    try {
      const res = await apiClient.get<Envelope<StatisticsOverview> | StatisticsOverview>(
        "/statistics/overview",
        { params: courseId && courseId !== "ALL" ? { courseId } : undefined },
      );
      return unwrap(res.data);
    } catch (err: unknown) {
      if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
        return null;
      }
      throw err;
    }
  },
};

