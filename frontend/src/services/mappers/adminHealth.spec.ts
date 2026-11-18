import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toSystemHealth } from "./adminHealth";

describe("toSystemHealth (GET /health body → SystemHealth)", () => {
  it("maps a healthy answer", () => {
    assert.deepEqual(
      toSystemHealth({ status: "UP", services: { database: "UP", redis: "UP" }, timestamp: "2026-11-14T15:14:39.901Z" }),
      { appServer: "UP", database: "UP", checkedAt: "2026-11-14T15:14:39.901Z" },
    );
  });

  it("keeps the app server UP and marks the database DOWN on a 503 DEGRADED body", () => {
    assert.deepEqual(toSystemHealth({ status: "DEGRADED", services: { database: "DOWN", redis: "UP" }, timestamp: "t" }), {
      appServer: "UP",
      database: "DOWN",
      checkedAt: "t",
    });
  });

  it("treats a missing or unknown database value as DOWN and a missing timestamp as undefined", () => {
    assert.deepEqual(toSystemHealth({ status: "UP" }), { appServer: "UP", database: "DOWN", checkedAt: undefined });
    assert.equal(toSystemHealth({ status: "UP", services: { database: "MAYBE" } }).database, "DOWN");
  });
});
