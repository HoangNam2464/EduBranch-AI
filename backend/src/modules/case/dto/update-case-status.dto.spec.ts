import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CASE_STATUSES, UpdateCaseStatusDto } from "./update-case-status.dto";

describe("UpdateCaseStatusDto", () => {
  it.each(CASE_STATUSES)("accepts status %s", async (status) => {
    const dto = plainToInstance(UpdateCaseStatusDto, { status });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects statuses outside the lifecycle", async () => {
    const dto = plainToInstance(UpdateCaseStatusDto, { status: "ARCHIVED" });
    await expect(validate(dto)).resolves.toHaveLength(1);
  });
});
