import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow access immediately if route is marked as @Public()", () => {
    const context = createMockContext();
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return undefined;
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should allow access if no @Roles() metadata is defined (authenticated by default)", () => {
    const context = createMockContext({ id: "user-1", role: "STUDENT" });
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return undefined;
      return undefined;
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should allow access when user role matches the required role", () => {
    const context = createMockContext({ id: "lecturer-1", role: "LECTURER" });
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return ["LECTURER"];
      return undefined;
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should allow access when user role matches one of multiple permitted roles", () => {
    const context = createMockContext({ id: "admin-1", role: "ADMIN" });
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return ["LECTURER", "ADMIN"];
      return undefined;
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should throw ForbiddenException when user is missing from request", () => {
    const context = createMockContext(undefined);
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return ["LECTURER"];
      return undefined;
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      "Forbidden resource: missing authenticated user role",
    );
  });

  it("should throw ForbiddenException when user has no role defined", () => {
    const context = createMockContext({ id: "user-no-role" });
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return ["LECTURER"];
      return undefined;
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException when user role does not match required role", () => {
    const context = createMockContext({ id: "student-1", role: "STUDENT" });
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return ["LECTURER"];
      return undefined;
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      "Forbidden resource: requires role LECTURER",
    );
  });
});
