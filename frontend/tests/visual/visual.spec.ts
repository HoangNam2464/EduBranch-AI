import { test, expect } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SCREENS } from "./screens";
import { diffAgainstFigma } from "./pixelDiff";
import { backendReachable, credentialsFor, prepareSession, resolveRoute } from "./session";

const here = dirname(fileURLToPath(import.meta.url));
const FIGMA_DIR = join(here, "figma");
const OUT_DIR = join(here, "../../test-results/visual");

let backendUp: boolean | undefined;

for (const screen of SCREENS) {
  test(`${screen.code} ${screen.name}`, async ({ page }, testInfo) => {
    const baseline = join(FIGMA_DIR, `${screen.code}.png`);
    test.skip(!existsSync(baseline), `NOT VERIFIED: Figma baseline figma/${screen.code}.png is missing`);

    if (screen.needsData || screen.role) {
      backendUp ??= await backendReachable();
      test.skip(!backendUp, "NOT VERIFIED: backend not reachable, the screen would render without its data");
      test.skip(screen.role !== null && !credentialsFor(screen.role), `NOT VERIFIED: VISUAL_${screen.role}_EMAIL/PASSWORD not set`);
    }

    await page.setViewportSize({ width: 1440, height: screen.height });
    await prepareSession(page, screen.role, { collapsed: screen.collapsed });
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));

    await page.goto(await resolveRoute(screen.route, screen.role), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    for (const step of screen.steps ?? []) {
      if ("hover" in step) await page.locator(step.hover).first().hover();
      else if ("click" in step) await page.locator(step.click).first().click();
      else await page.locator(step.waitFor).first().waitFor();
      await page.waitForLoadState("networkidle");
    }
    await page.waitForTimeout(800); // let entrance transitions settle

    const app = await page.screenshot({ animations: "disabled", caret: "hide" });
    const result = diffAgainstFigma(readFileSync(baseline), app);

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, `${screen.code}.app.png`), app);
    writeFileSync(join(OUT_DIR, `${screen.code}.diff.png`), result.diffPng);
    await testInfo.attach("diff", { body: result.diffPng, contentType: "image/png" });

    const pct = (result.mismatch * 100).toFixed(2);
    testInfo.annotations.push({ type: "mismatch", description: `${pct}% (figma ${result.figmaHeight}px, app ${result.appHeight}px)` });
    console.log(`[visual] ${screen.code} mismatch=${pct}% budget=${screen.budget ?? "none"}`);

    const verdict =
      pageErrors.length > 0 ? "NOT PASS: page errors"
      : screen.budget === undefined ? "NOT PASS YET: no accepted budget (frame not signed off)"
      : result.mismatch <= screen.budget ? "WITHIN BUDGET"
      : "NOT PASS: over budget";
    writeFileSync(
      join(OUT_DIR, `${screen.code}.json`),
      JSON.stringify({ code: screen.code, route: screen.route, mismatch: result.mismatch, budget: screen.budget ?? null, figmaHeight: result.figmaHeight, appHeight: result.appHeight, pageErrors, verdict }, null, 2),
    );

    expect(pageErrors, "page errors").toEqual([]);
    // A frame without an accepted budget is measured and reported, but never shown as passed.
    testInfo.skip(screen.budget === undefined, `NOT PASS YET: mismatch ${pct}%, no accepted budget`);
    expect(result.mismatch, `mismatch ${pct}% exceeds budget ${((screen.budget ?? 0) * 100).toFixed(2)}%`).toBeLessThanOrEqual(screen.budget ?? 0);
  });
}
