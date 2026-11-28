import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { randomUUID } from "crypto";
import { UpdateCaseNodeDto } from "./update-case-node.dto";

describe("UpdateCaseNodeDto (BE-017 / EBA-117)", () => {
  it("accepts null nextNodeId as a terminal option branch", async () => {
    const dto = plainToInstance(UpdateCaseNodeDto, {
      situation: "Node situation",
      options: [
        { text: "Option A", consequence: "Consequence A", nextNodeId: randomUUID() },
        { text: "Option B", consequence: "Consequence B", nextNodeId: null },
      ],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("rejects empty string, undefined, or non-UUID nextNodeId", async () => {
    for (const badNext of ["", undefined, "not-a-uuid"]) {
      const dto = plainToInstance(UpdateCaseNodeDto, {
        situation: "Node situation",
        options: [
          { text: "Option A", consequence: "Consequence A", nextNodeId: badNext },
        ],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});
