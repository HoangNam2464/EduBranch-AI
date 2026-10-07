import { IsEmail, IsEnum, IsString, MinLength, MaxLength } from "class-validator";
import { Role } from "../auth.types";

export class RegisterDto {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(72, { message: "Password too long" })
  password!: string;

  @IsString()
  @MinLength(2, { message: "Full name must be at least 2 characters" })
  @MaxLength(100, { message: "Full name too long" })
  fullName!: string;

  @IsEnum(["LECTURER", "STUDENT"], { message: "Role must be LECTURER or STUDENT" })
  role!: Role;
}
