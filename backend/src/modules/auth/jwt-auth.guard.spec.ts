import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  const createMockContext = (): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should return true immediately if route is marked with @Public()", () => {
    const context = createMockContext();
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    expect(result).toBe(true);
  });

  it("should delegate to super.canActivate if route is not public", () => {
    const context = createMockContext();
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

    // Mock parent class canActivate
    const superCanActivateSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), "canActivate")
      .mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);

    superCanActivateSpy.mockRestore();
  });
});
