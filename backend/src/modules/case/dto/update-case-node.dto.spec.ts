import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateCaseNodeDto } from "./update-case-node.dto";

describe("UpdateCaseNodeDto", () => {
  it("accepts node text and a terminal option transition", async () => {
    const dto = plainToInstance(UpdateCaseNodeDto, {
      situation: "A valid situation",
      options: [{
        text: "Choose a response",
        consequence: "The response changes the outcome",
        nextNodeId: null,
      }],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects blank content, malformed node IDs, and a missing nextNodeId", async () => {
    const dto = plainToInstance(UpdateCaseNodeDto, {
      situation: " ",
      options: [
        { text: "", consequence: "A consequence", nextNodeId: "not-a-uuid" },
        { text: "Another option", consequence: "Another consequence" },
      ],
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain("situation");
    expect(errors.find((error) => error.property === "options")?.children).toHaveLength(2);
  });
});
