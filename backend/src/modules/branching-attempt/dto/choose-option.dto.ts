import { IsUUID } from "class-validator";

export class ChooseOptionDto {
  @IsUUID()
  nodeId!: string;

  @IsUUID()
  selectedOptionId!: string;
}
