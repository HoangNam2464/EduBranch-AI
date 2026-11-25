/**
 * Visual QA manifest: approved Figma frames (file 6CtSgJPKo4jCIbB7WwCaWw, page
 * "EduBranch AI – Screens") and the route that implements each one.
 *
 * - `figma/<code>.png` is the baseline exported from Figma at scale 1. It is
 *   never replaced by an application screenshot.
 * - `budget` is the accepted share of differing pixels after a frame passed a
 *   reviewed audit (comparison image + DOM measurements). A frame without a
 *   budget has not passed yet: it is measured and reported, never asserted.
 * - `needsData` frames show API data; without a reachable backend they are
 *   reported NOT VERIFIED instead of being compared against an empty page.
 */
export type ScreenRole = "LECTURER" | "STUDENT" | "ADMIN" | null;

export interface VisualScreen {
  code: string;
  name: string;
  nodeId: string;
  route: string;
  role: ScreenRole;
  height: number;
  needsData: boolean;
  collapsed?: boolean;
  budget?: number;
  /**
   * Interactions after the page loaded and before the screenshot (dialogs, hover states).
   * `hover` / `click` take a Playwright selector (e.g. `role=button[name="Tạo khóa học mới"]`).
   */
  steps?: VisualStep[];
}

export type VisualStep = { hover: string } | { click: string } | { waitFor: string };

