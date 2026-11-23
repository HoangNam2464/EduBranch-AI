import { test, expect } from "@playwright/test";

const student = {
  email: process.env.VISUAL_STUDENT_EMAIL!,
  password: process.env.VISUAL_STUDENT_PASSWORD!,
};
const lecturer = {
  email: process.env.VISUAL_LECTURER_EMAIL!,
  password: process.env.VISUAL_LECTURER_PASSWORD!,
};
const admin = {
  email: process.env.VISUAL_ADMIN_EMAIL!,
  password: process.env.VISUAL_ADMIN_PASSWORD!,
};

test.beforeEach(async ({ page }) => {
  test.skip(
    !student.email || !lecturer.email || !admin.email,
    "QA fixture accounts missing in .env.visual.local",
  );
  await page.addInitScript(() => {
    localStorage.setItem("edubranch-lang", "vi");
  });
});

test.describe("1. Public Landing Page & Global Controls", () => {
  test("landing page renders header, hero, sections, language switch", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/EduBranch/i);

    // 1. Header branding
    const banner = page.getByRole("banner");
    await expect(banner).toBeVisible();
    await expect(banner.getByText("EduBranch AI")).toBeVisible();

    // 2. Language Switcher (VI -> EN -> VI)
    const langBtn = banner.getByRole("button", { name: /Ngôn ngữ|Language/i });
    if (await langBtn.isVisible()) {
      await langBtn.click();
      const enBtn = page.getByRole("button", { name: /English/i });
      if (await enBtn.isVisible()) {
        await enBtn.click();
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
      }
      // Switch back to Vietnamese
      await langBtn.click();
      const viBtn = page.getByRole("button", { name: /Tiếng Việt/i });
      if (await viBtn.isVisible()) {
        await viBtn.click();
        await expect(page.locator("html")).toHaveAttribute("lang", "vi");
      }
    }

    // 3. Hero Content & CTAs
    const main = page.locator("main");
    await expect(main).toBeVisible();
    await expect(main.getByText(/Mỗi quyết định mở ra một nhánh mới|EduBranch AI/i).first()).toBeVisible();

    // 4. Landing Sections
    await expect(page.getByText(/Hai cách học|Hai chế độ/i).first()).toBeVisible();

    // 5. Navigation to Login Page
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("unknown route renders clean 404 Not Found page", async ({ page }) => {
    await page.goto("/some-completely-invalid-url-path-404");
    await expect(page.getByText(/404|không tìm thấy|Không tồn tại/i).first()).toBeVisible();
  });
});

