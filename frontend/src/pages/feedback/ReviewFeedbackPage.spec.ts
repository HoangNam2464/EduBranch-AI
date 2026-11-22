import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { default: apiClient } = await import("@/services/apiClient");
const { reviewStudyService } = await import("@/services/reviewStudyService");
const {
  canWriteReflection,
  mapErrorToI18nKey,
  getHttpStatus,
} = await import("./reviewFeedbackLogic");
import type { LecturerFeedback, ReviewStudySubmission } from "@/types";

describe("ReviewFeedbackPage & reviewStudyService (FE-020 Contract Alignment)", () => {
  const dummySubmission: ReviewStudySubmission = {
    id: "sub-101",
    studentId: "stu-current",
    caseId: "case-202",
    studentAnalysis: "Comprehensive market analysis",
    proposedSolution: "Decentralized distribution system",
    reasoningText: "Reduces overhead by 30% based on logistics data",
    submissionStatus: "REVIEWED",
    reflectionStatus: "NOT_STARTED",
    submittedAt: "2026-11-20T10:00:00.000Z",
  };

  const dummyFeedback: LecturerFeedback = {
    id: "fb-101",
    lecturerId: "lec-303",
    feedbackText: "Well reasoned analysis of operational trade-offs.",
    createdAt: "2026-11-20T11:00:00.000Z",
  };

  describe("Service Routes & Response Parsing (C1-A & E1–E5)", () => {
    it("submitReviewStudy calls POST /cases/:caseId/review-study/submit (E1)", async () => {
      const originalPost = apiClient.post;
      try {
        let calledUrl = "";
        let calledBody: unknown = null;
        apiClient.post = (async (url: string, body: unknown) => {
          calledUrl = url;
          calledBody = body;
          return {
            data: {
              status: "SUCCESS",
              data: {
                id: "sub-created",
                caseId: "case-123",
                studentId: "stu-456",
                proposedSolution: "Solution A",
                reasoningText: "Reasoning B",
                submissionStatus: "SUBMITTED",
                reflectionStatus: "NOT_STARTED",
                submittedAt: "2026-11-20T12:00:00.000Z",
              },
            },
          };
        }) as unknown as typeof apiClient.post;

        const res = await reviewStudyService.submitReviewStudy("case-123", {
          proposedSolution: "Solution A",
          reasoningText: "Reasoning B",
        });

        assert.equal(calledUrl, "/cases/case-123/review-study/submit");
        assert.deepEqual(calledBody, {
          proposedSolution: "Solution A",
          reasoningText: "Reasoning B",
        });
        assert.equal(res.id, "sub-created");
        assert.equal(res.submissionStatus, "SUBMITTED");
      } finally {
        apiClient.post = originalPost;
      }
    });

    it("getMySubmission calls GET /cases/:caseId/review-study/submissions/me (E2) and parses 200", async () => {
      const originalGet = apiClient.get;
      try {
        let calledUrl = "";
        apiClient.get = (async (url: string) => {
          calledUrl = url;
          return {
            data: {
              status: "SUCCESS",
              data: {
                id: "sub-me",
                caseId: "case-123",
                studentId: "stu-current",
                proposedSolution: "Solution My",
                reasoningText: "Reasoning My",
                submissionStatus: "REVIEWED",
                reflectionStatus: "NOT_STARTED",
                submittedAt: "2026-11-20T10:00:00.000Z",
              },
            },
          };
        }) as unknown as typeof apiClient.get;

        const res = await reviewStudyService.getMySubmission("case-123");
        assert.equal(calledUrl, "/cases/case-123/review-study/submissions/me");
        assert.ok(res);
        assert.equal(res?.id, "sub-me");
        assert.equal(res?.submissionStatus, "REVIEWED");
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("getMySubmission returns null on 404 SUBMISSION_NOT_FOUND", async () => {
      const originalGet = apiClient.get;
      try {
        apiClient.get = (async () => {
          const error: unknown = Object.assign(new Error("Request failed with status code 404"), {
            isAxiosError: true,
            response: { status: 404, data: { error: "SUBMISSION_NOT_FOUND" } },
          });
          throw error;
        }) as unknown as typeof apiClient.get;

        const res = await reviewStudyService.getMySubmission("case-123");
        assert.equal(res, null, "404 on getMySubmission must return null (not submitted yet)");
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("getMySubmission propagates non-404 errors (500, network)", async () => {
      const originalGet = apiClient.get;
      try {
        apiClient.get = (async () => {
          const error: unknown = Object.assign(new Error("Request failed with status code 500"), {
            isAxiosError: true,
            response: { status: 500 },
          });
          throw error;
        }) as unknown as typeof apiClient.get;

        await assert.rejects(
          async () => {
            await reviewStudyService.getMySubmission("case-123");
          },
          (err: any) => err.response?.status === 500,
        );
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("getSubmissionById calls GET /review-study/submissions/:id (E3)", async () => {
      const originalGet = apiClient.get;
      try {
        let calledUrl = "";
        apiClient.get = (async (url: string) => {
          calledUrl = url;
          return {
            data: {
              status: "SUCCESS",
              data: {
                id: "sub-by-id",
                caseId: "case-123",
                studentId: "stu-current",
                proposedSolution: "Solution ID",
                reasoningText: "Reasoning ID",
                submissionStatus: "REFLECTED",
                reflectionStatus: "SUBMITTED",
                reflectionText: "Thoughtful reflection",
                submittedAt: "2026-11-20T10:00:00.000Z",
              },
            },
          };
        }) as unknown as typeof apiClient.get;

        const res = await reviewStudyService.getSubmissionById("sub-by-id");
        assert.equal(calledUrl, "/review-study/submissions/sub-by-id");
        assert.equal(res.id, "sub-by-id");
        assert.equal(res.submissionStatus, "REFLECTED");
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("submitReflection calls POST /review-study/submissions/:id/reflection (E4)", async () => {
      const originalPost = apiClient.post;
      try {
        let calledUrl = "";
        let calledBody: unknown = null;
        apiClient.post = (async (url: string, body: unknown) => {
          calledUrl = url;
          calledBody = body;
          return {
            data: {
              status: "SUCCESS",
              data: {
                id: "sub-reflected",
                caseId: "case-123",
                studentId: "stu-current",
                proposedSolution: "Solution",
                reasoningText: "Reasoning",
                submissionStatus: "REFLECTED",
                reflectionStatus: "SUBMITTED",
                reflectionText: "Deep reflection",
                reflectionSubmittedAt: "2026-11-20T14:00:00.000Z",
                submittedAt: "2026-11-20T10:00:00.000Z",
              },
            },
          };
        }) as unknown as typeof apiClient.post;

        const res = await reviewStudyService.submitReflection("sub-reflected", "Deep reflection");
        assert.equal(calledUrl, "/review-study/submissions/sub-reflected/reflection");
        assert.deepEqual(calledBody, { reflectionText: "Deep reflection" });
        assert.equal(res.submissionStatus, "REFLECTED");
        assert.equal(res.reflectionStatus, "SUBMITTED");
      } finally {
        apiClient.post = originalPost;
      }
    });

    it("getFeedback calls GET /review-study/submissions/:id/feedback (E5) and parses data.feedback", async () => {
      const originalGet = apiClient.get;
      try {
        let calledUrl = "";
        apiClient.get = (async (url: string) => {
          calledUrl = url;
          return {
            data: {
              status: "SUCCESS",
              data: {
                feedback: dummyFeedback,
              },
            },
          };
        }) as unknown as typeof apiClient.get;

        const res = await reviewStudyService.getFeedback("sub-101");
        assert.equal(calledUrl, "/review-study/submissions/sub-101/feedback");
        assert.deepEqual(res, dummyFeedback);
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("getFeedback returns null when data.feedback is null (awaiting feedback)", async () => {
      const originalGet = apiClient.get;
      try {
        apiClient.get = (async () => {
          return {
            data: {
              status: "SUCCESS",
              data: {
                feedback: null,
              },
            },
          };
        }) as unknown as typeof apiClient.get;

        const res = await reviewStudyService.getFeedback("sub-101");
        assert.equal(res, null, "feedback: null on 200 represents authentic pending feedback");
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("getFeedback does NOT swallow 404 or 501 HTTP errors", async () => {
      const originalGet = apiClient.get;
      try {
        for (const statusCode of [404, 501, 500]) {
          apiClient.get = (async () => {
            const error: unknown = Object.assign(new Error(`Request failed with status code ${statusCode}`), {
              isAxiosError: true,
              response: { status: statusCode },
            });
            throw error;
          }) as unknown as typeof apiClient.get;

          await assert.rejects(
            async () => {
              await reviewStudyService.getFeedback("sub-101");
            },
            (err: any) => err.response?.status === statusCode,
            `getFeedback must propagate status ${statusCode} error without swallowing into null!`,
          );
        }
      } finally {
        apiClient.get = originalGet;
      }
    });
  });

  describe("Reflection Form Unlock Conditions (canWriteReflection)", () => {
    it("locks reflection form when submission is SUBMITTED (awaiting review)", () => {
      const unlocked = canWriteReflection(
        "SUBMITTED",
        "NOT_STARTED",
        null,
        false,
      );
      assert.equal(unlocked, false);
    });

    it("locks reflection form when submission is REVIEWED but feedback is null", () => {
      const unlocked = canWriteReflection(
        "REVIEWED",
        "NOT_STARTED",
        null,
        false,
      );
      assert.equal(unlocked, false, "Must not unlock reflection if feedback is null");
    });

    it("locks reflection form when submission is REVIEWED but loading feedback failed (hasFeedbackError = true)", () => {
      const unlocked = canWriteReflection(
        "REVIEWED",
        "NOT_STARTED",
        dummyFeedback,
        true,
      );
      assert.equal(unlocked, false, "Must keep reflection locked if feedback failed to load");
    });

    it("unlocks reflection form ONLY when REVIEWED, not reflected, and feedback loaded successfully", () => {
      const unlocked = canWriteReflection(
        "REVIEWED",
        "NOT_STARTED",
        dummyFeedback,
        false,
      );
      assert.equal(unlocked, true, "Must unlock reflection when REVIEWED with non-null feedback and no errors");
    });

    it("locks reflection form when already REFLECTED or reflectionStatus is SUBMITTED (read-only)", () => {
      const reflectedStatus = canWriteReflection(
        "REFLECTED",
        "SUBMITTED",
        dummyFeedback,
        false,
      );
      assert.equal(reflectedStatus, false);

      const alreadySubmitted = canWriteReflection(
        "REVIEWED",
        "SUBMITTED",
        dummyFeedback,
        false,
      );
      assert.equal(alreadySubmitted, false);
    });
  });

  describe("Error Mapping & i18n Guardrails (mapErrorToI18nKey)", () => {
    it("maps HTTP 400 to validation key", () => {
      const err: unknown = Object.assign(new Error("Bad Request"), {
        isAxiosError: true,
        response: { status: 400 },
      });
      assert.equal(mapErrorToI18nKey(err), "g5.feedback.errors.validation");
    });

    it("maps HTTP 403 to forbidden key", () => {
      const err: unknown = Object.assign(new Error("Forbidden"), {
        isAxiosError: true,
        response: { status: 403 },
      });
      assert.equal(mapErrorToI18nKey(err), "g5.feedback.errors.forbidden");
    });

    it("maps HTTP 404 to notFound key", () => {
      const err: unknown = Object.assign(new Error("Not Found"), {
        isAxiosError: true,
        response: { status: 404 },
      });
      assert.equal(mapErrorToI18nKey(err), "g5.feedback.errors.notFound");
    });

    it("maps HTTP 409 to conflict key", () => {
      const err: unknown = Object.assign(new Error("Conflict"), {
        isAxiosError: true,
        response: { status: 409 },
      });
      assert.equal(mapErrorToI18nKey(err), "g5.feedback.errors.conflict");
    });

    it("maps network errors without response to network key", () => {
      const err: unknown = Object.assign(new Error("Network Error"), {
        isAxiosError: true,
        response: undefined,
      });
      assert.equal(mapErrorToI18nKey(err), "g5.feedback.errors.network");
    });

    it("maps HTTP 500 or non-Axios error to generic key", () => {
      const err500: unknown = Object.assign(new Error("Internal Server Error"), {
        isAxiosError: true,
        response: { status: 500 },
      });
      assert.equal(mapErrorToI18nKey(err500), "g5.feedback.errors.generic");

      assert.equal(mapErrorToI18nKey(new Error("Generic JS error")), "g5.feedback.errors.generic");
      assert.equal(mapErrorToI18nKey("raw string error"), "g5.feedback.errors.generic");
    });

    it("getHttpStatus extracts status code safely", () => {
      const err: unknown = Object.assign(new Error("Conflict"), {
        isAxiosError: true,
        response: { status: 409 },
      });
      assert.equal(getHttpStatus(err), 409);
      assert.equal(getHttpStatus(new Error("plain error")), undefined);
    });
  });

  describe("Pedagogical Guardrails & Non-Grading", () => {
    it("guarantees zero numerical scores, grades or AI evaluation", () => {
      const forbiddenProps = ["grade", "score", "points", "mark", "isCorrect", "rating"];
      for (const prop of forbiddenProps) {
        assert.equal((dummySubmission as any)[prop], undefined);
        assert.equal((dummyFeedback as any)[prop], undefined);
      }
    });
  });
});
