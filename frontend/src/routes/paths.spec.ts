import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PATHS, ROLE_HOME, ROLE_ROOT, buildPath, withQuery } from "@/routes/paths";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Collects every leaf string of the PATHS dictionary. */
function allPaths(node: unknown): string[] {
  if (typeof node === "string") return [node];
  return Object.values(node as Record<string, unknown>).flatMap(allPaths);
}

/** Collects dotted keys of a nested locale object. */
function keysOf(node: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(node).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keysOf(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("PATHS dictionary", () => {
  it("has absolute, unique paths", () => {
    const paths = allPaths(PATHS);
    for (const p of paths) assert.ok(p.startsWith("/"), `not absolute: ${p}`);
    assert.equal(new Set(paths).size, paths.length, "duplicate path in PATHS");
  });

  it("keeps each role's routes inside that role's tree", () => {
    for (const p of allPaths(PATHS.LECTURER)) assert.ok(p.startsWith(PATHS.LECTURER.ROOT));
    for (const p of allPaths(PATHS.STUDENT)) assert.ok(p.startsWith(PATHS.STUDENT.ROOT));
    for (const p of allPaths(PATHS.ADMIN)) assert.ok(p.startsWith(PATHS.ADMIN.ROOT));
  });

  it("maps each role to a home inside its own tree", () => {
    assert.equal(ROLE_HOME.LECTURER, "/lecturer/courses");
    assert.equal(ROLE_HOME.STUDENT, "/student");
    assert.equal(ROLE_HOME.ADMIN, "/admin/dashboard");
    for (const role of ["LECTURER", "STUDENT", "ADMIN"] as const) {
      assert.ok(ROLE_HOME[role].startsWith(ROLE_ROOT[role]));
    }
  });
});

describe("buildPath", () => {
  it("fills route params", () => {
    assert.equal(buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: "c1" }), "/lecturer/cases/c1/review");
    assert.equal(
      buildPath(PATHS.STUDENT.BRANCHING_REVIEW, { caseId: "cs301", attemptId: "attempt-2" }),
      "/student/cases/cs301/attempt/attempt-2/review",
    );
    assert.equal(
      buildPath(PATHS.LECTURER.MATERIAL_SOURCES, { courseId: 7, materialId: "m-1" }),
      "/lecturer/courses/7/materials/m-1/rag",
    );
  });

  it("URI-encodes values so they cannot inject path segments", () => {
    assert.equal(buildPath(PATHS.LECTURER.FEEDBACK_DETAIL, { submissionId: "a/b?c" }), "/lecturer/feedback/a%2Fb%3Fc");
  });

  it("throws on a missing or empty param instead of producing /undefined", () => {
    assert.throws(() => buildPath(PATHS.LECTURER.CASE_REVIEW, {}), /missing param "caseId"/);
    assert.throws(() => buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: undefined }), /missing param/);
    assert.throws(() => buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: "" }), /missing param/);
  });

  it("returns static paths unchanged", () => {
    assert.equal(buildPath(PATHS.AUTH.LOGIN), "/login");
  });
});

describe("withQuery", () => {
  it("appends non-empty query values", () => {
    assert.equal(withQuery(PATHS.STUDENT.COURSES, { join: true }), "/student/courses?join=true");
    assert.equal(withQuery(PATHS.STUDENT.COURSES, { join: undefined, q: "" }), "/student/courses");
  });
});

describe("locales", () => {
  it("vi and en define the same keys", () => {
    assert.deepEqual(keysOf(vi).sort(), keysOf(en).sort());
  });

  it("locales directory contains only vi.json and en.json", () => {
    const dir = fileURLToPath(new URL("../locales/", import.meta.url));
    const files = readdirSync(dir).sort();
    assert.deepEqual(files, ["en.json", "vi.json"]);
  });

  it("have a label for every portal the error pages can return", () => {
    for (const key of ["login", "lecturer", "student", "admin"]) {
      assert.ok((vi.errors.portal as Record<string, string>)[key]);
      assert.ok((en.errors.portal as Record<string, string>)[key]);
    }
  });
});
