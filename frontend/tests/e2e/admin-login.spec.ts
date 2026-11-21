import { test, expect } from "@playwright/test";

const admin = { email: process.env.VISUAL_ADMIN_EMAIL, password: process.env.VISUAL_ADMIN_PASSWORD };
const lecturer = { email: process.env.VISUAL_LECTURER_EMAIL, password: process.env.VISUAL_LECTURER_PASSWORD };

test.beforeEach(async ({ page }) => {
  test.skip(!admin.email || !lecturer.email, "QA fixture accounts missing: run node tests/visual/seed-local.mjs");
  await page.addInitScript(() => localStorage.setItem("edubranch-lang", "vi"));
});

async function submit(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.locator("#admin-email").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
}

test("admin signs in through the real API and lands on the admin dashboard", async ({ page }) => {
  await submit(page, admin.email!, admin.password!);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("edubranch-auth") ?? "{}"));
  expect(stored.state?.user?.role).toBe("ADMIN");
  expect(String(stored.state?.accessToken)).not.toContain("mock");
});

test("a lecturer account is refused on the admin sign-in page and no session is kept", async ({ page }) => {
  await submit(page, lecturer.email!, lecturer.password!);
  await expect(page.getByRole("alert")).toContainText("không có quyền quản trị");
  await expect(page).toHaveURL(/\/admin\/login$/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("edubranch-auth") ?? "{}"));
  expect(stored.state?.isAuthenticated ?? false).toBe(false);
});

test("wrong password shows the real error instead of signing in", async ({ page }) => {
  await submit(page, admin.email!, "wrong-password-123");
  await expect(page.getByRole("alert")).toContainText(/không đúng|quá nhiều lần/);
  await expect(page).toHaveURL(/\/admin\/login$/);
});