test.describe("2. Authentication Validation & Error Handling", () => {
  test("login form rejects invalid credentials with localized error message", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(student.email);
    await page.locator('input[type="password"]').fill("CompletelyWrongPassword!123");
    await page.locator('button[type="submit"]').click();

    // Verify error alert appears
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/không đúng|sai mật khẩu|Invalid/i);
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("3. Student Portal Flow", () => {
  test("student logs in, views desk, courses, join dialog and profile", async ({ page }) => {
    // 1. Login as Student
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(student.email);
    await page.locator('input[type="password"]').fill(student.password);
    await page.locator('button[type="submit"]').click();

    // 2. Verification of Student Desk (/student)
    await expect(page).toHaveURL(/\/student/);
    const authData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("edubranch-auth") ?? "{}"),
    );
    expect(authData.state?.user?.role).toBe("STUDENT");
    await expect(page.getByText(/Bàn học/i).first()).toBeVisible();

    // 3. Navigate to My Courses (/student/courses)
    await page.goto("/student/courses");
    await expect(page).toHaveURL(/\/student\/courses$/);
    await expect(page.getByText(/Khóa học của tôi|Học phần/i).first()).toBeVisible();

    // 4. Open "Tham gia lớp học" (Join Class) modal
    const joinBtn = page.getByRole("button", { name: /Tham gia lớp/i }).first();
    if (await joinBtn.isVisible()) {
      await joinBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      // Close modal
      const closeBtn = page.getByRole("button", { name: /Đóng|Hủy/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // 5. View Student Profile (/student/profile)
    await page.goto("/student/profile");
    await expect(page).toHaveURL(/\/student\/profile$/);
    await expect(page.getByText(/Hồ sơ|Thông tin cá nhân/i).first()).toBeVisible();
    await expect(page.getByText(student.email).first()).toBeVisible();
  });
});

test.describe("4. Lecturer Portal Flow", () => {
  test("lecturer logs in, manages courses, views cases, statistics and profile", async ({ page }) => {
    // 1. Login as Lecturer
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(lecturer.email);
    await page.locator('input[type="password"]').fill(lecturer.password);
    await page.locator('button[type="submit"]').click();

    // 2. Redirect to Lecturer Courses (/lecturer/courses)
    await expect(page).toHaveURL(/\/lecturer/);
    const authData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("edubranch-auth") ?? "{}"),
    );
    expect(authData.state?.user?.role).toBe("LECTURER");

    // 3. Check Courses page (/lecturer/courses)
    await page.goto("/lecturer/courses");
    await expect(page).toHaveURL(/\/lecturer\/courses$/);
    await expect(page.getByText(/Quản lý khóa học/i).first()).toBeVisible();

    // Verify course cards are populated
    const cs402Card = page.locator('article, div[class*="rounded"]').filter({ hasText: /CS402|An ninh mạng/i }).first();
    await expect(cs402Card).toBeVisible();

    // 4. Check Cases page (/lecturer/cases)
    await page.goto("/lecturer/cases");
    await expect(page).toHaveURL(/\/lecturer\/cases$/);
    await expect(page.getByText(/Quản lý Case Study/i).first()).toBeVisible();

    // 5. Check Statistics page (/lecturer/statistics)
    await page.goto("/lecturer/statistics");
    await expect(page).toHaveURL(/\/lecturer\/statistics$/);
    await expect(page.getByText(/Thống kê học tập/i).first()).toBeVisible();

    // 6. Check Lecturer Profile (/lecturer/profile)
    await page.goto("/lecturer/profile");
    await expect(page).toHaveURL(/\/lecturer\/profile$/);
    await expect(page.getByText(/Hồ sơ|Thông tin cá nhân/i).first()).toBeVisible();
    await expect(page.getByText(lecturer.email).first()).toBeVisible();
  });
});

test.describe("5. Admin Portal Flow", () => {
  test("admin logs in and inspects system health and management screens", async ({ page }) => {
    // 1. Login as Admin
    await page.goto("/admin/login");
    await page.locator("#admin-email").fill(admin.email);
    await page.locator('input[type="password"]').fill(admin.password);
    await page.locator('button[type="submit"]').click();

    // 2. Lands on Admin Dashboard (/admin/dashboard)
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.getByText(/Bảng điều khiển|Tổng quan hệ thống/i).first()).toBeVisible();

    // 3. Inspect Admin Users (/admin/users)
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByText(/Quản lý người dùng/i).first()).toBeVisible();

    // 4. Inspect Admin Courses (/admin/courses)
    await page.goto("/admin/courses");
    await expect(page).toHaveURL(/\/admin\/courses$/);
    await expect(page.getByText(/Khóa học toàn hệ thống/i).first()).toBeVisible();

    // 5. Inspect Admin AI Config (/admin/ai-service)
    await page.goto("/admin/ai-service");
    await expect(page).toHaveURL(/\/admin\/ai-service$/);
    await expect(page.getByText(/Dịch vụ AI/i).first()).toBeVisible();
  });
});

test.describe("6. Route Protection & RBAC Guards", () => {
  test("unauthenticated access to protected routes redirects to /login", async ({ page }) => {
    await page.goto("/lecturer/courses");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/student");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
