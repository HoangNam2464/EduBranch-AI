import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export class UpdateCaseNodeOptionDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  text!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  consequence!: string;

  // Null is the explicit terminal transition; an omitted or malformed UUID is invalid.
  @ValidateIf((_object, value) => value !== null)
  @IsUUID("all")
  nextNodeId!: string | null;
}

export class UpdateCaseNodeDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  situation!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCaseNodeOptionDto)
  options!: UpdateCaseNodeOptionDto[];
}
