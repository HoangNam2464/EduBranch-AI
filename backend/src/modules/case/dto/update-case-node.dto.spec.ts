import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateCaseNodeDto } from "./update-case-node.dto";

const NODE = "00000000-0000-4000-8000-000000000002";

async function errorsFor(body: unknown) {
  const dto = plainToInstance(UpdateCaseNodeDto, body);
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe("UpdateCaseNodeDto", () => {
  it("accepts a situation with options that lead to nodes", async () => {
    expect(await errorsFor({ situation: "S", options: [{ text: "A", consequence: "C", nextNodeId: NODE }] })).toHaveLength(0);
  });

  it("accepts a terminal node (no options)", async () => {
    expect(await errorsFor({ situation: "S", options: [] })).toHaveLength(0);
  });

  it("rejects an option without a next node (FND §5)", async () => {
    expect((await errorsFor({ situation: "S", options: [{ text: "A", consequence: "C", nextNodeId: null }] })).length).toBeGreaterThan(0);
  });

  it("rejects more than four options", async () => {
    const o = { text: "A", consequence: "C", nextNodeId: NODE };
    expect((await errorsFor({ situation: "S", options: [o, o, o, o, o] })).length).toBeGreaterThan(0);
  });

  it("rejects unknown fields", async () => {
    expect((await errorsFor({ situation: "S", options: [], status: "PUBLISHED" })).length).toBeGreaterThan(0);
  });
});
