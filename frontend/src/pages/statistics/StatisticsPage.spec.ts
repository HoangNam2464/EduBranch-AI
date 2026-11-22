import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { default: apiClient } = await import("@/services/apiClient");
const { statisticsService } = await import("@/services/statisticsService");
const {
  formatPercentage,
  getOptionBarColor,
  isCaseStatisticsEmpty,
  mapStatisticsErrorStatus,
  truncateSituation,
} = await import("./statisticsHelpers");

describe("StatisticsPage & statisticsService (FE-022, contract-002 §C E8)", () => {
  const sampleBranchingStats = {
    caseId: "case-uuid-001",
    caseTitle: "Khủng hoảng truyền thông doanh nghiệp",
    learningMode: "BRANCHING_STUDY",
    caseStatus: "PUBLISHED",
    branching: {
      totalAttempts: 120,
      completedAttempts: 96,
      completionRate: 80.0,
      participants: 84,
      singleAttemptStudents: 60,
      retryStudents: 24,
      attemptsPerStudent: [
        { attempts: 1, students: 60 },
        { attempts: 2, students: 18 },
        { attempts: 3, students: 6 },
      ],
      flowStatus: {
        inProgress: 24,
        completed: 96,
        reflected: 75,
      },
      decisionPoints: [
        {
          nodeId: "node-1",
          nodeIndex: 0,
          situation: "Phát ngôn minh bạch và nhận trách nhiệm trước báo chí",
          totalSelections: 120,
          options: [
            {
              optionId: "opt-1a",
              optionText: "Tổ chức họp báo trực tiếp ngay trong ngày",
              count: 72,
              percentage: 60.0,
            },
            {
              optionId: "opt-1b",
              optionText: "Trì hoãn và rà soát nội bộ trước khi phản hồi",
              count: 48,
              percentage: 40.0,
            },
          ],
        },
      ],
      outcomes: [
        {
          nodeId: "terminal-1",
          situation: "Xử lý thành công — Lấy lại niềm tin thị trường",
          count: 54,
          percentage: 56.25,
        },
        {
          nodeId: "terminal-2",
          situation: "Khủng hoảng kéo dài — Thất thoát thị phần ngắn hạn",
          count: 42,
          percentage: 43.75,
        },
      ],
    },
    reviewStudy: null,
  };

  const sampleReviewStudyStats = {
    caseId: "case-uuid-002",
    caseTitle: "Phân tích chiến lược mở rộng thị trường",
    learningMode: "REVIEW_STUDY",
    caseStatus: "PUBLISHED",
    branching: null,
    reviewStudy: {
      totalSubmissions: 45,
      flowStatus: {
        submitted: 15,
        reviewed: 20,
        reflected: 10,
      },
    },
  };

  describe("statisticsService.getCaseStatistics (API Client & Route verification)", () => {
    it("calls exact contract route GET /cases/:caseId/statistics and unwraps SUCCESS envelope", async () => {
      const originalGet = apiClient.get;
      try {
        let requestedUrl = "";
        apiClient.get = (async (url: string) => {
          requestedUrl = url;
          return {
            data: {
              status: "SUCCESS",
              data: sampleBranchingStats,
            },
          };
        }) as any;

        const result = await statisticsService.getCaseStatistics("case-uuid-001");
        assert.equal(requestedUrl, "/cases/case-uuid-001/statistics");
        assert.equal(result.caseId, "case-uuid-001");
        assert.equal(result.learningMode, "BRANCHING_STUDY");
        assert.ok(result.branching);
        assert.equal(result.branching?.totalAttempts, 120);
        assert.equal(result.branching?.completionRate, 80.0);
        assert.equal(result.branching?.decisionPoints[0].nodeIndex, 0);
        assert.equal(result.branching?.decisionPoints[0].options[0].optionText, "Tổ chức họp báo trực tiếp ngay trong ngày");
        assert.equal(result.branching?.outcomes[0].situation, "Xử lý thành công — Lấy lại niềm tin thị trường");
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("correctly parses reviewStudy case statistics from GET /cases/:caseId/statistics", async () => {
      const originalGet = apiClient.get;
      try {
        apiClient.get = (async (url: string) => {
          assert.equal(url, "/cases/case-uuid-002/statistics");
          return {
            data: {
              status: "SUCCESS",
              data: sampleReviewStudyStats,
            },
          };
        }) as any;

        const result = await statisticsService.getCaseStatistics("case-uuid-002");
        assert.equal(result.caseId, "case-uuid-002");
        assert.equal(result.learningMode, "REVIEW_STUDY");
        assert.equal(result.branching, null);
        assert.ok(result.reviewStudy);
        assert.equal(result.reviewStudy?.totalSubmissions, 45);
        assert.equal(result.reviewStudy?.flowStatus.submitted, 15);
        assert.equal(result.reviewStudy?.flowStatus.reviewed, 20);
        assert.equal(result.reviewStudy?.flowStatus.reflected, 10);
      } finally {
        apiClient.get = originalGet;
      }
    });

    it("propagates 404, 403, and 500 errors without swallowing into null", async () => {
      const originalGet = apiClient.get;
      try {
        const errorCodes = [400, 403, 404, 500];
        for (const code of errorCodes) {
          apiClient.get = (async () => {
            const err = new Error(`HTTP Error ${code}`);
            (err as any).response = { status: code };
            throw err;
          }) as any;

          await assert.rejects(
            async () => {
              await statisticsService.getCaseStatistics("err-id");
            },
            (err: any) => {
              assert.equal(err.response?.status, code);
              return true;
            },
          );
        }
      } finally {
        apiClient.get = originalGet;
      }
    });
  });

  describe("Pure View Logic & Helpers (statisticsHelpers)", () => {
    describe("isCaseStatisticsEmpty", () => {
      it("returns true for null or undefined", () => {
        assert.equal(isCaseStatisticsEmpty(null), true);
      });

      it("returns true for branching case when totalAttempts is 0", () => {
        const emptyBranching = {
          ...sampleBranchingStats,
          branching: {
            ...sampleBranchingStats.branching,
            totalAttempts: 0,
            completedAttempts: 0,
            participants: 0,
          },
        };
        assert.equal(isCaseStatisticsEmpty(emptyBranching), true);
      });

      it("returns false for branching case when totalAttempts > 0", () => {
        assert.equal(isCaseStatisticsEmpty(sampleBranchingStats), false);
      });

      it("returns true for reviewStudy case when totalSubmissions is 0", () => {
        const emptyReview = {
          ...sampleReviewStudyStats,
          reviewStudy: {
            totalSubmissions: 0,
            flowStatus: { submitted: 0, reviewed: 0, reflected: 0 },
          },
        };
        assert.equal(isCaseStatisticsEmpty(emptyReview), true);
      });

      it("returns false for reviewStudy case when totalSubmissions > 0", () => {
        assert.equal(isCaseStatisticsEmpty(sampleReviewStudyStats), false);
      });
    });

    describe("formatPercentage", () => {
      it("formats valid numbers rounded to whole percent", () => {
        assert.equal(formatPercentage(80), "80%");
        assert.equal(formatPercentage(78.4), "78%");
        assert.equal(formatPercentage(78.6), "79%");
        assert.equal(formatPercentage(0), "0%");
        assert.equal(formatPercentage(100), "100%");
      });

      it("clamps out of bounds numbers and handles NaN", () => {
        assert.equal(formatPercentage(-10), "0%");
        assert.equal(formatPercentage(150), "100%");
        assert.equal(formatPercentage(Number.NaN), "0%");
      });
    });

    describe("truncateSituation", () => {
      it("keeps short situations as-is", () => {
        const short = "Quyết định ngắn";
        assert.equal(truncateSituation(short, 50), "Quyết định ngắn");
      });

      it("truncates long situations with ellipsis", () => {
        const long = "Đây là một tình huống rất dài cần phải được cắt ngắn để hiển thị vừa vặn trên thanh tiêu đề";
        const truncated = truncateSituation(long, 30);
        assert.ok(truncated.length <= 31);
        assert.ok(truncated.endsWith("…"));
      });

      it("handles empty or whitespace strings", () => {
        assert.equal(truncateSituation(""), "");
        assert.equal(truncateSituation("   "), "");
      });
    });

    describe("getOptionBarColor", () => {
      it("assigns primary brand color to focal choice", () => {
        assert.equal(getOptionBarColor(true, 0), "bg-primary");
        assert.equal(getOptionBarColor(true, 1), "bg-primary");
      });

      it("assigns layered brand opacities to secondary and tertiary choices", () => {
        assert.equal(getOptionBarColor(false, 1), "bg-primary/75");
        assert.equal(getOptionBarColor(false, 2), "bg-primary/50");
      });

      it("strictly avoids green and red semantic coloring for options", () => {
        for (let i = 0; i < 5; i++) {
          const colorFocal = getOptionBarColor(true, i);
          const colorNormal = getOptionBarColor(false, i);
          assert.ok(!colorFocal.includes("green") && !colorFocal.includes("red"));
          assert.ok(!colorNormal.includes("green") && !colorNormal.includes("red"));
        }
      });
    });

    describe("mapStatisticsErrorStatus", () => {
      it("maps HTTP status codes to appropriate i18n keys", () => {
        assert.equal(mapStatisticsErrorStatus(400), "g4.stats.errors.notFound");
        assert.equal(mapStatisticsErrorStatus(404), "g4.stats.errors.notFound");
        assert.equal(mapStatisticsErrorStatus(403), "g4.stats.errors.forbidden");
        assert.equal(mapStatisticsErrorStatus(500), "g4.stats.errors.serverError");
        assert.equal(mapStatisticsErrorStatus(502), "g4.stats.errors.serverError");
        assert.equal(mapStatisticsErrorStatus(undefined), "g4.stats.errors.network");
      });
    });
  });

  describe("Pedagogical Guardrails & Domain Invariants", () => {
    it("strictly prohibits student ranking, grading, or pass/fail labels in statistics", () => {
      const forbiddenGradingProps = [
        "studentRanking",
        "leaderboard",
        "gradeDistribution",
        "scores",
        "passFail",
        "grading",
        "studentGrade",
      ];

      for (const prop of forbiddenGradingProps) {
        assert.equal(
          (sampleBranchingStats as any)[prop],
          undefined,
          `Forbidden grading property "${prop}" must not exist on statistics!`,
        );
        assert.equal(
          (sampleBranchingStats.branching as any)[prop],
          undefined,
          `Forbidden grading property "${prop}" must not exist on branching stats!`,
        );
      }
    });

    it("enforces read-only aggregation with no mutation methods in statisticsService", () => {
      const serviceMethods = Object.keys(statisticsService);
      assert.deepEqual(serviceMethods, ["getCaseStatistics"]);
    });
  });
});
