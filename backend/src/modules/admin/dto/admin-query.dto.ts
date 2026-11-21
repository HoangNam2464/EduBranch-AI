import { Transform, Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

/** Shared paging (spec 007 contract: page >= 1, size 1..100, default 20). */
export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class AdminUsersQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn(["STUDENT", "LECTURER", "ADMIN"])
  role?: "STUDENT" | "LECTURER" | "ADMIN";

  @IsOptional()
  @IsIn(["ACTIVE", "LOCKED"])
  status?: "ACTIVE" | "LOCKED";

  /** Accepted for FE compatibility; ordering is fixed to newest first. */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  sort?: string;
}

export class AdminCoursesQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn(["ACTIVE", "ARCHIVED"])
  status?: "ACTIVE" | "ARCHIVED";
}

export class AdminCasesQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn(["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"])
  status?: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

  @IsOptional()
  @IsIn(["BRANCHING_STUDY", "REVIEW_STUDY"])
  learningMode?: "BRANCHING_STUDY" | "REVIEW_STUDY";

  @IsOptional()
  @IsUUID()
  courseId?: string;
}

export const LOG_TIME_RANGES = ["today", "7d", "30d", "all"] as const;

export class AdminLogsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn([
    "LOGIN_SUCCEEDED",
    "LOGIN_FAILED",
    "USER_LOCKED",
    "USER_UNLOCKED",
    "USER_ROLE_CHANGED",
    "CASE_GENERATED",
    "CASE_GENERATION_FAILED",
    "CASE_STATUS_CHANGED",
    "MATERIAL_UPLOADED",
    "SETTINGS_UPDATED",
  ])
  eventType?: string;

  @IsOptional()
  @IsIn(LOG_TIME_RANGES)
  timeRange?: (typeof LOG_TIME_RANGES)[number];
}

export class UpdateUserStatusDto {
  @IsIn(["ACTIVE", "LOCKED"])
  status!: "ACTIVE" | "LOCKED";
}

export class UpdateUserRoleDto {
  @IsIn(["STUDENT", "LECTURER", "ADMIN"])
  role!: "STUDENT" | "LECTURER" | "ADMIN";
}

/** Absent is allowed; an explicit null is validated (and rejected), unlike @IsOptional(). */
const present = (_o: object, v: unknown) => v !== undefined;

/** PUT /admin/settings — only the five platform-information fields are editable (AC-A11). */
export class UpdateSettingsDto {
  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  platformName?: string;

  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  operatorUnit?: string;

  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  loginNotice?: string;

  /** Empty string clears the address. */
  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  @Matches(/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "supportEmail must be an email or empty" })
  supportEmail?: string;

  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  aiPolicyNote?: string;
}
