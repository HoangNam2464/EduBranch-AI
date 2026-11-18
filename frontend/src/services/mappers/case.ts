import type { Case, CaseDetail, CaseNode, CaseOption, CaseStatus, LearningMode } from "@/types";

/**
 * Wire format of the case endpoints (backend/src/modules/case/case.service.ts):
 * raw SQL rows of `cases`, `case_nodes` and `case_options` in snake_case.
 *  - GET /courses/:courseId/cases → CaseRow[] (`SELECT * FROM cases`)
 *  - GET /cases/:id (lecturer)    → CaseRow & lecturer_id & nodes[] (each with options[]) & all_options[]
 *  - GET /cases/:id (student)     → the published subset of CaseRow (no tree)
 */
export interface CaseRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  created_by?: string;
  status: CaseStatus;
  version?: number;
  root_node_id?: string | null;
  learning_mode?: LearningMode | null;
  context_text?: string | null;
  problem_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseOptionRow {
  id: string;
  node_id: string;
  option_text: string;
  consequence: string;
  next_node_id: string | null;
}

export interface CaseNodeRow {
  id: string;
  case_id: string;
  situation: string;
  is_terminal: boolean;
  node_index: number | null;
  options?: CaseOptionRow[];
}

export interface CaseDetailRow extends CaseRow {
  lecturer_id?: string;
  nodes?: CaseNodeRow[];
  all_options?: CaseOptionRow[];
}

const opt = <T>(value: T | null | undefined): T | undefined => (value === null ? undefined : value);

export function toCase(row: CaseRow): Case {
  return {
    id: row.id,
    title: row.title,
    description: opt(row.description),
    courseId: row.course_id,
    createdBy: row.created_by,
    // Column default (V2 migration) is BRANCHING_STUDY.
    learningMode: row.learning_mode ?? "BRANCHING_STUDY",
    contextText: opt(row.context_text),
    problemText: opt(row.problem_text),
    status: row.status,
    version: row.version,
    rootNodeId: opt(row.root_node_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCaseOption(row: CaseOptionRow): CaseOption {
  return {
    id: row.id,
    nodeId: row.node_id,
    text: row.option_text,
    consequence: row.consequence,
    nextNodeId: opt(row.next_node_id),
  };
}

export function toCaseNode(row: CaseNodeRow): CaseNode {
  return {
    id: row.id,
    caseId: row.case_id,
    situation: row.situation,
    isTerminal: row.is_terminal,
    nodeIndex: opt(row.node_index),
    options: (row.options ?? []).map(toCaseOption),
  };
}

export function toCaseDetail(row: CaseDetailRow): CaseDetail {
  return { ...toCase(row), nodes: (row.nodes ?? []).map(toCaseNode) };
}
