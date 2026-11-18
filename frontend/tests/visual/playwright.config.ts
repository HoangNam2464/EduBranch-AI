import { defineConfig } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Local test accounts written by tests/visual/seed-local.mjs (git-ignored). Real env vars win.
const envFile = join(dirname(fileURLToPath(import.meta.url)), "../../.env.visual.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

/**
 * Visual QA against approved Figma frames. Local gate (see CLAUDE.md "Visual QA gate").
 * Uses the locally installed Google Chrome (no browser download). Start the dev server
 * first (`npm run dev`); frames that need API data also need the backend running.
 */
export default defineConfig({
  testDir: ".",
  testMatch: "visual.spec.ts",
  globalSetup: "./global-setup.ts",
  outputDir: "../../test-results/visual/artifacts",
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: process.env.VISUAL_BASE_URL ?? "http://localhost:5173",
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "vi-VN",
    launchOptions: { args: ["--hide-scrollbars", "--font-render-hinting=none"] },
  },
});
