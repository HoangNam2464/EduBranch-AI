import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Body of POST /api/v1/review-study/submissions/:submissionId/reflection (E4).
 * FR-05, FR-07: reflectionText min 10 / max 3000 chars. R-TRIM: text trimmed.
 */
export class SubmitReflectionDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(10, { message: "reflectionText must be at least 10 characters long" })
  @MaxLength(3000, { message: "reflectionText must not exceed 3000 characters" })
  reflectionText!: string;
}
