import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SendReplyDto {
  @IsString({ message: "reply must be a string" })
  @IsNotEmpty({ message: "reply is required" })
  @MinLength(1, { message: "reply cannot be empty" })
  @MaxLength(1000, { message: "reply cannot exceed 1000 characters" })
  reply: string;
}
