import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

/**
 * Body of POST /cases/generate (BE-015). Mirrors the AI service contract
 * (ai-service/app/generation/schemas/requests.py CaseGenerationRequest): course_id UUID, material_ids a
 * non-empty list of UUIDs, num_nodes 2–10, optional topic hint and idempotency key. Invalid input is
 * rejected here with 400 instead of reaching SQL (500) or the AI service (502).
 */
export class GenerateCaseDto {
  @IsUUID()
  courseId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  materialIds!: string[];

  @IsOptional()
  @IsString()
  topicHint?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  numNodes?: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
