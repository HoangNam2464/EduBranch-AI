/**
 * CaseRubricPage — Giảng viên · Rubric nghiên cứu chất lượng tình huống (Figma 07.8).
 * Routes: /lecturer/cases/:caseId/rubric and /lecturer/rubric (no case selected).
 */
import { useParams } from "react-router-dom";
import { RubricWorkspace } from "@/pages/rubric/RubricWorkspace";

export function CaseRubricPage() {
  const { caseId } = useParams<{ caseId?: string }>();
  return <RubricWorkspace role="LECTURER" caseId={caseId} />;
}
