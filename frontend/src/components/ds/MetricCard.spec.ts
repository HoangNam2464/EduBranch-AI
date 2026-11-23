import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { isEmptyMetricValue, MetricCard, type MetricCardVariant } from "@/components/ds/MetricCard";

describe("MetricCard (T002 / AC-M1, AC-M2)", () => {
  describe("isEmptyMetricValue pure function", () => {
    it("returns true for null, undefined, and empty string", () => {
      assert.equal(isEmptyMetricValue(null), true);
      assert.equal(isEmptyMetricValue(undefined), true);
      assert.equal(isEmptyMetricValue(""), true);
    });

    it("returns false for non-empty values including 0", () => {
      assert.equal(isEmptyMetricValue(0), false);
      assert.equal(isEmptyMetricValue("0"), false);
      assert.equal(isEmptyMetricValue(42), false);
      assert.equal(isEmptyMetricValue("42"), false);
      assert.equal(isEmptyMetricValue("—"), false);
      assert.equal(isEmptyMetricValue("Chưa có"), false);
    });
  });

  describe("emptyReason prop and rendering", () => {
    it("renders '—' with title and sr-only reason when emptyReason is set and value is null", () => {
      const html = renderToStaticMarkup(
        React.createElement(MetricCard, {
          label: "Điểm trung bình",
          value: null,
          emptyReason: "Chưa có lượt nộp bài",
        }),
      );

      assert.match(html, /title="Chưa có lượt nộp bài"/);
      assert.match(html, /aria-describedby="metric-reason-[^"]+"/);
      assert.match(html, /class="sr-only">Chưa có lượt nộp bài<\/span>/);
      assert.match(html, /—/);
    });

    it("renders '—' with title and sr-only reason when emptyReason is set and value is empty string", () => {
      const html = renderToStaticMarkup(
        React.createElement(MetricCard, {
          label: "Tỷ lệ hoàn thành",
          value: "",
          emptyReason: "Chưa bắt đầu khóa học",
        }),
      );

      assert.match(html, /title="Chưa bắt đầu khóa học"/);
      assert.match(html, /class="sr-only">Chưa bắt đầu khóa học<\/span>/);
      assert.match(html, /—/);
    });

    it("renders normal value when emptyReason is not provided", () => {
      const html = renderToStaticMarkup(
        React.createElement(MetricCard, {
          label: "Số ca học",
          value: null,
        }),
      );

      assert.doesNotMatch(html, /class="sr-only"/);
      assert.doesNotMatch(html, /aria-describedby/);
    });

    it("renders 0 normally even if emptyReason is provided", () => {
      const html = renderToStaticMarkup(
        React.createElement(MetricCard, {
          label: "Số ca học",
          value: 0,
          emptyReason: "Chưa có dữ liệu",
        }),
      );

      assert.doesNotMatch(html, /class="sr-only"/);
      assert.doesNotMatch(html, /title="Chưa có dữ liệu"/);
      assert.match(html, />0<\/p>/);
    });
  });

  describe("tabular-nums on all variants", () => {
    const variants: MetricCardVariant[] = ["stacked", "compact", "tile", "inline", "kpi"];

    for (const variant of variants) {
      it(`includes tabular-nums class on variant "${variant}"`, () => {
        const html = renderToStaticMarkup(
          React.createElement(MetricCard, {
            variant,
            label: "Thống kê",
            value: "1,234",
          }),
        );
        assert.match(html, /tabular-nums/);
      });
    }
  });

  describe("compact label readability", () => {
    it("uses text-ink-secondary for the compact variant label", () => {
      const html = renderToStaticMarkup(
        React.createElement(MetricCard, {
          variant: "compact",
          label: "Tiến độ học tập",
          value: "85%",
        }),
      );
      assert.match(html, /text-ink-secondary/);
      assert.doesNotMatch(html, /text-ink-muted/);
    });
  });
});
