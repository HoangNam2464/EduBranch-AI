import { IsString } from "class-validator";

export class SubmitReflectionDto {
  @IsString()
  reflectionText!: string;
}
