import { IsString, IsUUID } from "class-validator";

export class SaveReasoningDto {
  @IsUUID()
  nodeId!: string;

  @IsString()
  reasoningText!: string;
}
