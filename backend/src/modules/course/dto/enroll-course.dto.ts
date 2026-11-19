import { IsNotEmpty, IsString, Length } from "class-validator";

export class EnrollCourseDto {
  @IsNotEmpty({ message: "Invite code is required" })
  @IsString({ message: "Invite code must be a string" })
  @Length(4, 32, { message: "Invite code must be between 4 and 32 characters" })
  inviteCode: string;
}
