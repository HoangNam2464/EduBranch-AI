import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RateLimiterGuard } from "./rate-limiter.guard";
import { RateLimiterService } from "../rate-limiter/rate-limiter.service";
import { RATE_LIMIT_KEY } from "../decorators/rate-limit.decorator";

describe("RateLimiterGuard (EBA-106 AC 4, 5)", () => {
  let guard: RateLimiterGuard;
  let reflector: Reflector;
  let rateLimiterService: RateLimiterService;

  beforeEach(() => {
    reflector = new Reflector();
    rateLimiterService = new RateLimiterService({
      get: jest.fn((key: string) => {
        if (key === "AUTH_RATE_LIMIT_MAX_REQUESTS") return 3;
        if (key === "AUTH_RATE_LIMIT_TTL_MS") return 60000;
        return undefined;
      }),
    } as any);

    guard = new RateLimiterGuard(rateLimiterService, reflector);
  });

  const createMockContext = (ip = "127.0.0.1", path = "/api/v1/auth/login") => {
    const headers: Record<string, string> = {};
    const setHeaderMock = jest.fn((k: string, v: string) => {
      headers[k] = v;
    });

    const mockRequest = {
      ip,
      path,
      headers: {},
      socket: { remoteAddress: ip },
    };

    const mockResponse = {
      setHeader: setHeaderMock,
    };

    const mockHandler = () => {};
    const mockClass = class {};

    const context = {
      getHandler: jest.fn().mockReturnValue(mockHandler),
      getClass: jest.fn().mockReturnValue(mockClass),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;

    return { context, setHeaderMock, headers };
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow valid requests under limit and set standard rate limit response headers", () => {
    const { context, setHeaderMock } = createMockContext("192.168.1.100");

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Limit", "3");
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Remaining", "2");
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Reset", expect.any(String));
  });

  it("should throw HTTP 429 Too Many Requests when rate limit is exceeded", () => {
    const ip = "10.0.0.5";

    // Consume first 3 allowed requests
    guard.canActivate(createMockContext(ip).context);
    guard.canActivate(createMockContext(ip).context);
    guard.canActivate(createMockContext(ip).context);

    // 4th request must throw HttpException with 429 status code
    const fourthContext = createMockContext(ip).context;

    try {
      guard.canActivate(fourthContext);
      fail("Should have thrown HTTP 429 HttpException");
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.getResponse()).toEqual({
        statusCode: 429,
        message: "Too many requests. Please try again later.",
        error: "Too Many Requests",
      });
    }
  });

  it("should honor custom @RateLimit options provided via Reflector", () => {
    const { context } = createMockContext("172.16.0.1", "/custom-route");

    // Mock custom @RateLimit({ limit: 1, ttlMs: 5000 })
    jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
      if (key === RATE_LIMIT_KEY) {
        return { limit: 1, ttlMs: 5000 };
      }
      return undefined;
    });

    // 1st request succeeds
    expect(guard.canActivate(context)).toBe(true);

    // 2nd request immediately blocked due to limit = 1
    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it("should allow requests again after window is reset", () => {
    let fakeNow = 2000000;
    jest.spyOn(Date, "now").mockImplementation(() => fakeNow);

    const ip = "192.168.1.50";

    // Exhaust limit (3 requests)
    guard.canActivate(createMockContext(ip).context);
    guard.canActivate(createMockContext(ip).context);
    guard.canActivate(createMockContext(ip).context);

    expect(() => guard.canActivate(createMockContext(ip).context)).toThrow(HttpException);

    // Advance time past 60s window
    fakeNow += 60001;

    // Fresh request should be permitted
    const resAfterReset = guard.canActivate(createMockContext(ip).context);
    expect(resAfterReset).toBe(true);
  });
});
