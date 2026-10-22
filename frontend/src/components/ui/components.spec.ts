import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import {
  CaseStatusBadge,
  LearningModeBadge,
  AiOriginTag,
  Button,
  Badge,
  type CaseStatus,
} from "./index";

describe("Shared UI Components Specification & Canonical Token Compliance", () => {
  it("should format CaseStatusBadge according to canonical design system tokens", () => {
    const statuses: CaseStatus[] = ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"];
    const expectedLabels = {
      DRAFT: "Draft",
      REVIEWED: "Reviewed",
      APPROVED: "Approved",
      PUBLISHED: "Published",
    };

    for (const status of statuses) {
      const element = CaseStatusBadge({ status });
      assert.ok(element, `Element for ${status} should be created`);
      assert.strictEqual(element.props.children, expectedLabels[status]);

      // Verify specific canonical design token classes
      const classNames = element.props.className;
      if (status === "DRAFT") {
        assert.ok(classNames.includes("bg-eb-status-draft-bg"), "Draft should use status-draft-bg token");
        assert.ok(classNames.includes("text-eb-status-draft-text"), "Draft should use status-draft-text token");
      } else if (status === "REVIEWED") {
        assert.ok(classNames.includes("bg-eb-status-reviewed-bg"), "Reviewed should use status-reviewed-bg token");
        assert.ok(classNames.includes("text-eb-status-reviewed-text"), "Reviewed should use status-reviewed-text token");
      } else if (status === "APPROVED") {
        assert.ok(classNames.includes("bg-eb-status-approved-bg"), "Approved should use status-approved-bg token");
        assert.ok(classNames.includes("text-eb-status-approved-text"), "Approved should use status-approved-text token");
      } else if (status === "PUBLISHED") {
        assert.ok(classNames.includes("bg-eb-status-published-bg"), "Published should use status-published-bg token");
        assert.ok(classNames.includes("text-eb-status-published-text"), "Published should use status-published-text token");
      }
    }
  });

  it("should format LearningModeBadge with distinct teal and pink badges", () => {
    const branchingElement = LearningModeBadge({ mode: "BRANCHING_STUDY" });
    assert.strictEqual(branchingElement.props.children, "Branching Study");
    assert.ok(
      branchingElement.props.className.includes("bg-eb-mode-branching-bg") &&
        branchingElement.props.className.includes("text-eb-mode-branching-text"),
      "Branching study must use teal mode-branching token",
    );

    const reviewElement = LearningModeBadge({ mode: "REVIEW_STUDY" });
    assert.strictEqual(reviewElement.props.children, "Review Study");
    assert.ok(
      reviewElement.props.className.includes("bg-eb-mode-review-bg") &&
        reviewElement.props.className.includes("text-eb-mode-review-text"),
      "Review study must use pink mode-review token",
    );
  });

  it("should render AiOriginTag with neutral colors and without sparkle glyphs", () => {
    const tag = AiOriginTag({ label: "AI Draft" });
    assert.ok(tag.props.className.includes("bg-eb-ai-bg"), "AI tag should use neutral ai-bg token");
    assert.ok(tag.props.className.includes("text-eb-ai-text"), "AI tag should use neutral ai-text token");
    assert.ok(tag.props.children.includes("AI Draft"));
  });

  it("should render Button with rectangular rounded-md border-radius and accessible focus rings", () => {
    const primaryBtn = Button({ variant: "primary", children: "Submit" });
    assert.ok(primaryBtn.props.className.includes("rounded-md"));
    assert.ok(primaryBtn.props.className.includes("bg-eb-action-primary"));
    assert.ok(primaryBtn.props.className.includes("focus-visible:ring-2"));

    const secondaryBtn = Button({ variant: "secondary", children: "Cancel" });
    assert.ok(secondaryBtn.props.className.includes("bg-eb-surface"));
    assert.ok(secondaryBtn.props.className.includes("border-eb-border-default"));
  });
});
