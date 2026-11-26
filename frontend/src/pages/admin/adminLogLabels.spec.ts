import { describe, it } from "node:test";
import assert from "node:assert/strict";
import i18next from "i18next";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";
import { AUDIT_EVENT_TYPES, LOGIN_FAILURE_REASONS, eventLabel, eventMetaLabel } from "@/pages/admin/adminLogLabels";
import { ADMIN_LOG_EVENT_GROUPS } from "@/services/adminService";

const i18n = i18next.createInstance();
await i18n.init({ lng: "vi", resources: { vi: { translation: vi }, en: { translation: en } }, interpolation: { escapeValue: false } });
const tVi = i18n.getFixedT("vi");
const tEn = i18n.getFixedT("en");

describe("10.9 event labels (VI/EN)", () => {
  it("every audit event type has a VI and an EN label, never the raw code", () => {
    for (const code of AUDIT_EVENT_TYPES) {
      for (const t of [tVi, tEn]) {
        const label = eventLabel(t, code);
        assert.ok(label && label !== code && !label.startsWith("g6."), `${code} → ${label}`);
      }
    }
    assert.equal(eventLabel(tVi, "LOGIN_FAILED"), "Đăng nhập thất bại");
    assert.equal(eventLabel(tEn, "LOGIN_FAILED"), "Sign-in failed");
  });

  it("shows an unknown future code as sent instead of hiding it", () => {
    assert.equal(eventLabel(tVi, "SUBMISSION_CREATED"), "SUBMISSION_CREATED");
  });

  it("translates login failure reasons and case status changes, keeps names as typed", () => {
    for (const reason of LOGIN_FAILURE_REASONS) {
      assert.notEqual(eventMetaLabel(tVi, reason), reason);
      assert.notEqual(eventMetaLabel(tEn, reason), reason);
    }
    assert.equal(eventMetaLabel(tVi, "UNKNOWN_ACCOUNT"), "Tài khoản không tồn tại");
    assert.equal(eventMetaLabel(tEn, "Ca A · DRAFT → REVIEWED"), `Ca A · ${en.g3.status.DRAFT} → ${en.g3.status.REVIEWED}`);
    assert.equal(eventMetaLabel(tVi, "DRAFT → PUBLISHED"), "Bản nháp → Đã xuất bản");
    assert.equal(eventMetaLabel(tVi, "Ca A · 12.3s"), "Ca A · 12.3s");
    assert.equal(eventMetaLabel(tVi, "HTTP_504 · 30.0s"), "HTTP_504 · 30.0s");
    assert.equal(eventMetaLabel(tVi, "DRAFT"), "DRAFT", "a lone status word may be a typed name; only A → B is a status change");
    assert.equal(eventMetaLabel(tVi, undefined), "");
  });

  it("each filter group only uses audit event types the API accepts", () => {
    for (const types of Object.values(ADMIN_LOG_EVENT_GROUPS)) {
      for (const type of types) assert.ok((AUDIT_EVENT_TYPES as readonly string[]).includes(type), type);
    }
    assert.deepEqual([...ADMIN_LOG_EVENT_GROUPS.login], ["LOGIN_SUCCEEDED", "LOGIN_FAILED"]);
    assert.ok(!("submission" in ADMIN_LOG_EVENT_GROUPS), "no submission group while the API has no such event");
  });

  it("case cards count nodes with the right plural in EN (no '1 nodes')", () => {
    assert.equal(tEn("g3.list.nodes", { count: 1 }), "1 node");
    assert.equal(tEn("g3.list.nodes", { count: 3 }), "3 nodes");
    assert.equal(tVi("g3.list.nodes", { count: 1 }), "1 nút");
    assert.equal(tVi("g3.list.nodes", { count: 3 }), "3 nút");
  });
});
