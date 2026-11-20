import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Body of POST /api/v1/cases/:caseId/review-study/submit (E1).
 * FR-04: proposedSolution and reasoningText min 10 chars. studentAnalysis is optional.
 * FR-05: max 3000 chars. R-TRIM: text trimmed before length validation.
 */
export class SubmitReviewStudyDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return value;
  })
  @IsString()
  @MaxLength(3000, { message: "studentAnalysis must not exceed 3000 characters" })
  studentAnalysis?: string | null;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(10, { message: "proposedSolution must be at least 10 characters long" })
  @MaxLength(3000, { message: "proposedSolution must not exceed 3000 characters" })
  proposedSolution!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(10, { message: "reasoningText must be at least 10 characters long" })
  @MaxLength(3000, { message: "reasoningText must not exceed 3000 characters" })
  reasoningText!: string;
}
