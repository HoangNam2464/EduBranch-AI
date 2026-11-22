import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AxiosError, AxiosHeaders } from "axios";
import {
  countPendingSubmissions,
  filterSubmissions,
  formatSubmissionDate,
  getHttpStatus,
  getSubmissionQueueStatus,
  initialsOf,
  mapErrorToI18nKey,
  type SubmissionFilters,
} from "./lecturerFeedbackLogic";
import type { SubmissionReviewItem } from "@/services/lecturerFeedbackService";

function makeAxiosError(status?: number): AxiosError {
  const headers = new AxiosHeaders();
  const config = { headers };
  const response = status !== undefined
    ? {
        status,
        statusText: String(status),
        headers: {},
        config,
        data: { message: `Error ${status}` },
      }
    : undefined;

  return new AxiosError(
    `Request failed with status ${status ?? "network"}`,
    status ? `ERR_BAD_REQUEST` : "ERR_NETWORK",
    config,
    {},
    response,
  );
}

const mockSubmissions: SubmissionReviewItem[] = [
  {
    targetType: "BRANCHING_STUDY",
    targetId: "att-1",
    studentId: "s-1",
    studentName: "Nguyen Van A",
    studentEmail: "nva@university.edu.vn",
    courseId: "c-law",
    courseName: "Corporate Law",
    courseCode: "LAW-301",
    caseId: "case-contract",
    caseTitle: "Breach of Contract Dilemma",
    attemptNumber: 1,
    isCompleted: true,
    reflectionStatus: "SUBMITTED",
    feedbackStatus: "PENDING",
    existingFeedback: null,
    submittedAt: "2026-11-20T10:00:00Z",
    steps: [
      {
        nodeId: "node-1",
        situation: "Breach discovered",
        selectedOptionText: "Issue formal warning",
        reasoningText: "Mitigate immediate loss",
      },
    ],
  },
  {
    targetType: "BRANCHING_STUDY",
    targetId: "att-2",
    studentId: "s-2",
    studentName: "Tran Thi B",
    studentEmail: "ttb@university.edu.vn",
    courseId: "c-law",
    courseName: "Corporate Law",
    courseCode: "LAW-301",
    caseId: "case-contract",
    caseTitle: "Breach of Contract Dilemma",
    attemptNumber: 2,
    isCompleted: false,
    reflectionStatus: "NOT_STARTED",
    feedbackStatus: "REVIEWED",
    existingFeedback: {
      id: "fb-1",
      lecturerId: "lec-1",
      branchingAttemptId: "att-2",
      reviewSubmissionId: null,
      feedbackText: "Good attempt",
      createdAt: "2026-11-19T15:00:00Z",
      updatedAt: "2026-11-19T15:00:00Z",
    },
    submittedAt: "2026-11-19T14:30:00Z",
  },
  {
    targetType: "REVIEW_STUDY",
    targetId: "sub-1",
    studentId: "s-3",
    studentName: "Le Van C",
    studentEmail: "lvc@university.edu.vn",
    courseId: "c-med",
    courseName: "Clinical Ethics",
    courseCode: "MED-502",
    caseId: "case-triage",
    caseTitle: "Emergency Triage Analysis",
    submissionStatus: "SUBMITTED",
    feedbackStatus: "PENDING",
    existingFeedback: null,
    submittedAt: "2026-11-20T08:15:00Z",
  },
  {
    targetType: "REVIEW_STUDY",
    targetId: "sub-2",
    studentId: "s-4",
    studentName: "Pham Thi D",
    studentEmail: "ptd@university.edu.vn",
    courseId: "c-med",
    courseName: "Clinical Ethics",
    courseCode: "MED-502",
    caseId: "case-triage",
    caseTitle: "Emergency Triage Analysis",
    submissionStatus: "REVIEWED",
    feedbackStatus: "REVIEWED",
    existingFeedback: {
      id: "fb-2",
      lecturerId: "lec-1",
      branchingAttemptId: null,
      reviewSubmissionId: "sub-2",
      feedbackText: "Detailed ethical evaluation",
      createdAt: "2026-11-18T10:00:00Z",
      updatedAt: "2026-11-18T10:00:00Z",
    },
    submittedAt: "2026-11-18T09:00:00Z",
  },
  {
    targetType: "REVIEW_STUDY",
    targetId: "sub-3",
    studentId: "s-5",
    studentName: "Hoang Van E",
    studentEmail: "hve@university.edu.vn",
    courseId: "c-med",
    courseName: "Clinical Ethics",
    courseCode: "MED-502",
    caseId: "case-triage",
    caseTitle: "Emergency Triage Analysis",
    submissionStatus: "REFLECTED",
    feedbackStatus: "REVIEWED",
    existingFeedback: {
      id: "fb-3",
      lecturerId: "lec-1",
      branchingAttemptId: null,
      reviewSubmissionId: "sub-3",
      feedbackText: "Insightful reflection",
      createdAt: "2026-11-17T12:00:00Z",
      updatedAt: "2026-11-17T12:00:00Z",
    },
    submittedAt: "2026-11-17T11:45:00Z",
  },
];

