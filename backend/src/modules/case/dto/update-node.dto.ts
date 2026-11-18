import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateNodeOptionDto {
  @IsOptional()
  @IsUUID(4, { message: "Option ID must be a valid UUID" })
  id?: string;

  @IsString()
  @IsNotEmpty({ message: "Option text is required" })
  @MaxLength(1000, { message: "Option text too long" })
  option_text!: string;

  @IsString()
  @IsNotEmpty({ message: "Consequence text is required" })
  @MaxLength(2000, { message: "Consequence text too long" })
  consequence!: string;

  @IsOptional()
  @IsUUID(4, { message: "next_node_id must be a valid UUID" })
  next_node_id?: string | null;
}

export class UpdateNodeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Situation text cannot be empty" })
  @MaxLength(5000, { message: "Situation text too long" })
  situation?: string;

  @IsOptional()
  @IsBoolean()
  is_key_decision?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNodeOptionDto)
  options?: UpdateNodeOptionDto[];
}
