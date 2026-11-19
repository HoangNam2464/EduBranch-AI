import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateSessionDto {
  @IsUUID("all", { message: "reasoningId must be a valid UUID" })
  @IsNotEmpty({ message: "reasoningId is required" })
  reasoningId: string;
}
