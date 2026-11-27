import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import { AUDIT_EVENT_TYPES } from "../../../common/audit/audit.types";

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
export const LOG_ORDERS = ["newest", "oldest"] as const;

/** `eventType=A` or `eventType=A,B` (or the parameter repeated) → ["A", "B"]; empty → undefined. */
const toEventTypeList = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === "") return undefined;
  const list = (Array.isArray(value) ? value : [value])
    .flatMap((v) => String(v).split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
};

export class AdminLogsQueryDto extends PageQueryDto {
  /** One or more audit event types; a filter group such as "sign-in" sends LOGIN_SUCCEEDED,LOGIN_FAILED. */
  @IsOptional()
  @Transform(toEventTypeList)
  @IsArray()
  @ArrayMaxSize(AUDIT_EVENT_TYPES.length)
  @IsIn(AUDIT_EVENT_TYPES, { each: true })
  eventType?: string[] | string;

  @IsOptional()
  @IsIn(LOG_TIME_RANGES)
  timeRange?: (typeof LOG_TIME_RANGES)[number];

  /** Newest first by default. Applied in SQL so every page follows the same order. */
  @IsOptional()
  @IsIn(LOG_ORDERS)
  order?: (typeof LOG_ORDERS)[number];
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
