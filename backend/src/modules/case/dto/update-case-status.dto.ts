import { IsIn } from "class-validator";

export const CASE_STATUSES = ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"] as const;
export type CaseStatusValue = (typeof CASE_STATUSES)[number];

export class UpdateCaseStatusDto {
  @IsIn(CASE_STATUSES)
  status!: CaseStatusValue;
}
