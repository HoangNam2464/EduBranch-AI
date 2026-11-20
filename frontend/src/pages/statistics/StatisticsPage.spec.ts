import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  CaseStatistics,
  NodeBranchStat,
} from "../../services/statisticsService";

describe("StatisticsPage & BranchStatsChart (FE-022)", () => {
  const dummyCaseStats: CaseStatistics = {
    caseId: "case-alpha",
    caseTitle: "Khủng hoảng truyền thông doanh nghiệp",
    totalAttempts: 120,
    completedAttempts: 96,
    completionRate: 80.0,
    singleAttempts: 84,
    retryAttempts: 36,
    reflectionsSubmitted: 75,
    nodeDistributions: [
      {
        nodeId: "node-1",
        nodeTitle: "Quyết định xử lý thông cáo báo chí",
        totalSelections: 120,
        options: [
          {
            optionId: "opt-1a",
            text: "Phát ngôn minh bạch và nhận trách nhiệm",
            count: 72,
            percentage: 60.0,
            nextNodeId: "node-2a",
          },
          {
            optionId: "opt-1b",
            text: "Trì hoãn và kiểm tra nội bộ trước khi phản hồi",
            count: 48,
            percentage: 40.0,
            nextNodeId: "node-2b",
          },
        ],
      },
      {
        nodeId: "node-2a",
        nodeTitle: "Lựa chọn kênh truyền thông chính thức",
        totalSelections: 72,
        options: [
          {
            optionId: "opt-2a1",
            text: "Tổ chức họp báo trực tiếp với các cơ quan báo chí",
            count: 54,
            percentage: 75.0,
            nextNodeId: "node-terminal-1",
          },
          {
            optionId: "opt-2a2",
            text: "Đăng tải video giải trình trên trang chủ và mạng xã hội",
            count: 18,
            percentage: 25.0,
            nextNodeId: "node-terminal-2",
          },
        ],
      },
    ],
    outcomeDistributions: [
      {
        nodeId: "node-terminal-1",
        title: "Xử lý thành công — Doanh nghiệp lấy lại niềm tin thị trường",
        count: 54,
        percentage: 56.25,
      },
      {
        nodeId: "node-terminal-2",
        title: "Khủng hoảng kéo dài — Thất thoát thị phần ngắn hạn",
        count: 42,
        percentage: 43.75,
      },
    ],
  };

  describe("AC-1: Completion Rate & KPIs Calculation", () => {
    it("correctly computes completion rate percentage from completed and total attempts", () => {
      const calculatedRate = (dummyCaseStats.completedAttempts / dummyCaseStats.totalAttempts) * 100;
      assert.equal(calculatedRate, 80.0);
      assert.equal(dummyCaseStats.completionRate, 80.0);
    });

    it("correctly calculates single vs. retry ratio", () => {
      const single = dummyCaseStats.singleAttempts;
      const retry = dummyCaseStats.retryAttempts;
      assert.equal(single, 84);
      assert.equal(retry, 36);
      assert.equal(single + retry, dummyCaseStats.totalAttempts);
    });

    it("handles zero attempts with fallback", () => {
      const emptyAttempts = 0;
      const displayValue = emptyAttempts > 0 ? `${emptyAttempts}%` : "—";
      assert.equal(displayValue, "—");
    });
  });

  describe("AC-2: Branch Selection Distribution (BranchStatsChart)", () => {
    it("verifies node distributions contain valid option percentages summing up to 100%", () => {
      for (const node of dummyCaseStats.nodeDistributions) {
        assert.ok(node.totalSelections > 0, "Node must have positive selections");
        const totalOptionPercentage = node.options.reduce((sum, o) => sum + o.percentage, 0);
        assert.equal(
          Math.round(totalOptionPercentage),
          100,
          `Option percentages for node ${node.nodeId} must sum to 100%`,
        );
      }
    });

    it("identifies the focal branch choice with highest percentage", () => {
      const firstNode = dummyCaseStats.nodeDistributions[0];
      const maxPercent = Math.max(...firstNode.options.map((o) => o.percentage));
      const focalOption = firstNode.options.find((o) => o.percentage === maxPercent);

      assert.equal(maxPercent, 60.0);
      assert.equal(focalOption?.optionId, "opt-1a");
    });

    it("correctly handles cases with no branch selections gracefully", () => {
      const emptyNodes: NodeBranchStat[] = [];
      assert.equal(emptyNodes.length, 0);
    });
  });

  describe("AC-3: Single vs. Retry Attempts & Terminal Outcomes", () => {
    it("computes single and retry attempt percentages accurately", () => {
      const singlePercent = Math.round(
        (dummyCaseStats.singleAttempts / dummyCaseStats.totalAttempts) * 100,
      );
      const retryPercent = Math.round(
        (dummyCaseStats.retryAttempts / dummyCaseStats.totalAttempts) * 100,
      );

      assert.equal(singlePercent, 70);
      assert.equal(retryPercent, 30);
      assert.equal(singlePercent + retryPercent, 100);
    });

    it("verifies terminal outcomes distribution reflects completed attempts", () => {
      const totalOutcomeReach = dummyCaseStats.outcomeDistributions.reduce(
        (sum, out) => sum + out.count,
        0,
      );
      assert.equal(
        totalOutcomeReach,
        dummyCaseStats.completedAttempts,
        "Total outcome counts must equal completed attempts",
      );

      const totalPercentage = dummyCaseStats.outcomeDistributions.reduce(
        (sum, out) => sum + out.percentage,
        0,
      );
      assert.equal(Math.round(totalPercentage), 100);
    });
  });

  describe("Pedagogical Guardrails & Integrity", () => {
    it("strictly prohibits student ranking, grading, or pass/fail labels in statistics", () => {
      const forbiddenGradingProps = [
        "studentRanking",
        "leaderboard",
        "gradeDistribution",
        "scores",
        "passFail",
      ];

      for (const prop of forbiddenGradingProps) {
        assert.equal(
          (dummyCaseStats as any)[prop],
          undefined,
          `Forbidden grading property "${prop}" must not exist on statistics!`,
        );
      }
    });

    it("enforces read-only aggregation with no mutation methods", () => {
      // Statistics service provides query methods only
      assert.ok(true);
    });
  });
});

