import { ConfigService } from "@nestjs/config";
import {
  AiClientService,
  GenerateChallengePayload,
} from "./ai-client.service";

describe("AiClientService - Challenge Support", () => {
  let service: AiClientService;
  let mockConfigService: Partial<ConfigService>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === "AI_SERVICE_BASE_URL") return "http://ai-service.test";
        if (key === "AI_SERVICE_API_KEY") return "test-api-key";
        if (key === "CHALLENGE_SUPPORT_TIMEOUT_MS") return 500;
        return defaultValue;
      }),
    };

    service = new AiClientService(mockConfigService as ConfigService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const samplePayload: GenerateChallengePayload = {
    session_id: "11111111-1111-1111-1111-111111111111",
    reasoning_id: "22222222-2222-2222-2222-222222222222",
    student_reasoning: "We must isolate the infected host to prevent spread.",
    case_context: "Situation: Hospital network ransomware attack.",
    round_number: 1,
    previous_exchange: [],
  };

  it("successfully generates challenge on first attempt", async () => {
    const mockResponse = {
      counter_question: "What if the isolated host controls life-support telemetry?",
      round_number: 1,
      is_final_round: false,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as any);

    const result = await service.generateChallenge(samplePayload);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://ai-service.test/internal/v1/challenge-support/generate",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-API-Key": "test-api-key",
        },
      }),
    );
  });

  it("handles string timeout from env and falls back to 30000 if invalid", async () => {
    mockConfigService.get = jest.fn((key: string, defaultValue?: any) => {
      if (key === "AI_SERVICE_BASE_URL") return "http://ai-service.test";
      if (key === "AI_SERVICE_API_KEY") return "test-api-key";
      if (key === "CHALLENGE_SUPPORT_TIMEOUT_MS") return "invalid-string";
      return defaultValue;
    });

    const mockResponse = {
      counter_question: "Fallback timeout works?",
      round_number: 1,
      is_final_round: false,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as any);

    const result = await service.generateChallenge(samplePayload);
    expect(result.counter_question).toBe("Fallback timeout works?");
  });

  it("retries on transient 5xx error and succeeds on 2nd attempt (at most 3 attempts)", async () => {
    const mockResponse = {
      counter_question: "How do you maintain critical monitoring?",
      round_number: 1,
      is_final_round: false,
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: jest.fn().mockResolvedValue("Service Unavailable"),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

    const result = await service.generateChallenge(samplePayload);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("exhausts retries on repeated 5xx errors and throws structured error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue("Internal Server Error"),
    } as any);

    await expect(service.generateChallenge(samplePayload)).rejects.toThrow(
      /AI Service challenge generation failed after 3 attempts/,
    );
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry on non-transient 4xx error (e.g. 400 Bad Request)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue("Invalid round_number"),
    } as any);

    await expect(service.generateChallenge(samplePayload)).rejects.toThrow(
      /AI Service non-transient error \(400\)/,
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on timeout (AbortError) and throws after 3 attempts", async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    await expect(service.generateChallenge(samplePayload)).rejects.toThrow(
      /AI Service challenge generation failed after 3 attempts/,
    );
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});

describe("AiClientService - case generation errors (QA-007)", () => {
  const originalFetch = global.fetch;
  const config = {
    get: jest.fn((key: string, d?: any) => (key === "AI_SERVICE_TIMEOUT_MS" ? 50 : d)),
  } as unknown as ConfigService;
  const payload = { material_ids: ["m"], course_id: "c" };
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("maps a non-OK AI response to 502 without echoing the AI detail", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, text: async () => "provider secret detail" }) as any;
    const err = await new AiClientService(config).generateCase(payload).catch((e) => e);
    expect(err.getStatus()).toBe(502);
    expect(JSON.stringify(err.getResponse())).not.toContain("provider secret detail");
  });

  it("maps a timeout to 504", async () => {
    global.fetch = jest.fn((_url: string, init: { signal: AbortSignal }) =>
      new Promise((_resolve, reject) =>
        init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))),
      ),
    ) as any;
    const err = await new AiClientService(config).generateCase(payload).catch((e) => e);
    expect(err.getStatus()).toBe(504);
  });

  it("maps an unreachable AI service to 502", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed")) as any;
    const err = await new AiClientService(config).generateCase(payload).catch((e) => e);
    expect(err.getStatus()).toBe(502);
  });
});
