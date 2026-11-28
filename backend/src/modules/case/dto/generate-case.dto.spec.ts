import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { GenerateCaseDto } from "./generate-case.dto";

const COURSE = "00000000-0000-4000-8000-0000000000c1";
const MAT = "00000000-0000-4000-8000-0000000000a1";

async function errorsFor(body: unknown) {
  return validate(plainToInstance(GenerateCaseDto, body), { whitelist: true, forbidNonWhitelisted: true });
}
const props = async (body: unknown) => (await errorsFor(body)).map((e) => e.property);

describe("GenerateCaseDto (BE-015, mirrors the AI CaseGenerationRequest)", () => {
  it("accepts the minimal body the frontend sends", async () => {
    expect(await errorsFor({ courseId: COURSE, materialIds: [MAT] })).toHaveLength(0);
  });

  it("accepts every optional field at its bounds", async () => {
    for (const numNodes of [2, 10]) {
      expect(await errorsFor({ courseId: COURSE, materialIds: [MAT], topicHint: "t", numNodes, idempotencyKey: "k" })).toHaveLength(0);
    }
  });

  it("rejects a course id that is not a UUID", async () => {
    expect(await props({ courseId: "c1", materialIds: [MAT] })).toEqual(["courseId"]);
    expect(await props({ materialIds: [MAT] })).toEqual(["courseId"]);
  });

  it("rejects missing, empty, non-array or non-UUID material ids", async () => {
    for (const materialIds of [undefined, [], MAT, ["m1"], [MAT, "x"]]) {
      expect(await props({ courseId: COURSE, materialIds })).toEqual(["materialIds"]);
    }
  });

  it("rejects numNodes outside 2–10, fractions and strings", async () => {
    for (const numNodes of [1, 11, 0, -3, 2.5, "4"]) {
      expect(await props({ courseId: COURSE, materialIds: [MAT], numNodes })).toEqual(["numNodes"]);
    }
  });

  it("rejects non-string topicHint / idempotencyKey and unknown fields", async () => {
    expect(await props({ courseId: COURSE, materialIds: [MAT], topicHint: 5 })).toEqual(["topicHint"]);
    expect(await props({ courseId: COURSE, materialIds: [MAT], idempotencyKey: {} })).toEqual(["idempotencyKey"]);
    expect(await props({ courseId: COURSE, materialIds: [MAT], status: "PUBLISHED" })).toEqual(["status"]);
  });
});
