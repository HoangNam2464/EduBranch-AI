import { Transform } from "class-transformer";
import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

/** Absent is allowed; an explicit null is validated (and rejected), unlike @IsOptional(). */
const present = (_o: object, v: unknown) => v !== undefined;

export const PROFILE_LANGUAGES = ["vi", "en"] as const;
export type ProfileLanguage = (typeof PROFILE_LANGUAGES)[number];

/**
 * PATCH /users/me body (BE-031, spec 007 AC-P2/P3).
 * Only these two fields exist; any other field (email, role, password, id…)
 * is rejected by the global ValidationPipe (forbidNonWhitelisted).
 */
export class UpdateProfileDto {
  @ValidateIf(present)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: "Full name must be at least 2 characters" })
  @MaxLength(100, { message: "Full name too long" })
  fullName?: string;

  @ValidateIf(present)
  @IsIn(PROFILE_LANGUAGES, { message: "Language must be vi or en" })
  language?: ProfileLanguage;
}
