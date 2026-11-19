export interface ChallengeMessage {
  id: string;
  sessionId: string;
  roundNumber: number;
  role: "CHALLENGE_SUPPORT" | "STUDENT";
  content: string;
  createdAt: string;
}

export interface ChallengeSession {
  id: string;
  reasoningId: string | null;
  reviewSubmissionId: string | null;
  currentRound: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ChallengeMessage[];
}

export interface ChallengeSessionRow {
  id: string;
  reasoning_id?: string | null;
  reasoningId?: string | null;
  review_submission_id?: string | null;
  reviewSubmissionId?: string | null;
  current_round?: number;
  currentRound?: number;
  is_completed?: boolean;
  isCompleted?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  messages?: any[];
}

/**
 * Maps backend session payload to camelCase domain model.
 * Handles both camelCase and snake_case safely.
 * Non-grading invariant: never outputs scores or grades.
 */
export function toChallengeSession(row: ChallengeSessionRow): ChallengeSession {
  return {
    id: row.id,
    reasoningId: row.reasoningId ?? row.reasoning_id ?? null,
    reviewSubmissionId: row.reviewSubmissionId ?? row.review_submission_id ?? null,
    currentRound: Number(row.currentRound ?? row.current_round ?? 0),
    isCompleted: Boolean(row.isCompleted ?? row.is_completed ?? false),
    createdAt: row.createdAt ?? row.created_at ?? "",
    updatedAt: row.updatedAt ?? row.updated_at ?? "",
    messages: Array.isArray(row.messages)
      ? row.messages.map((m: any) => ({
          id: m.id,
          sessionId: m.sessionId ?? m.session_id ?? "",
          roundNumber: Number(m.roundNumber ?? m.round_number ?? 1),
          role: m.role,
          content: m.content ?? "",
          createdAt: m.createdAt ?? m.created_at ?? "",
        }))
      : [],
  };
}
