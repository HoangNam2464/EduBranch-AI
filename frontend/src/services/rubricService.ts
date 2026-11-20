/**
 * EduBranch AI — Rubric Service
 * Case quality research rubric evaluation (BE-033 / OPD-011).
 *
 * REST Endpoints:
 *   GET    /evaluation/rubrics              Get all rubrics (optionally by ?caseId=...)
 *   GET    /evaluation/rubrics/:id          Get rubric by id
 *   POST   /evaluation/rubrics              Create a new case quality rubric evaluation
 *   PUT    /evaluation/rubrics/:id          Update an existing rubric evaluation
 *   DELETE /evaluation/rubrics/:id          Delete a rubric evaluation
 *
 * RULE: Zero student grading / scoring / ranking logic.
 * This evaluation strictly measures case artifact quality for academic research.
 */

import apiClient from "@/services/apiClient";
import type {
  CreateRubricEvaluationDto,
  RubricEvaluation,
  UpdateRubricEvaluationDto,
} from "@/types";
import { calculateAverageScore, validateCriterion } from "./rubricLogic";

export { calculateAverageScore, validateCriterion };

type Envelope<T> = { status?: string; success?: boolean; data: T };

function extractData<T>(res: { data: any }): T {
  if (res.data && typeof res.data === "object" && "data" in res.data) {
    return res.data.data;
  }
  return res.data;
}

export const rubricService = {
  /**
   * Fetch rubric evaluations, optionally filtered by caseId.
   */
  async getRubrics(params?: { caseId?: string }): Promise<RubricEvaluation[]> {
    const res = await apiClient.get<Envelope<RubricEvaluation[]>>("/evaluation/rubrics", {
      params,
    });
    return extractData<RubricEvaluation[]>(res) ?? [];
  },

  /**
   * Fetch a single rubric evaluation by id.
   */
  async getRubricById(id: string): Promise<RubricEvaluation> {
    const res = await apiClient.get<Envelope<RubricEvaluation>>(`/evaluation/rubrics/${id}`);
    return extractData<RubricEvaluation>(res);
  },

  /**
   * Create a new rubric evaluation (BE-033).
   */
  async createRubric(dto: CreateRubricEvaluationDto): Promise<RubricEvaluation> {
    const res = await apiClient.post<Envelope<RubricEvaluation>>("/evaluation/rubrics", dto);
    return extractData<RubricEvaluation>(res);
  },

  /**
   * Update an existing rubric evaluation (BE-033).
   */
  async updateRubric(id: string, dto: UpdateRubricEvaluationDto): Promise<RubricEvaluation> {
    const res = await apiClient.put<Envelope<RubricEvaluation>>(`/evaluation/rubrics/${id}`, dto);
    return extractData<RubricEvaluation>(res);
  },

  /**
   * Delete a rubric evaluation.
   */
  async deleteRubric(id: string): Promise<void> {
    await apiClient.delete(`/evaluation/rubrics/${id}`);
  },
};
