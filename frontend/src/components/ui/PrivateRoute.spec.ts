import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Role, User } from "../../types";

/**
 * Pure logic test suite for PrivateRoute guard rules
 * Mirrors PrivateRoute.tsx decision tree:
 * 1. !isAuthenticated -> redirect to /login with state: { from: location }
 * 2. role mismatch -> redirect to role home (/lecturer/courses or /student)
 * 3. role matches or no role required -> grant access
 */
function evaluatePrivateRouteGuard(
  isAuthenticated: boolean,
  user: User | null,
  requiredRole?: Role,
  currentLocation = "/lecturer/courses"
) {
  if (!isAuthenticated) {
    return {
      allowed: false,
      redirectTo: "/login",
      state: { from: currentLocation },
    };
  }

  if (requiredRole && user?.role !== requiredRole) {
    const home = user?.role === "LECTURER" ? "/lecturer/courses" : "/student";
    return {
      allowed: false,
      redirectTo: home,
      state: undefined,
    };
  }

  return {
    allowed: true,
    redirectTo: null,
    state: undefined,
  };
}

describe("PrivateRoute (Role Guard & Protected Routing)", () => {
  const lecturerUser: User = {
    id: "lec-1",
    email: "lecturer@university.edu.vn",
    fullName: "TS. Nguyen Van A",
    role: "LECTURER",
  };

  const studentUser: User = {
    id: "stu-1",
    email: "student@university.edu.vn",
    fullName: "Nguyen Van B",
    role: "STUDENT",
  };

  it("should redirect unauthenticated users to /login preserving current target route in state", () => {
    const targetUrl = "/student/cases/case-123/branching-play";
    const decision = evaluatePrivateRouteGuard(false, null, "STUDENT", targetUrl);

    assert.equal(decision.allowed, false);
    assert.equal(decision.redirectTo, "/login");
    assert.deepEqual(decision.state, { from: targetUrl });
  });

  it("should grant access when user is authenticated with matching role LECTURER", () => {
    const decision = evaluatePrivateRouteGuard(true, lecturerUser, "LECTURER", "/lecturer/courses");

    assert.equal(decision.allowed, true);
    assert.equal(decision.redirectTo, null);
  });

  it("should grant access when user is authenticated with matching role STUDENT", () => {
    const decision = evaluatePrivateRouteGuard(true, studentUser, "STUDENT", "/student/cases/c1/branching-play");

    assert.equal(decision.allowed, true);
    assert.equal(decision.redirectTo, null);
  });

  it("should redirect STUDENT to /student when attempting to access LECTURER route", () => {
    const decision = evaluatePrivateRouteGuard(true, studentUser, "LECTURER", "/lecturer/courses");

    assert.equal(decision.allowed, false);
    assert.equal(decision.redirectTo, "/student");
  });

  it("should redirect LECTURER to /lecturer/courses when attempting to access STUDENT route", () => {
    const decision = evaluatePrivateRouteGuard(true, lecturerUser, "STUDENT", "/student/cases/c1/branching-play");

    assert.equal(decision.allowed, false);
    assert.equal(decision.redirectTo, "/lecturer/courses");
  });
});
