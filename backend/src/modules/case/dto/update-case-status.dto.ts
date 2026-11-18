import { IsIn } from "class-validator";

export const CASE_STATUSES = ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export class UpdateCaseStatusDto {
  @IsIn(CASE_STATUSES)
  status!: CaseStatus;
}
