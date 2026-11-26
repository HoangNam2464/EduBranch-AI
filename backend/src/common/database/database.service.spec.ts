import { EventEmitter } from "events";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

/** Fake pg client/pool: EventEmitter throws on an "error" event without listeners, exactly like pg. */
class FakeClient extends EventEmitter {
  released: Array<Error | boolean | undefined> = [];
  release(destroy?: Error | boolean) {
    this.released.push(destroy);
  }
}
class FakePool extends EventEmitter {
  static last: FakePool;
  clients: FakeClient[] = [];
  constructor() {
    super();
    FakePool.last = this;
  }
  async connect() {
    const client = new FakeClient();
    this.clients.push(client);
    return client;
  }
  async query() {
    return { rows: [] };
  }
  async end() {}
}

jest.mock("pg", () => ({ Pool: FakePool }));

import { DatabaseService } from "./database.service";

const lostConnection = () => new Error("terminating connection due to administrator command");

async function createService() {
  const values: Record<string, string> = { POSTGRES_PASSWORD: "test", AUTO_MIGRATE: "false" };
  const config = { get: (key: string, fallback?: unknown) => values[key] ?? fallback } as unknown as ConfigService;
  const service = new DatabaseService(config);
  await service.onModuleInit();
  return { service, pool: FakePool.last };
}

describe("DatabaseService connection-loss handling", () => {
  let errorLog: jest.SpyInstance;

  beforeEach(() => {
    errorLog = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it("does not crash when PostgreSQL closes an idle pooled connection", async () => {
    const { pool } = await createService();
    expect(pool.listenerCount("error")).toBe(1);
    expect(() => pool.emit("error", lostConnection())).not.toThrow();
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("idle connection lost"));
  });

  it("keeps serving queries after an idle connection was lost", async () => {
    const { service, pool } = await createService();
    pool.emit("error", lostConnection());
    await expect(service.query("SELECT 1")).resolves.toEqual({ rows: [] });
  });

  it("does not crash when a checked-out client loses its connection between queries", async () => {
    const { service } = await createService();
    const client = (await service.getClient()) as unknown as FakeClient;
    expect(client.listenerCount("error")).toBe(1);
    expect(() => client.emit("error", lostConnection())).not.toThrow();
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("during a transaction"));
  });

  it("detaches its listener on release and still passes the destroy flag to pg", async () => {
    const { service } = await createService();
    const client = (await service.getClient()) as unknown as FakeClient;
    const failure = lostConnection();
    client.release(failure);
    expect(client.listenerCount("error")).toBe(0);
    expect(client.released).toEqual([failure]);
  });

  it("leaves no listener behind when the pool hands out the same client again", async () => {
    const { service, pool } = await createService();
    const shared = new FakeClient();
    const poolRelease = shared.release.bind(shared);
    // Like pg-pool `_acquireClient`: a fresh `release` is assigned on every checkout.
    pool.connect = async () => {
      shared.release = (destroy?: Error | boolean) => poolRelease(destroy);
      return shared;
    };
    for (let i = 0; i < 3; i++) {
      const client = (await service.getClient()) as unknown as FakeClient;
      expect(client.listenerCount("error")).toBe(1);
      client.release();
    }
    expect(shared.listenerCount("error")).toBe(0);
    expect(shared.released).toEqual([undefined, undefined, undefined]);
  });
});
