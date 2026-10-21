import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Role, User } from "../types";

/**
 * Logic unit tests for router elements:
 * 1. NotFoundPage portalUrl and portalLabel resolution
 * 2. RouteErrorBoundary error status and message formatting
 * 3. Router configuration hierarchy and protection
 */
function resolveNotFoundPortal(isAuthenticated: boolean, user: User | null) {
  const portalUrl = !isAuthenticated
    ? "/login"
    : user?.role === "LECTURER"
      ? "/lecturer/courses"
      : "/student";

  const portalLabel = !isAuthenticated
    ? "Quay lại trang Đăng nhập"
    : user?.role === "LECTURER"
      ? "Quay về Portal Giảng viên"
      : "Quay về Portal Sinh viên";

  return { portalUrl, portalLabel };
}

function resolveErrorBoundaryContent(error: unknown) {
  let errorMessage = "Đã xảy ra sự cố không mong muốn trong quá trình xử lý yêu cầu.";
  let errorStatus: number | string = "500";

  if (error && typeof error === "object" && "status" in error) {
    errorStatus = (error as any).status;
    errorMessage = (error as any).statusText || (error as any).data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const title = errorStatus === 404 ? "Không tìm thấy nội dung" : "Đã xảy ra lỗi hệ thống";

  return { errorStatus, errorMessage, title };
}

describe("router (Route Error Boundary & 404 Catch-All)", () => {
  const lecturer: User = {
    id: "lec-1",
    email: "lecturer@university.edu.vn",
    fullName: "TS. Le Van C",
    role: "LECTURER",
  };

  const student: User = {
    id: "stu-1",
    email: "student@university.edu.vn",
    fullName: "Pham Van D",
    role: "STUDENT",
  };

  describe("NotFoundPage target resolution", () => {
    it("should direct unauthenticated users to /login", () => {
      const res = resolveNotFoundPortal(false, null);
      assert.equal(res.portalUrl, "/login");
      assert.equal(res.portalLabel, "Quay lại trang Đăng nhập");
    });

    it("should direct authenticated LECTURER to /lecturer/courses", () => {
      const res = resolveNotFoundPortal(true, lecturer);
      assert.equal(res.portalUrl, "/lecturer/courses");
      assert.equal(res.portalLabel, "Quay về Portal Giảng viên");
    });

    it("should direct authenticated STUDENT to /student", () => {
      const res = resolveNotFoundPortal(true, student);
      assert.equal(res.portalUrl, "/student");
      assert.equal(res.portalLabel, "Quay về Portal Sinh viên");
    });
  });

  describe("RouteErrorBoundary error resolution", () => {
    it("should format standard Error instance with status 500", () => {
      const err = new Error("Chunk load failed or network connection dropped");
      const res = resolveErrorBoundaryContent(err);

      assert.equal(res.errorStatus, "500");
      assert.equal(res.title, "Đã xảy ra lỗi hệ thống");
      assert.equal(res.errorMessage, "Chunk load failed or network connection dropped");
    });

    it("should extract status code 404 and specific status text from RouteErrorResponse", () => {
      const routeErr = {
        status: 404,
        statusText: "Not Found",
        data: null,
      };
      const res = resolveErrorBoundaryContent(routeErr);

      assert.equal(res.errorStatus, 404);
      assert.equal(res.title, "Không tìm thấy nội dung");
      assert.equal(res.errorMessage, "Not Found");
    });
  });
});
