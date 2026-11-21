import type {
  AttemptCurrentNode,
  AttemptDetail,
  AttemptOption,
  AttemptStep,
  AttemptSummary,
  ReflectionStatus,
} from "@/types";

/**
 * Wire formats of the Branching Study endpoints (backend/src/modules/branching-attempt):
 *  - GET /cases/:caseId/attempts      → AttemptSummaryRow[] (raw SQL rows, snake_case)
 *  - GET /branching-attempts/:id,
 *    POST /cases/:caseId/branching-attempts,
 *    POST /branching-attempts/:id/step → AttemptDetailRow (object built in the service,
 *      camelCase, but nullable columns arrive as null and `outcomeNode` is a raw
 *      `case_nodes` row in snake_case)
 * Pages only see the typed domain models from "@/types".
 */
export interface AttemptSummaryRow {
  id: string;
  attempt_number: number;
  is_completed: boolean;
  reflection_status: ReflectionStatus;
  started_at: string;
  completed_at: string | null;
}

export interface AttemptOptionRow {
  id: string;
  text: string;
}

export interface AttemptStepRow {
  nodeId: string;
  situation: string;
  selectedOptionId: string;
  selectedOptionText: string;
  consequence?: string | null;
  reasoningId: string;
  reasoningText: string | null;
  submittedAt: string;
  otherOptions?: AttemptOptionRow[];
}

export interface AttemptCurrentNodeRow {
  id: string;
  situation: string;
  isTerminal: boolean;
  nodeIndex: number | null;
  options?: AttemptOptionRow[];
}

export interface AttemptOutcomeNodeRow {
  id: string;
  situation: string;
  is_terminal?: boolean;
  node_index: number | null;
}

export interface AttemptDetailRow {
  id: string;
  caseId: string;
  caseTitle: string;
  caseDescription: string | null;
  studentId?: string;
  attemptNumber: number;
  currentNodeId: string | null;
  outcomeNodeId: string | null;
  outcomeNode: AttemptOutcomeNodeRow | null;
  isCompleted: boolean;
  reflectionText: string | null;
  reflectionStatus: ReflectionStatus;
  reflectionSubmittedAt: string | null;
  startedAt: string;
  completedAt: string | null;
  currentNode: AttemptCurrentNodeRow | null;
  steps?: AttemptStepRow[];
}

const opt = <T>(value: T | null | undefined): T | undefined => (value === null ? undefined : value);

export function toAttemptSummary(row: AttemptSummaryRow): AttemptSummary {
  return {
    id: row.id,
    // pg returns INTEGER as number; guard against a numeric string just in case.
    attemptNumber: Number(row.attempt_number),
    completed: row.is_completed,
    reflectionStatus: row.reflection_status ?? "NOT_STARTED",
    startedAt: row.started_at,
    completedAt: opt(row.completed_at),
  };
}

function toOption(row: AttemptOptionRow): AttemptOption {
  return { id: row.id, text: row.text };
}

function toStep(row: AttemptStepRow): AttemptStep {
  return {
    nodeId: row.nodeId,
    situation: row.situation,
    selectedOptionId: row.selectedOptionId,
    selectedOptionText: row.selectedOptionText,
    consequence: opt(row.consequence),
    reasoningId: row.reasoningId,
    reasoningText: opt(row.reasoningText),
    submittedAt: row.submittedAt,
    otherOptions: (row.otherOptions ?? []).map(toOption),
  };
}

function toCurrentNode(row: AttemptCurrentNodeRow): AttemptCurrentNode {
  return {
    id: row.id,
    situation: row.situation,
    isTerminal: row.isTerminal,
    nodeIndex: opt(row.nodeIndex),
    options: (row.options ?? []).map(toOption),
  };
}

export function toAttemptDetail(row: AttemptDetailRow): AttemptDetail {
  return {
    id: row.id,
    caseId: row.caseId,
    caseTitle: row.caseTitle,
    caseDescription: opt(row.caseDescription),
    attemptNumber: Number(row.attemptNumber),
    currentNodeId: opt(row.currentNodeId),
    outcomeNodeId: opt(row.outcomeNodeId),
    outcome: row.outcomeNode
      ? { id: row.outcomeNode.id, situation: row.outcomeNode.situation, nodeIndex: opt(row.outcomeNode.node_index) }
      : undefined,
    completed: row.isCompleted,
    reflectionText: opt(row.reflectionText),
    reflectionStatus: row.reflectionStatus ?? "NOT_STARTED",
    reflectionSubmittedAt: opt(row.reflectionSubmittedAt),
    startedAt: row.startedAt,
    completedAt: opt(row.completedAt),
    currentNode: row.currentNode ? toCurrentNode(row.currentNode) : undefined,
    steps: (row.steps ?? []).map(toStep),
  };
}
