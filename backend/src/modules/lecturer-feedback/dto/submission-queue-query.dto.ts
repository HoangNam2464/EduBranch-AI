import { IsOptional, IsUUID } from "class-validator";

/**
 * Query parameters for GET /api/v1/lecturer-feedback/submissions (E7).
 * FR-13: optional courseId and caseId filters.
 */
export class SubmissionQueueQueryDto {
  @IsOptional()
  @IsUUID("all", { message: "courseId must be a valid UUID" })
  courseId?: string;

  @IsOptional()
  @IsUUID("all", { message: "caseId must be a valid UUID" })
  caseId?: string;
}
