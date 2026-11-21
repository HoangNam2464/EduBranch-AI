/**
 * Pure domain logic for the case quality rubric (BE-033 / OPD-011 / FR-EVAL-01).
 * Three fixed criteria on a 1–5 scale; this rates the case, never a student.
 * Dependency-free so it runs under the Node test runner.
 */
import type { RubricCriterionItem, RubricEvaluation, RubricScoresDto } from "../types/index.ts";

/** UI id (also the i18n key under `rubric.criteria.*`) ↔ API key and score field. */
export const RUBRIC_CRITERIA = [
  { id: "realism", apiKey: "REALISM", field: "realismScore" },
  { id: "difficulty", apiKey: "DIFFICULTY", field: "difficultyScore" },
  { id: "curriculumFit", apiKey: "ALIGNMENT", field: "alignmentScore" },
] as const;

export type RubricCriterionId = (typeof RUBRIC_CRITERIA)[number]["id"];

/** Mean of the criterion scores with one decimal; 0 for an empty list. */
export function calculateAverageScore(criteria: Array<{ score: number }>): number {
  if (!criteria || criteria.length === 0) return 0;
  const sum = criteria.reduce((acc, curr) => acc + (curr.score || 0), 0);
  return Math.round((sum / criteria.length) * 10) / 10;
}

/** Builds the API scores from the form's criteria; throws if a criterion is missing or out of 1–5. */
export function toRubricScores(criteria: RubricCriterionItem[]): RubricScoresDto {
  const scores = {} as RubricScoresDto;
  for (const c of RUBRIC_CRITERIA) {
    const item = criteria.find((x) => x.id === c.id);
    const score = item?.score;
    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
      throw new Error(`Rubric criterion ${c.id} needs a score from 1 to 5`);
    }
    scores[c.field] = score;
  }
  return scores;
}

/** Wire format of an evaluation from `/evaluation/rubrics` (spec 007 contract). */
export interface RubricRow {
  id: string;
  caseId: string;
  caseTitle?: string;
  evaluatorId?: string;
  evaluatorName?: string;
  realismScore: number;
  difficultyScore: number;
  alignmentScore: number;
  averageScore?: number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/** Maps an API row to the UI model; criterion names are resolved by the page through i18n. */
export function fromRubricRow(row: RubricRow): RubricEvaluation {
  const criteria: RubricCriterionItem[] = RUBRIC_CRITERIA.map((c) => ({
    id: c.id,
    name: "",
    score: row[c.field],
    maxScore: 5,
  }));
  return {
    id: row.id,
    caseId: row.caseId,
    caseTitle: row.caseTitle,
    evaluatorId: row.evaluatorId,
    evaluatorName: row.evaluatorName,
    criteria,
    averageScore: row.averageScore ?? calculateAverageScore(criteria),
    notes: row.notes || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
