/**
 * EduBranch AI — Rubric Service
 * Case quality rubric (BE-033 / OPD-011 / FR-EVAL-01), backend contract
 * `specs/007-mvp-completion-backend/contracts/api.md` §4.
 *
 *   GET    /evaluation/rubrics?caseId=   list (lecturer: own courses; admin: all)
 *   GET    /evaluation/rubrics/:id
 *   POST   /evaluation/rubrics           { caseId, realismScore, difficultyScore, alignmentScore, notes? }
 *   PUT    /evaluation/rubrics/:id       evaluator only
 *   DELETE /evaluation/rubrics/:id       evaluator only
 *
 * RULE: rates the case artefact for research; never a student grade, score or rank.
 */

import apiClient from "@/services/apiClient";
import type { CreateRubricEvaluationDto, RubricEvaluation, UpdateRubricEvaluationDto } from "@/types";
import {
  RUBRIC_CRITERIA,
  calculateAverageScore,
  canModifyRubricEvaluation,
  fromRubricRow,
  isRubricFormComplete,
  toRubricScores,
  type RubricRow,
} from "@/services/mappers/rubric";

export {
  RUBRIC_CRITERIA,
  calculateAverageScore,
  canModifyRubricEvaluation,
  isRubricFormComplete,
  toRubricScores,
};

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
    const trimmedNotes = dto.notes?.trim();
    const payload: CreateRubricEvaluationDto = {
      caseId: dto.caseId,
      realismScore: dto.realismScore,
      difficultyScore: dto.difficultyScore,
      alignmentScore: dto.alignmentScore,
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    };
    const res = await apiClient.post<Envelope<RubricRow>>("/evaluation/rubrics", payload);
    return fromRubricRow(res.data.data);
  },

  async updateRubric(id: string, dto: UpdateRubricEvaluationDto): Promise<RubricEvaluation> {
    const payload: UpdateRubricEvaluationDto = {
      ...dto,
      ...(dto.notes !== undefined ? { notes: dto.notes.trim() } : {}),
    };
    const res = await apiClient.put<Envelope<RubricRow>>(`/evaluation/rubrics/${id}`, payload);
    return fromRubricRow(res.data.data);
  },

  async deleteRubric(id: string): Promise<void> {
    await apiClient.delete(`/evaluation/rubrics/${id}`);
  },
};
