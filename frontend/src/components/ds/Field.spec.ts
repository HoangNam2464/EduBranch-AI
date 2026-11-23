import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Field } from "@/components/ds/Field";

describe("Field layout reservation & aria-describedby (T004 / AC-F1)", () => {
  it("always reserves the helper line with min-h-4 even when empty", () => {
    const html = renderToStaticMarkup(
      React.createElement(Field, {
        label: "Họ và tên",
      }),
    );

    // Reserved paragraph with min-h-4 must always exist in the DOM
    assert.match(html, /<p id="field-[^"]+-helper" class="[^"]*min-h-4[^"]*text-ink-secondary"[^>]*><\/p>/);
    // aria-describedby should NOT be present on the input when below is empty
    assert.doesNotMatch(html, /aria-describedby/);
  });

  it("points aria-describedby to helper line and applies text-error when error is present", () => {
    const html = renderToStaticMarkup(
      React.createElement(Field, {
        label: "Email",
        error: "Email không hợp lệ",
      }),
    );

    assert.match(html, /aria-describedby="field-[^"]+-helper"/);
    assert.match(html, /class="[^"]*min-h-4[^"]*text-error[^"]*">Email không hợp lệ<\/p>/);
    assert.match(html, /aria-invalid="true"/);
  });

  it("points aria-describedby to helper line and applies text-ink-secondary when helper is present without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(Field, {
        label: "Mật khẩu",
        helper: "Tối thiểu 8 ký tự",
      }),
    );

    assert.match(html, /aria-describedby="field-[^"]+-helper"/);
    assert.match(html, /class="[^"]*min-h-4[^"]*text-ink-secondary[^"]*">Tối thiểu 8 ký tự<\/p>/);
    assert.doesNotMatch(html, /aria-invalid/);
  });

  it("works identically for multiline textarea", () => {
    const html = renderToStaticMarkup(
      React.createElement(Field, {
        multiline: true,
        label: "Mô tả khóa học",
        helper: "Tối đa 500 ký tự",
      }),
    );

    assert.match(html, /<textarea/);
    assert.match(html, /aria-describedby="field-[^"]+-helper"/);
    assert.match(html, /class="[^"]*min-h-4[^"]*text-ink-secondary[^"]*">Tối đa 500 ký tự<\/p>/);
  });
});
