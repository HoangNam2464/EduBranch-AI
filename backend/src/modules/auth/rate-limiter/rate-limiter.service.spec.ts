import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { RateLimiterService } from "./rate-limiter.service";

describe("RateLimiterService (EBA-106 AC 4, 5, 6)", () => {
  let service: RateLimiterService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "AUTH_RATE_LIMIT_MAX_REQUESTS") return 3;
      if (key === "AUTH_RATE_LIMIT_TTL_MS") return 1000; // 1 second for fast testing
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
    service.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    service.reset();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should allow initial valid request under limit and return correct remaining count", () => {
    const res = service.checkLimit("user-ip-1");

    expect(res.allowed).toBe(true);
    expect(res.count).toBe(1);
    expect(res.limit).toBe(3);
    expect(res.remaining).toBe(2);
    expect(res.resetTime).toBeGreaterThan(Date.now());
  });

  it("should allow sequential requests up to the maximum limit", () => {
    const res1 = service.checkLimit("user-ip-2");
    const res2 = service.checkLimit("user-ip-2");
    const res3 = service.checkLimit("user-ip-2");

    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should reject requests exceeding the configured limit with allowed = false", () => {
    // 3 allowed calls
    service.checkLimit("user-ip-3");
    service.checkLimit("user-ip-3");
    service.checkLimit("user-ip-3");

    // 4th call exceeds limit
    const resExceeded = service.checkLimit("user-ip-3");

    expect(resExceeded.allowed).toBe(false);
    expect(resExceeded.count).toBe(3);
    expect(resExceeded.remaining).toBe(0);
  });

  it("should reset the window and allow requests again after TTL expires", () => {
    let fakeNow = 1000000;
    jest.spyOn(Date, "now").mockImplementation(() => fakeNow);

    // Consume all 3 tokens at fakeNow
    service.checkLimit("user-ip-4", 3, 1000);
    service.checkLimit("user-ip-4", 3, 1000);
    service.checkLimit("user-ip-4", 3, 1000);

    const blocked = service.checkLimit("user-ip-4", 3, 1000);
    expect(blocked.allowed).toBe(false);

    // Advance time past the 1000ms TTL window
    fakeNow += 1001;

    // Next request should start a fresh window
    const freshRequest = service.checkLimit("user-ip-4", 3, 1000);
    expect(freshRequest.allowed).toBe(true);
    expect(freshRequest.count).toBe(1);
    expect(freshRequest.remaining).toBe(2);
  });

  it("should reset counters immediately upon manual reset()", () => {
    service.checkLimit("user-ip-5");
    service.checkLimit("user-ip-5");
    service.checkLimit("user-ip-5");

    expect(service.checkLimit("user-ip-5").allowed).toBe(false);

    // Manual reset for key
    service.reset("user-ip-5");

    const afterReset = service.checkLimit("user-ip-5");
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.count).toBe(1);
  });

  it("should isolate rate limits across different client keys", () => {
    // Exhaust user A
    service.checkLimit("ip-A");
    service.checkLimit("ip-A");
    service.checkLimit("ip-A");
    expect(service.checkLimit("ip-A").allowed).toBe(false);

    // User B is fresh and unrestricted
    const userB = service.checkLimit("ip-B");
    expect(userB.allowed).toBe(true);
    expect(userB.remaining).toBe(2);
  });
});
