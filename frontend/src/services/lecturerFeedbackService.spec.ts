import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AxiosError, AxiosHeaders } from "axios";

const { default: apiClient } = await import("@/services/apiClient");
const { lecturerFeedbackService } = await import("@/services/lecturerFeedbackService");

function makeMockAxiosError(status: number): AxiosError {
  const headers = new AxiosHeaders();
  const config = { headers };
  return new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    config,
    {},
    {
      status,
      statusText: String(status),
      headers: {},
      config,
      data: { message: `Server error ${status}` },
    },
  );
}

describe("lecturerFeedbackService (FE-019 / PR #68 Fixes)", () => {
  it("getQueueSubmissions calls GET /lecturer-feedback/submissions with params and returns data", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string, config?: any) => {
        assert.equal(url, "/lecturer-feedback/submissions");
        assert.deepEqual(config?.params, { courseId: "c-1", caseId: "case-1" });
        return {
          data: {
            status: "SUCCESS",
            data: [
              {
                id: "item-1",
                targetType: "BRANCHING_STUDY",
                studentId: "s-1",
                studentName: "Nguyen Van A",
                courseId: "c-1",
                courseName: "Corporate Law",
                caseId: "case-1",
                caseTitle: "Breach of Contract Dilemma",
                feedbackStatus: "PENDING",
                submittedAt: "2026-11-20T10:00:00Z",
              },
            ],
          },
        };
      }) as any;

      const items = await lecturerFeedbackService.getQueueSubmissions({
        courseId: "c-1",
        caseId: "case-1",
      });

      assert.equal(items.length, 1);
      assert.equal(items[0].id, "item-1");
      assert.equal(items[0].studentName, "Nguyen Van A");
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getQueueSubmissions rethrows error on 404 (does NOT swallow into empty array)", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async () => {
        throw makeMockAxiosError(404);
      }) as any;

      await assert.rejects(
        async () => {
          await lecturerFeedbackService.getQueueSubmissions();
        },
        (err: any) => {
          assert.equal(err.response?.status, 404);
          return true;
        },
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getQueueSubmissions rethrows error on 501 (does NOT swallow into empty array)", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async () => {
        throw makeMockAxiosError(501);
      }) as any;

      await assert.rejects(
        async () => {
          await lecturerFeedbackService.getQueueSubmissions();
        },
        (err: any) => {
          assert.equal(err.response?.status, 501);
          return true;
        },
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getQueueSubmissions rethrows error on 500", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async () => {
        throw makeMockAxiosError(500);
      }) as any;

      await assert.rejects(async () => {
        await lecturerFeedbackService.getQueueSubmissions();
      });
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("submitFeedback calls POST /lecturer-feedback and returns feedback response", async () => {
    const originalPost = apiClient.post;
    try {
      apiClient.post = (async (url: string, data: any) => {
        assert.equal(url, "/lecturer-feedback");
        assert.deepEqual(data, {
          reviewSubmissionId: "sub-123",
          feedbackText: "Very thoughtful analysis and trade-off considerations.",
        });
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "fb-123",
              lecturerId: "lec-1",
              reviewSubmissionId: "sub-123",
              feedbackText: "Very thoughtful analysis and trade-off considerations.",
              createdAt: "2026-11-20T11:00:00Z",
              updatedAt: "2026-11-20T11:00:00Z",
            },
          },
        };
      }) as any;

      const res = await lecturerFeedbackService.submitFeedback({
        reviewSubmissionId: "sub-123",
        feedbackText: "Very thoughtful analysis and trade-off considerations.",
      });

      assert.equal(res.id, "fb-123");
      assert.equal(res.feedbackText, "Very thoughtful analysis and trade-off considerations.");
      assert.equal(res.createdAt, "2026-11-20T11:00:00Z");
    } finally {
      apiClient.post = originalPost;
    }
  });
});
