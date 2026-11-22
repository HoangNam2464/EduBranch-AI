import { Transform } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "isOneTargetXor", async: false })
export class IsOneTargetXorConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments) {
    const obj = args.object as Record<string, any>;
    const hasBranching =
      typeof obj.branchingAttemptId === "string" && obj.branchingAttemptId.trim().length > 0;
    const hasReview =
      typeof obj.reviewSubmissionId === "string" && obj.reviewSubmissionId.trim().length > 0;

    return (hasBranching || hasReview) && !(hasBranching && hasReview);
  }

  defaultMessage(_args: ValidationArguments) {
    return "Exactly one of branchingAttemptId or reviewSubmissionId must be provided";
  }
}

/**
 * Body of POST /api/v1/lecturer-feedback (E6).
 * FR-10: exactly one target (branchingAttemptId XOR reviewSubmissionId).
 * FR-05: feedbackText min 10 / max 3000 chars.
 */
export class CreateLecturerFeedbackDto {
  @IsOptional()
  @IsUUID("all", { message: "branchingAttemptId must be a valid UUID" })
  branchingAttemptId?: string;

  @IsOptional()
  @IsUUID("all", { message: "reviewSubmissionId must be a valid UUID" })
  reviewSubmissionId?: string;

  @Validate(IsOneTargetXorConstraint)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(10, { message: "feedbackText must be at least 10 characters long" })
  @MaxLength(3000, { message: "feedbackText must not exceed 3000 characters" })
  feedbackText!: string;
}
