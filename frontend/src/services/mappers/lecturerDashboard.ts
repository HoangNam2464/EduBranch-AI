/**
 * `GET /lecturer/dashboard` (BE-030, spec 007 US2) → the 07.1 dashboard model.
 * Every count comes from the backend aggregate; nothing is estimated in the browser (FE-027 AC-1).
 * A missing or malformed number becomes 0 and a missing list becomes empty — never invented data.
 */

export interface LecturerDashboardRow {
  courses?: { total?: unknown; active?: unknown; archived?: unknown };
  cases?: {
    total?: unknown;
    byStatus?: { DRAFT?: unknown; REVIEWED?: unknown; APPROVED?: unknown; PUBLISHED?: unknown };
  };
  pendingReviews?: {
    count?: unknown;
    items?: Array<{
      submissionId?: string;
      caseId?: string;
      caseTitle?: string;
      courseName?: string;
      studentName?: string;
      submittedAt?: string;
    }>;
  };
}

export interface PendingReviewItem {
  submissionId: string;
  caseTitle: string;
  courseName: string;
  studentName: string;
  submittedAt: string;
}

export interface LecturerDashboard {
  courses: number;
  publishedCases: number;
  /** Draft or reviewed cases that still need the lecturer's attention. */
  draftCases: number;
  pendingReviews: number;
  pendingItems: PendingReviewItem[];
}

const count = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export function toLecturerDashboard(row: LecturerDashboardRow | null | undefined): LecturerDashboard {
  const byStatus = row?.cases?.byStatus ?? {};
  return {
    courses: count(row?.courses?.total),
    publishedCases: count(byStatus.PUBLISHED),
    draftCases: count(byStatus.DRAFT) + count(byStatus.REVIEWED),
    pendingReviews: count(row?.pendingReviews?.count),
    pendingItems: (row?.pendingReviews?.items ?? [])
      .filter((i) => typeof i?.submissionId === "string" && i.submissionId.length > 0)
      .map((i) => ({
        submissionId: i.submissionId as string,
        caseTitle: i.caseTitle ?? "",
        courseName: i.courseName ?? "",
        studentName: i.studentName ?? "",
        submittedAt: i.submittedAt ?? "",
      })),
  };
}
