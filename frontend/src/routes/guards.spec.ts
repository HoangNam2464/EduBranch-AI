import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateRouteGuard, resolvePortal } from "@/routes/guards";
import { describeRouteError } from "@/pages/errors/describeRouteError";

describe("evaluateRouteGuard (shared PrivateRoute rules)", () => {
  it("sends signed-out users to /login (PrivateRoute remembers the target route)", () => {
    assert.deepEqual(evaluateRouteGuard(false, undefined, "STUDENT"), { allowed: false, kind: "signIn", redirectTo: "/login" });
  });

  it("treats a session without a role as signed out", () => {
    assert.deepEqual(evaluateRouteGuard(true, undefined, "LECTURER"), { allowed: false, kind: "signIn", redirectTo: "/login" });
  });

  it("allows each role into its own area", () => {
    assert.deepEqual(evaluateRouteGuard(true, "LECTURER", "LECTURER"), { allowed: true });
    assert.deepEqual(evaluateRouteGuard(true, "STUDENT", "STUDENT"), { allowed: true });
    assert.deepEqual(evaluateRouteGuard(true, "ADMIN", "ADMIN"), { allowed: true });
  });

  it("allows any signed-in role when no role is required", () => {
    assert.deepEqual(evaluateRouteGuard(true, "STUDENT"), { allowed: true });
  });

  it("shows 403 (Figma 01.4) when a STUDENT opens a lecturer page, with a link to /student", () => {
    assert.deepEqual(evaluateRouteGuard(true, "STUDENT", "LECTURER"), {
      allowed: false, kind: "forbidden", home: "/student", requiredRole: "LECTURER", userRole: "STUDENT",
    });
  });

  it("shows 403 when a LECTURER opens a student page, with a link to /lecturer/courses", () => {
    assert.deepEqual(evaluateRouteGuard(true, "LECTURER", "STUDENT"), {
      allowed: false, kind: "forbidden", home: "/lecturer/courses", requiredRole: "STUDENT", userRole: "LECTURER",
    });
  });

  it("shows 403 for admin routes to non-admins and for other areas to an ADMIN", () => {
    assert.equal((evaluateRouteGuard(true, "LECTURER", "ADMIN") as { kind: string }).kind, "forbidden");
    assert.equal((evaluateRouteGuard(true, "STUDENT", "ADMIN") as { kind: string }).kind, "forbidden");
    assert.equal((evaluateRouteGuard(true, "ADMIN", "LECTURER") as { home: string }).home, "/admin/dashboard");
  });
});

describe("resolvePortal (404 and error page 'back' button)", () => {
  it("sends signed-out users to /login", () => {
    assert.deepEqual(resolvePortal(false, undefined), { path: "/login", labelKey: "login" });
  });

  it("sends a LECTURER to /lecturer/courses", () => {
    assert.deepEqual(resolvePortal(true, "LECTURER"), { path: "/lecturer/courses", labelKey: "lecturer" });
  });

  it("sends a STUDENT to /student", () => {
    assert.deepEqual(resolvePortal(true, "STUDENT"), { path: "/student", labelKey: "student" });
  });

  it("sends an ADMIN to /admin/dashboard (not the student area)", () => {
    assert.deepEqual(resolvePortal(true, "ADMIN"), { path: "/admin/dashboard", labelKey: "admin" });
  });
});

describe("describeRouteError (route error page content)", () => {
  it("shows a thrown Error as a generic 500 with its message", () => {
    const view = describeRouteError(new Error("Chunk load failed or network connection dropped"));
    assert.equal(view.status, "500");
    assert.equal(view.titleKey, "errors.route.titleGeneric");
    assert.equal(view.message, "Chunk load failed or network connection dropped");
  });

  it("shows a router 404 response with its status text", () => {
    const view = describeRouteError({ status: 404, statusText: "Not Found", internal: false, data: null });
    assert.equal(view.status, 404);
    assert.equal(view.titleKey, "errors.route.titleNotFound");
    assert.equal(view.message, "Not Found");
  });

  it("falls back to the default message for unknown errors", () => {
    const view = describeRouteError("boom");
    assert.equal(view.status, "500");
    assert.equal(view.message, null);
  });
});
