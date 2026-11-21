/**
 * EduBranch AI — Rubric Service
 * Case quality rubric (BE-033 / OPD-011 / FR-EVAL-01), backend contract
 * `specs/007-mvp-completion-backend/contracts/api.md` §4.
 *
 *   GET    /evaluation/rubrics?caseId=   list (lecturer: own cases; admin: all)
 *   GET    /evaluation/rubrics/:id
 *   POST   /evaluation/rubrics           { caseId, realismScore, difficultyScore, alignmentScore, notes? }
 *   PUT    /evaluation/rubrics/:id       evaluator only
 *   DELETE /evaluation/rubrics/:id       evaluator only
 *
 * RULE: rates the case artefact for research; never a student grade, score or rank.
 */

import apiClient from "@/services/apiClient";
import type { CreateRubricEvaluationDto, RubricEvaluation, UpdateRubricEvaluationDto } from "@/types";
import { calculateAverageScore, fromRubricRow, toRubricScores, type RubricRow } from "./rubricLogic";

export { calculateAverageScore, toRubricScores };

type Envelope<T> = { status?: string; data: T };

export const rubricService = {
  async getRubrics(params?: { caseId?: string }): Promise<RubricEvaluation[]> {
    const res = await apiClient.get<Envelope<RubricRow[]>>("/evaluation/rubrics", { params });
    return (res.data.data ?? []).map(fromRubricRow);
  },

  async getRubricById(id: string): Promise<RubricEvaluation> {
    const res = await apiClient.get<Envelope<RubricRow>>(`/evaluation/rubrics/${id}`);
    return fromRubricRow(res.data.data);
  },

  async createRubric(dto: CreateRubricEvaluationDto): Promise<RubricEvaluation> {
    const res = await apiClient.post<Envelope<RubricRow>>("/evaluation/rubrics", dto);
    return fromRubricRow(res.data.data);
  },

  async updateRubric(id: string, dto: UpdateRubricEvaluationDto): Promise<RubricEvaluation> {
    const res = await apiClient.put<Envelope<RubricRow>>(`/evaluation/rubrics/${id}`, dto);
    return fromRubricRow(res.data.data);
  },

  async deleteRubric(id: string): Promise<void> {
    await apiClient.delete(`/evaluation/rubrics/${id}`);
  },
};
