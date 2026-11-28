import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from "class-validator";

/**
 * One option of a node in `PUT /cases/:id/nodes/:nodeId` (BE-017, FEATURE-CASE-REVIEW §6).
 * `id` keeps an existing option (and the student reasoning that points at it); an option
 * without `id` is created. FND §5 / EBA-117: `nextNodeId` references a node of the same case,
 * or `null` when this branch ends immediately.
 */
export class UpdateCaseNodeOptionDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: "Option text is required" })
  text!: string;

  @IsString()
  @IsNotEmpty({ message: "Option consequence is required" })
  consequence!: string;

  @ValidateIf((o) => o.nextNodeId !== null)
  @IsUUID(undefined, { message: "nextNodeId must be the id of a node in this case" })
  nextNodeId!: string | null;
}

/** Body of `PUT /cases/:id/nodes/:nodeId`. An empty `options` array makes the node terminal. */
export class UpdateCaseNodeDto {
  @IsString()
  @IsNotEmpty({ message: "Situation is required" })
  situation!: string;

  @IsArray()
  @ArrayMaxSize(4, { message: "A node has at most 4 options" })
  @ValidateNested({ each: true })
  @Type(() => UpdateCaseNodeOptionDto)
  options!: UpdateCaseNodeOptionDto[];
}
