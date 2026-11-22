/**
 * EduBranch AI — Lecturer Statistics Service
 * Read-only statistics aggregation for lecturer learning-flow monitoring.
 *
 * Rules (feature-statistics.md, contract-002-api.md §C):
 * - Simple descriptive statistics only: completion rate, branch selection frequency,
 *   single vs. retry attempts, terminal outcomes.
 * - Read-only, no mutation.
 * - Zero third-party chart libraries (no Chart.js, Recharts).
 * - Zero student ranking or grading.
 * - Route: GET /cases/:caseId/statistics (E8).
 */

import apiClient from "@/services/apiClient";

export interface BranchingOptionStat {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number; // 0 - 100
}

export interface BranchingDecisionPointStat {
  nodeId: string;
  nodeIndex: number;
  situation: string;
  totalSelections: number;
  options: BranchingOptionStat[];
}

export interface BranchingOutcomeStat {
  nodeId: string;
  situation: string;
  count: number;
  percentage: number; // 0 - 100
}

export interface BranchingAttemptPerStudent {
  attempts: number;
  students: number;
}

export interface BranchingFlowStatus {
  inProgress: number;
  completed: number;
  reflected: number;
}

export interface BranchingStats {
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number; // number 0–100, 1 decimal place
  participants: number;
  singleAttemptStudents: number;
  retryStudents: number;
  attemptsPerStudent: BranchingAttemptPerStudent[];
  flowStatus: BranchingFlowStatus;
  decisionPoints: BranchingDecisionPointStat[];
  outcomes: BranchingOutcomeStat[];
}

export interface ReviewStudyFlowStatus {
  submitted: number;
  reviewed: number;
  reflected: number;
}

export interface ReviewStudyStats {
  totalSubmissions: number;
  flowStatus: ReviewStudyFlowStatus;
}

export interface CaseStatisticsDto {
  caseId: string;
  caseTitle: string;
  learningMode: string;
  caseStatus: string;
  branching: BranchingStats | null;
  reviewStudy: ReviewStudyStats | null;
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
   * Fetch statistics for a specific case: branching decisions, outcomes, or review study flow.
   * E8: GET /cases/:caseId/statistics
   * Does NOT swallow errors: propagates 400, 403, 404, 500 to the caller.
   */
  async getCaseStatistics(caseId: string): Promise<CaseStatisticsDto> {
    const res = await apiClient.get<Envelope<CaseStatisticsDto> | CaseStatisticsDto>(
      `/cases/${caseId}/statistics`,
    );
    return unwrap(res.data);
  },
};
