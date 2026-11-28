import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterMaterials, isAcceptedFile } from "@/pages/materials/materialFileRules";
import type { TeachingMaterial } from "@/types";

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("FE-003 isAcceptedFile", () => {
  it("accepts PDF and DOCX with a matching MIME type, in any extension case", () => {
    assert.equal(isAcceptedFile({ name: "a.pdf", type: PDF }), true);
    assert.equal(isAcceptedFile({ name: "B.DOCX", type: DOCX }), true);
  });
  it("leaves an empty MIME type to the server check", () => {
    assert.equal(isAcceptedFile({ name: "a.pdf", type: "" }), true);
  });
  it("rejects a renamed file whose MIME type does not match", () => {
    assert.equal(isAcceptedFile({ name: "virus.pdf", type: "application/x-msdownload" }), false);
    assert.equal(isAcceptedFile({ name: "notes.docx", type: "image/png" }), false);
  });
  it("rejects other extensions, legacy .doc and files without an extension", () => {
    assert.equal(isAcceptedFile({ name: "a.doc", type: "application/msword" }), false);
    assert.equal(isAcceptedFile({ name: "a.txt", type: "text/plain" }), false);
    assert.equal(isAcceptedFile({ name: "pdf", type: PDF }), false);
  });
});

describe("FE-004 filterMaterials", () => {
  const m = (id: string, file: string, status: TeachingMaterial["processingStatus"]) =>
    ({ id, originalFilename: file, processingStatus: status }) as TeachingMaterial;
  const list = [m("1", "a.pdf", "COMPLETED"), m("2", "b.docx", "FAILED"), m("3", "c.PDF", "PENDING"), m("4", "d.docx", "PROCESSING")];
  const ids = (xs: TeachingMaterial[]) => xs.map((x) => x.id);

  it("returns everything with no filter", () => {
    assert.deepEqual(ids(filterMaterials(list, "ALL", "ALL")), ["1", "2", "3", "4"]);
  });
  it("filters by each processing status", () => {
    assert.deepEqual(ids(filterMaterials(list, "FAILED", "ALL")), ["2"]);
    assert.deepEqual(ids(filterMaterials(list, "PENDING", "ALL")), ["3"]);
    assert.deepEqual(ids(filterMaterials(list, "PROCESSING", "ALL")), ["4"]);
    assert.deepEqual(ids(filterMaterials(list, "COMPLETED", "ALL")), ["1"]);
  });
  it("filters by file type, ignoring extension case", () => {
    assert.deepEqual(ids(filterMaterials(list, "ALL", "PDF")), ["1", "3"]);
    assert.deepEqual(ids(filterMaterials(list, "ALL", "DOCX")), ["2", "4"]);
  });
  it("combines both filters and can return an empty list", () => {
    assert.deepEqual(ids(filterMaterials(list, "COMPLETED", "PDF")), ["1"]);
    assert.deepEqual(ids(filterMaterials(list, "FAILED", "PDF")), []);
  });
});
