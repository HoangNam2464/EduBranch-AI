import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AdminLogsQueryDto } from "./admin-query.dto";

/** Same pipe options as main.ts: whitelist + forbidNonWhitelisted + transform. */
async function parse(query: Record<string, unknown>) {
  const dto = plainToInstance(AdminLogsQueryDto, query);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return { dto, errors };
}

describe("AdminLogsQueryDto (GET /admin/logs, 10.9)", () => {
  it("keeps a single event type working (existing contract)", async () => {
    const { dto, errors } = await parse({ eventType: "LOGIN_FAILED" });
    expect(errors).toHaveLength(0);
    expect(dto.eventType).toEqual(["LOGIN_FAILED"]);
  });

  it("accepts a group as a comma-separated list, e.g. sign-in = succeeded + failed", async () => {
    const { dto, errors } = await parse({ eventType: "LOGIN_SUCCEEDED, LOGIN_FAILED" });
    expect(errors).toHaveLength(0);
    expect(dto.eventType).toEqual(["LOGIN_SUCCEEDED", "LOGIN_FAILED"]);
  });

  it("accepts the parameter repeated (eventType=A&eventType=B)", async () => {
    const { dto, errors } = await parse({ eventType: ["CASE_GENERATED", "CASE_GENERATION_FAILED"] });
    expect(errors).toHaveLength(0);
    expect(dto.eventType).toEqual(["CASE_GENERATED", "CASE_GENERATION_FAILED"]);
  });

  it("rejects any unknown code in the list, so nothing outside the audit types reaches SQL", async () => {
    expect((await parse({ eventType: "LOGIN_FAILED,SUBMISSION_CREATED" })).errors.length).toBeGreaterThan(0);
    expect((await parse({ eventType: "LOGIN_FAILED,'; DROP TABLE users;--" })).errors.length).toBeGreaterThan(0);
    expect((await parse({ eventType: "Đăng nhập" })).errors.length).toBeGreaterThan(0);
  });

  it("rejects more codes than audit types exist", async () => {
    const tooMany = Array.from({ length: 11 }, () => "LOGIN_FAILED").join(",");
    expect((await parse({ eventType: tooMany })).errors.length).toBeGreaterThan(0);
  });

  it("treats an empty filter as no filter", async () => {
    const { dto, errors } = await parse({ eventType: "" });
    expect(errors).toHaveLength(0);
    expect(dto.eventType).toBeUndefined();
  });

  it("accepts order newest|oldest only", async () => {
    expect((await parse({ order: "oldest" })).errors).toHaveLength(0);
    expect((await parse({ order: "newest" })).errors).toHaveLength(0);
    expect((await parse({ order: "ASC; DROP TABLE users" })).errors.length).toBeGreaterThan(0);
  });

  it("still rejects the old time range values the UI used to send", async () => {
    expect((await parse({ timeRange: "TODAY" })).errors.length).toBeGreaterThan(0);
    expect((await parse({ timeRange: "7d" })).errors).toHaveLength(0);
  });
});
