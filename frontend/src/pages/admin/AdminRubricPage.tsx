/**
 * Admin · Nghiên cứu & Rubric — Figma page EduBranch AI – Screens, frame 10.8 (536:8408).
 *
 * In MVP since OPD-011 → A (FEATURE-EVALUATION-AND-RESEARCH, FR-EVAL-01..05).
 * Real data integration with BE-033 (`rubricService`).
 * Zero student grading or score logic — strictly evaluates case quality for academic research.
 * Height of rubric cards self-adjusts based on content (AC-2).
 */

import { useParams } from "react-router-dom";
import { RubricView } from "@/pages/rubric/CaseRubricPage";

export function AdminRubricPage() {
  const { caseId } = useParams<{ caseId?: string }>();
  return <RubricView initialCaseId={caseId} role="ADMIN" />;
}