const defaultFilters: SubmissionFilters = {
  search: "",
  course: "ALL",
  learningMode: "ALL",
  status: "ALL",
  sort: "NEWEST",
};

describe("lecturerFeedbackLogic (FE-019)", () => {
  describe("getSubmissionQueueStatus (Status Rule)", () => {
    it("returns PENDING when existingFeedback is null (Branching Study)", () => {
      assert.equal(getSubmissionQueueStatus(mockSubmissions[0]), "PENDING");
    });

    it("returns PENDING when existingFeedback is null (Review Study)", () => {
      assert.equal(getSubmissionQueueStatus(mockSubmissions[2]), "PENDING");
    });

    it("returns REVIEWED when existingFeedback != null and reflection not submitted", () => {
      assert.equal(getSubmissionQueueStatus(mockSubmissions[1]), "REVIEWED");
      assert.equal(getSubmissionQueueStatus(mockSubmissions[3]), "REVIEWED");
    });

    it("returns REFLECTED when existingFeedback != null and Review Study submissionStatus === REFLECTED", () => {
      assert.equal(getSubmissionQueueStatus(mockSubmissions[4]), "REFLECTED");
    });

    it("returns REFLECTED when existingFeedback != null and Branching reflectionStatus === SUBMITTED", () => {
      const branchingReflected: SubmissionReviewItem = {
        ...mockSubmissions[1],
        reflectionStatus: "SUBMITTED",
      };
      assert.equal(getSubmissionQueueStatus(branchingReflected), "REFLECTED");
    });
  });

  describe("countPendingSubmissions", () => {
    it("counts submissions with PENDING status in loaded list", () => {
      assert.equal(countPendingSubmissions(mockSubmissions), 2);
    });

    it("returns 0 for empty list", () => {
      assert.equal(countPendingSubmissions([]), 0);
    });

    it("returns 0 when all submissions have feedback", () => {
      const allReviewed = [mockSubmissions[1], mockSubmissions[3], mockSubmissions[4]];
      assert.equal(countPendingSubmissions(allReviewed), 0);
    });
  });

  describe("initialsOf", () => {
    it("extracts first and last initial for Vietnamese names", () => {
      assert.equal(initialsOf("Nguyễn Minh Anh"), "NA");
      assert.equal(initialsOf("Trần Quốc Bảo"), "TB");
      assert.equal(initialsOf("Lê Thu Hà"), "LH");
      assert.equal(initialsOf("Phạm Gia Huy"), "PH");
      assert.equal(initialsOf("Võ Ngọc Linh"), "VL");
      assert.equal(initialsOf("Đặng Đức Minh"), "ĐM");
    });

    it("ignores academic titles like TS., ThS., PGS.", () => {
      assert.equal(initialsOf("TS. Nguyễn Văn An"), "NA");
      assert.equal(initialsOf("ThS Lê Văn C"), "LC");
    });

    it("handles single-word or short names", () => {
      assert.equal(initialsOf("Nguyen"), "NG");
      assert.equal(initialsOf(""), "");
      assert.equal(initialsOf(null), "");
    });
  });

  describe("formatSubmissionDate", () => {
    it("formats ISO date to DD/MM/YYYY · HH:mm", () => {
      const formatted = formatSubmissionDate("2026-10-23T09:42:00Z");
      assert.match(formatted, /^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);
    });

    it("returns raw string if invalid date", () => {
      assert.equal(formatSubmissionDate("invalid-date"), "invalid-date");
    });
  });

  describe("mapErrorToI18nKey & getHttpStatus", () => {
    it("maps 400 to validation error key", () => {
      const err = makeAxiosError(400);
      assert.equal(mapErrorToI18nKey(err), "g4.queue.errors.validation");
      assert.equal(getHttpStatus(err), 400);
    });

    it("maps 403 to forbidden error key", () => {
      const err = makeAxiosError(403);
      assert.equal(mapErrorToI18nKey(err), "g4.queue.errors.forbidden");
      assert.equal(getHttpStatus(err), 403);
    });

    it("maps 404 to notFound error key", () => {
      const err = makeAxiosError(404);
      assert.equal(mapErrorToI18nKey(err), "g4.queue.errors.notFound");
      assert.equal(getHttpStatus(err), 404);
    });

    it("maps 409 to conflict error key", () => {
      const err = makeAxiosError(409);
      assert.equal(mapErrorToI18nKey(err), "g4.queue.errors.conflict");
      assert.equal(getHttpStatus(err), 409);
    });

    it("maps 500+ to generic error key", () => {
      const err500 = makeAxiosError(500);
      assert.equal(mapErrorToI18nKey(err500), "g4.queue.errors.generic");
      assert.equal(getHttpStatus(err500), 500);

      const err502 = makeAxiosError(502);
      assert.equal(mapErrorToI18nKey(err502), "g4.queue.errors.generic");
      assert.equal(getHttpStatus(err502), 502);
    });

    it("maps network error (no response) to network error key", () => {
      const err = makeAxiosError(undefined);
      assert.equal(mapErrorToI18nKey(err), "g4.queue.errors.network");
      assert.equal(getHttpStatus(err), undefined);
    });

    it("maps generic unknown error to generic error key", () => {
      assert.equal(mapErrorToI18nKey(new Error("Unknown error")), "g4.queue.errors.generic");
      assert.equal(mapErrorToI18nKey("plain string error"), "g4.queue.errors.generic");
      assert.equal(getHttpStatus(new Error("Crash")), undefined);
    });
  });

  describe("filterSubmissions (FE-019 AC-2)", () => {
    it("returns all submissions when filters are default", () => {
      const res = filterSubmissions(mockSubmissions, defaultFilters);
      assert.equal(res.length, 5);
      // Newest first by default
      assert.equal(res[0].targetId, "att-1");
      assert.equal(res[4].targetId, "sub-3");
    });

    it("filters by status: PENDING", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        status: "PENDING",
      });
      assert.equal(res.length, 2);
      assert.ok(res.every((s) => getSubmissionQueueStatus(s) === "PENDING"));
      assert.equal(res[0].targetId, "att-1");
      assert.equal(res[1].targetId, "sub-1");
    });

    it("filters by status: REVIEWED", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        status: "REVIEWED",
      });
      assert.equal(res.length, 2);
      assert.ok(res.every((s) => getSubmissionQueueStatus(s) === "REVIEWED"));
      assert.equal(res[0].targetId, "att-2");
      assert.equal(res[1].targetId, "sub-2");
    });

    it("filters by status: REFLECTED", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        status: "REFLECTED",
      });
      assert.equal(res.length, 1);
      assert.equal(res[0].targetId, "sub-3");
      assert.equal(getSubmissionQueueStatus(res[0]), "REFLECTED");
    });

    it("filters by learningMode: BRANCHING_STUDY", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        learningMode: "BRANCHING_STUDY",
      });
      assert.equal(res.length, 2);
      assert.ok(res.every((s) => s.targetType === "BRANCHING_STUDY"));
    });

    it("filters by learningMode: REVIEW_STUDY", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        learningMode: "REVIEW_STUDY",
      });
      assert.equal(res.length, 3);
      assert.ok(res.every((s) => s.targetType === "REVIEW_STUDY"));
    });

    it("filters Branching Study by COMPLETED", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        learningMode: "BRANCHING_STUDY",
        status: "COMPLETED",
      });
      assert.equal(res.length, 1);
      assert.equal(res[0].targetId, "att-1");
      assert.equal(res[0].isCompleted, true);
    });

    it("filters Branching Study by REFLECTION_SUBMITTED vs REFLECTION_PENDING", () => {
      const submitted = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        learningMode: "BRANCHING_STUDY",
        status: "REFLECTION_SUBMITTED",
      });
      assert.equal(submitted.length, 1);
      assert.equal(submitted[0].targetId, "att-1");
      assert.equal(submitted[0].reflectionStatus, "SUBMITTED");

      const pending = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        learningMode: "BRANCHING_STUDY",
        status: "REFLECTION_PENDING",
      });
      assert.equal(pending.length, 1);
      assert.equal(pending[0].targetId, "att-2");
    });

    it("filters by course ID", () => {
      const res = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        course: "c-med",
      });
      assert.equal(res.length, 3);
      assert.ok(res.every((s) => s.courseId === "c-med"));
    });

    it("filters by search term matching student name, email, or case title", () => {
      const byName = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        search: "Nguyen Van A",
      });
      assert.equal(byName.length, 1);
      assert.equal(byName[0].targetId, "att-1");

      const byEmail = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        search: "ttb@university",
      });
      assert.equal(byEmail.length, 1);
      assert.equal(byEmail[0].targetId, "att-2");

      const byCase = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        search: "Triage",
      });
      assert.equal(byCase.length, 3);
      assert.ok(byCase.every((s) => s.caseTitle.includes("Triage")));
    });

    it("sorts by OLDEST vs NEWEST", () => {
      const oldest = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        sort: "OLDEST",
      });
      assert.equal(oldest[0].targetId, "sub-3"); // 2026-11-17
      assert.equal(oldest[4].targetId, "att-1"); // 2026-11-20

      const newest = filterSubmissions(mockSubmissions, {
        ...defaultFilters,
        sort: "NEWEST",
      });
      assert.equal(newest[0].targetId, "att-1");
      assert.equal(newest[4].targetId, "sub-3");
    });
  });
});
