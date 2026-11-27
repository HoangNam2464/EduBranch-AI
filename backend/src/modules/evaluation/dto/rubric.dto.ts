import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateIf } from "class-validator";

/** Absent is allowed; an explicit null is validated (and rejected), unlike @IsOptional(). */
const present = (_o: object, v: unknown) => v !== undefined;

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

/** FR-EVAL-01 / UX 07.8: three fixed criteria on a 1-5 scale, optional note. */
export class CreateRubricDto {
  @IsUUID()
  caseId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  realismScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  alignmentScore!: number;

  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateRubricDto {
  @ValidateIf(present)
  @IsInt()
  @Min(1)
  @Max(5)
  realismScore?: number;

  @ValidateIf(present)
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyScore?: number;

  @ValidateIf(present)
  @IsInt()
  @Min(1)
  @Max(5)
  alignmentScore?: number;

  @ValidateIf(present)
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ListRubricsQueryDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;
}

export class ExportQueryDto {
  @IsIn(["activity", "rubrics"])
  dataset!: "activity" | "rubrics";

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;
}
