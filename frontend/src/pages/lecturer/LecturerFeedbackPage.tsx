import React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, EmptyState, Button } from "../../components/ui";

/**
 * LecturerFeedbackPage — Placeholder for Sprint 2+
 *
 * This page will list student attempts and Review Study submissions for
 * the lecturer to review and provide feedback.
 *
 * Route: /lecturer/cases/:caseId/feedback
 */
export function LecturerFeedbackPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <PageHeader
        title="Student Submissions & Feedback"
        description="Review student attempts and provide feedback on their reasoning."
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        }
      />
      <EmptyState
        title="Feedback feature coming in Sprint 2"
        description="You will be able to review student Branching Study attempts and Review Study submissions here, and write structured feedback."
      />
    </div>
  );
}
