import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface AiHealth {
  status: "UP" | "DOWN";
  provider: string | null;
  model: string | null;
  version: string | null;
}

/**
 * Reads the AI service's public `GET /health` (no API key, no secrets) for the
 * admin screens 10.2 and 10.7 (spec 007 AC-A2, AC-A8; OPD-013: read-only).
 */
@Injectable()
export class AiHealthService {
  private readonly logger = new Logger(AiHealthService.name);

  constructor(private readonly config: ConfigService) {}

  async check(timeoutMs = 2000): Promise<AiHealth> {
    const baseUrl = this.config.get<string>("AI_SERVICE_BASE_URL", "http://localhost:8000");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/health`, { signal: controller.signal });
      if (!res.ok) return { status: "DOWN", provider: null, model: null, version: null };
      const body = (await res.json()) as Record<string, unknown>;
      const str = (v: unknown) => (typeof v === "string" && v.length <= 100 ? v : null);
      return {
        status: body.status === "UP" ? "UP" : "DOWN",
        provider: str(body.provider),
        model: str(body.model),
        version: str(body.version),
      };
    } catch (err) {
      this.logger.warn(`AI service health check failed: ${err instanceof Error ? err.message : String(err)}`);
      return { status: "DOWN", provider: null, model: null, version: null };
    } finally {
      clearTimeout(timer);
    }
  }
}
