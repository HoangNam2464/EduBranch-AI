import { Injectable, Logger } from "@nestjs/common";
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
  }): Promise<any> {
    const url = `${this.baseUrl}/internal/v1/generation/generate-case`;
    this.logger.log(`Invoking AI Service case generation: ${url} for course ${payload.course_id}`);

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
      this.logger.error(`AI Service generation failed (${response.status}): ${errText}`);
      throw new Error(`AI Service generation error (${response.status}): ${errText}`);
    }

    return response.json();
  }
}
