import { defineConfig } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Functional end-to-end tests against the running app + local backend with QA fixtures
// (tests/visual/seed-local.mjs writes the test accounts to .env.visual.local).
const envFile = join(dirname(fileURLToPath(import.meta.url)), "../../.env.visual.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

export default defineConfig({
  testDir: ".",
  outputDir: "../../test-results/e2e",
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.VISUAL_BASE_URL ?? "http://localhost:5173",
    channel: "chrome",
    viewport: { width: 1440, height: 1024 },
  },
});