export const SCREENS: VisualScreen[] = [
  // G1 · Public & auth. Budgets = measured after the 2026-11-14 audit + ~0.3pp margin;
  // lead-verified (comparison images + DOM measurements), pending PO sign-off.
  { code: "00.2", name: "Trang giới thiệu", nodeId: "496:4734", route: "/", role: null, height: 5422, needsData: false, budget: 0.023 },
  { code: "00.3", name: "Đăng nhập", nodeId: "483:17474", route: "/login", role: null, height: 1024, needsData: false, budget: 0.012 },
  { code: "00.4", name: "Đăng ký · Sinh viên", nodeId: "483:18286", route: "/register", role: null, height: 1024, needsData: false, budget: 0.017 },
  { code: "00.5", name: "Đăng ký · Giảng viên", nodeId: "483:18640", route: "/register?role=lecturer", role: null, height: 1024, needsData: false, budget: 0.02 },
  { code: "10.1", name: "Đăng nhập quản trị", nodeId: "536:9029", route: "/admin/login", role: null, height: 1024, needsData: false, budget: 0.011 },
  // G2 · Lecturer courses & materials
  // Fixtures from seed-local.mjs; {course:…}/{material:…} are resolved to real ids in session.ts.
  { code: "02.1", name: "Quản lý khóa học", nodeId: "483:9637", route: "/lecturer/courses", role: "LECTURER", height: 1413, needsData: true },
  { code: "02.2", name: "Hộp thoại khởi tạo khóa học", nodeId: "483:9866", route: "/lecturer/courses", role: "LECTURER", height: 1413, needsData: true,
    steps: [{ click: 'role=button[name="Tạo khóa học mới"]' }, { waitFor: "role=dialog" }] },
  { code: "02.3", name: "Xác nhận xóa khóa học", nodeId: "483:10111", route: "/lecturer/courses", role: "LECTURER", height: 1413, needsData: true,
    steps: [{ hover: 'article:has-text("CS402")' }, { click: 'role=button[name=/^Lưu trữ khóa học An ninh mạng/]' }, { waitFor: "role=dialog" }] },
  { code: "02.4", name: "Chi tiết khóa học — Tài liệu", nodeId: "483:10342", route: "/lecturer/courses/{course:CS402}/materials", role: "LECTURER", height: 1123, needsData: true,
    // Figma draws the first uploaded file in its hover state (trash button instead of the status).
    steps: [{ hover: 'role=link[name="Xem đoạn trích của Runbook_ung_cuu_su_co_DDoS.pdf"]' }] },
  { code: "02.5", name: "Hộp thoại tải tài liệu", nodeId: "483:10598", route: "/lecturer/courses/{course:CS402}/materials", role: "LECTURER", height: 1123, needsData: true,
    steps: [{ click: 'role=button[name="Chọn tài liệu"]' }, { waitFor: "role=dialog" }] },
  { code: "02.6", name: "Xác nhận xóa tài liệu", nodeId: "483:10890", route: "/lecturer/courses/{course:CS402}/materials", role: "LECTURER", height: 1123, needsData: true,
    steps: [{ click: 'role=button[name="Xóa Runbook_ung_cuu_su_co_DDoS.pdf"]' }, { waitFor: "role=dialog" }] },
  { code: "02.7", name: "RAG Source Inspector", nodeId: "483:11148", route: "/lecturer/courses/{course:CS402}/materials/{material:CS402/Runbook_ung_cuu_su_co_DDoS.pdf}/rag", role: "LECTURER", height: 1329, needsData: true },
  // G3 · Lecturer cases, AI Studio, rubric
  { code: "03.1", name: "Quản lý Case Study", nodeId: "483:14030", route: "/lecturer/cases", role: "LECTURER", height: 1375, needsData: true },
  { code: "03.4", name: "Trình chỉnh sửa Case Study", nodeId: "483:13472", route: "/lecturer/cases/c1/review", role: "LECTURER", height: 1519, needsData: true },
  // G4 · Lecturer feedback, statistics, dashboard, profiles
  // No lecturer submission/feedback/statistics endpoints exist yet: 04.x data areas render empty states,
  // 04.2/04.2b ids are placeholders (the detail screen cannot load any submission).
  { code: "04.1", name: "Hàng đợi Review", nodeId: "483:14976", route: "/lecturer/feedback", role: "LECTURER", height: 953, needsData: true },
  { code: "04.2", name: "Chi tiết phản hồi lập luận", nodeId: "483:15233", route: "/lecturer/feedback/sub-01", role: "LECTURER", height: 977, needsData: true },
  { code: "04.2b", name: "Chi tiết bài nộp Review Study", nodeId: "517:6602", route: "/lecturer/feedback/sub-02", role: "LECTURER", height: 1053, needsData: true },
  { code: "04.3", name: "Thống kê luồng học tập", nodeId: "483:15369", route: "/lecturer/statistics", role: "LECTURER", height: 1445, needsData: true },
  { code: "07.1", name: "Bảng điều khiển (giảng viên)", nodeId: "483:16309", route: "/lecturer/dashboard", role: "LECTURER", height: 1502, needsData: true },
  { code: "09.1", name: "Hồ sơ tài khoản · Giảng viên", nodeId: "484:11904", route: "/lecturer/profile", role: "LECTURER", height: 1170, needsData: true },
  { code: "09.2", name: "Hồ sơ tài khoản · Sinh viên", nodeId: "484:12467", route: "/student/profile", role: "STUDENT", height: 1173, needsData: true },
  // G5 · Student (no frames yet)
  // G6 · Admin
  // No admin endpoints exist yet (only GET /health is wired, on 10.2): data areas render the empty state.
  // 10.4 (lock dialog, 534:7373) is not listed: there is no user list and no lock endpoint to open it from.
  { code: "10.2", name: "Admin · Bảng điều khiển", nodeId: "535:8436", route: "/admin/dashboard", role: "ADMIN", height: 1260, needsData: true },
  { code: "10.2b", name: "Admin · Bảng điều khiển (thu gọn)", nodeId: "544:11248", route: "/admin/dashboard", role: "ADMIN", height: 1260, needsData: true, collapsed: true },
  { code: "10.3", name: "Admin · Quản lý người dùng", nodeId: "533:7204", route: "/admin/users", role: "ADMIN", height: 953, needsData: true },
  { code: "10.5", name: "Admin · Quản lý khóa học", nodeId: "535:7402", route: "/admin/courses", role: "ADMIN", height: 1413, needsData: true },
  { code: "10.6", name: "Admin · Quản lý Case Study", nodeId: "535:7980", route: "/admin/cases", role: "ADMIN", height: 1315, needsData: true },
  { code: "10.7", name: "Admin · Dịch vụ AI (chỉ xem)", nodeId: "536:7648", route: "/admin/ai-service", role: "ADMIN", height: 1377, needsData: true },
  { code: "10.8", name: "Admin · Nghiên cứu & Rubric", nodeId: "536:8408", route: "/admin/rubric", role: "ADMIN", height: 989, needsData: true },
  { code: "10.9", name: "Admin · Nhật ký hệ thống", nodeId: "536:7923", route: "/admin/logs", role: "ADMIN", height: 953, needsData: true },
  { code: "10.10", name: "Admin · Cài đặt hệ thống", nodeId: "536:8783", route: "/admin/settings", role: "ADMIN", height: 805, needsData: true },
];
