/**
 * AdminRubricPage — Admin · Nghiên cứu & Rubric (Figma 10.8).
 * Routes: /admin/rubric/:caseId and /admin/rubric (no case selected).
 */
import { useParams } from "react-router-dom";
import { RubricWorkspace } from "@/pages/rubric/RubricWorkspace";

export function AdminRubricPage() {
  const { caseId } = useParams<{ caseId?: string }>();
  return <RubricWorkspace role="ADMIN" caseId={caseId} />;
}
