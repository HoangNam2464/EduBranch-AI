import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";

export class CreateCourseDto {
  @IsString()
  @MinLength(2, { message: "Course name must be at least 2 characters" })
  @MaxLength(200, { message: "Course name too long" })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Description too long" })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: "Course code too long" })
  courseCode?: string;
}
