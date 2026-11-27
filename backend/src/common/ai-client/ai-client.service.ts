import { BadGatewayException, GatewayTimeoutException, HttpException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ProcessIngestionPayload {
  material_id: string;
  s3_object_key: string;
  course_id: string;
  mime_type: string;
}

export interface ProcessIngestionResult {
  status: string;
  material_id: string;
  chunk_count: number;
}

export interface GenerateChallengePayload {
  session_id: string;
  reasoning_id?: string;
  review_submission_id?: string;
  student_reasoning: string;
  case_context: string;
  round_number: number;
  retrieved_context?: string;
  previous_exchange?: Array<{ role: string; content: string }>;
}

export interface GenerateChallengeResult {
  counter_question: string;
  round_number: number;
  is_final_round: boolean;
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      "AI_SERVICE_BASE_URL",
      "http://localhost:8000",
    );
    this.apiKey = this.configService.get<string>(
      "AI_SERVICE_API_KEY",
      "changeme_internal_ai_service_api_key",
    );
  }

  async processMaterial(
    payload: ProcessIngestionPayload,
  ): Promise<ProcessIngestionResult> {
    const url = `${this.baseUrl}/internal/v1/ingestion/process`;
    this.logger.log(`Invoking AI Service ingestion: ${url} for material ${payload.material_id}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`AI Service ingestion failed (${response.status}): ${errText}`);
      throw new Error(`AI Service error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as ProcessIngestionResult;
    this.logger.log(`AI Service ingestion succeeded: ${data.chunk_count} chunks processed`);
    return data;
  }

  async generateCase(payload: {
    material_ids: string[];
    course_id: string;
    topic_hint?: string;
    num_nodes?: number;
    idempotency_key?: string;
  }): Promise<any> {
    const url = `${this.baseUrl}/internal/v1/generation/generate-case`;
    this.logger.log(`Invoking AI Service case generation: ${url} for course ${payload.course_id}`);

    const timeoutMs = this.configService.get<number>("AI_SERVICE_TIMEOUT_MS", 60000);
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-API-Key": this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // QA-007: an AI failure reaches the lecturer as 502 (504 on timeout), never as a 500;
      // the AI service detail stays in the log, not in the response.
      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`AI Service generation failed (${response.status}): ${errText}`);
        throw new BadGatewayException("The AI service could not generate the case");
      }

      return await response.json();
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      if (err?.name === "AbortError") {
        this.logger.error(`AI Service generation timed out after ${timeoutMs}ms`);
        throw new GatewayTimeoutException("The AI service did not answer in time");
      }
      this.logger.error(`AI Service generation unreachable: ${err?.message ?? err}`);
      throw new BadGatewayException("The AI service could not generate the case");
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  async queryRetrieval(payload: {
    query: string;
    course_id: string;
    material_ids?: string[];
    top_k?: number;
    include_rag_context?: boolean;
  }): Promise<{
    chunks: Array<{
      chunk_id: string;
      text: string;
      similarity: number;
      material_id: string;
      chunk_index: number;
      page_number?: number;
    }>;
    rag_context: string | null;
    total_chunks: number;
  }> {
    const url = `${this.baseUrl}/internal/v1/retrieval/query`;
    this.logger.log(`Invoking AI Service retrieval: ${url} for course ${payload.course_id}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`AI Service retrieval failed (${response.status}): ${errText}`);
      throw new Error(`AI Service retrieval error (${response.status}): ${errText}`);
    }

    return response.json();
  }

  async generateChallenge(
    payload: GenerateChallengePayload,
  ): Promise<GenerateChallengeResult> {
    const url = `${this.baseUrl}/internal/v1/challenge-support/generate`;
    this.logger.log(
      `Invoking AI Service challenge support: ${url} for session ${payload.session_id} (round ${payload.round_number})`,
    );

    const rawTimeout = this.configService.get<string | number>(
      "CHALLENGE_SUPPORT_TIMEOUT_MS",
      this.configService.get<string | number>("AI_SERVICE_TIMEOUT_MS", 30000),
    );
    const parsedTimeout = Number(rawTimeout);
    const timeoutMs =
      !isNaN(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 30000;

    const maxRetries = 2; // 1 initial + up to 2 retries = 3 attempts total
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-API-Key": this.apiKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const status = response.status;
          const errText = await response.text();

          // 5xx status codes are transient, eligible for retry
          if (status >= 500 && status < 600) {
            this.logger.warn(
              `AI Service challenge support failed with transient HTTP ${status} (attempt ${attempt}/${maxRetries + 1}): ${errText}`,
            );
            lastError = new Error(`AI Service transient error (${status}): ${errText}`);
            if (attempt <= maxRetries) {
              continue;
            }
          } else {
            // 4xx status codes are client errors, do not retry
            this.logger.error(
              `AI Service challenge support failed with non-transient HTTP ${status}: ${errText}`,
            );
            throw new Error(`AI Service non-transient error (${status}): ${errText}`);
          }
        } else {
          const data = (await response.json()) as GenerateChallengeResult;
          this.logger.log(
            `AI Service challenge support succeeded for session ${payload.session_id} (round ${data.round_number})`,
          );
          return data;
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          this.logger.warn(
            `AI Service challenge support timed out after ${timeoutMs}ms (attempt ${attempt}/${maxRetries + 1})`,
          );
          lastError = new Error(`AI Service challenge support timed out after ${timeoutMs}ms`);
          if (attempt <= maxRetries) {
            continue;
          }
        } else if (err.message && err.message.startsWith("AI Service non-transient error")) {
          throw err;
        } else {
          // Network errors (e.g. fetch failed) are transient
          this.logger.warn(
            `AI Service challenge support network/transient error (attempt ${attempt}/${maxRetries + 1}): ${err.message}`,
          );
          lastError = err;
          if (attempt <= maxRetries) {
            continue;
          }
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    this.logger.error(
      `AI Service challenge support exhausted all ${maxRetries + 1} attempts for session ${payload.session_id}`,
    );
    throw new Error(
      `AI Service challenge generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
    );
  }
}
