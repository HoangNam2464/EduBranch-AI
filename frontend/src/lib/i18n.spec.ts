import { describe, it } from "node:test";
import assert from "node:assert/strict";
import i18n, { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, syncDocumentLanguage } from "@/lib/i18n";

describe("i18n (Language Configuration & Document Lang Sync)", () => {
  it("defaults to Vietnamese with supported languages vi and en", () => {
    assert.equal(DEFAULT_LANGUAGE, "vi");
    assert.deepEqual([...SUPPORTED_LANGUAGES], ["vi", "en"]);
  });

  it("safely handles non-browser environments without document", () => {
    // Should not throw ReferenceError when document is not present
    assert.doesNotThrow(() => {
      syncDocumentLanguage("en");
      syncDocumentLanguage(null);
    });
  });

  it("updates document.documentElement.lang when document is defined", () => {
    const fakeHtml = { lang: "initial" };
    (globalThis as unknown as { document: { documentElement: { lang: string } } }).document = {
      documentElement: fakeHtml,
    };

    try {
      syncDocumentLanguage("en");
      assert.equal(fakeHtml.lang, "en");

      syncDocumentLanguage("vi");
      assert.equal(fakeHtml.lang, "vi");

      // Fallback on empty/null/undefined
      syncDocumentLanguage(null);
      assert.equal(fakeHtml.lang, "vi");

      // Also verify i18n languageChanged listener syncs
      i18n.emit("languageChanged", "en");
      assert.equal(fakeHtml.lang, "en");

      i18n.emit("languageChanged", "vi");
      assert.equal(fakeHtml.lang, "vi");
    } finally {
      delete (globalThis as Record<string, unknown>).document;
    }
  });
});
