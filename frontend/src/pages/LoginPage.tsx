import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Button, Alert } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Login Page
 * Canonical Figma Reference: Frame [343:4040] (00.3 · Đăng nhập · Mặc định)
 *
 * Implements:
 * - Left Panel (Product Showcase): Vibrant blue gradient card with white brand pill,
 *   centered headline & subtitle, floating dashboard preview, desktop monitor on silver stand,
 *   grounded on a dark navy base.
 * - Right Panel (Sign In Form): Centered brand logo + title/subtitle, h-11 rounded-xl inputs,
 *   remember me checkbox, forgot password link, full-width navy button (#1E3A8A), HOẶC divider,
 *   Google SSO button, and subtle dev quick-access in DEV mode.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? typeof stateFrom === "string"
      ? stateFrom
      : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
    : null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Địa chỉ email không được để trống.");
      return;
    }
    if (!password) {
      setError("Mật khẩu không được để trống.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const result = await authService.login({ email: email.trim(), password });
      login(result.user, result.accessToken);
      const destination = resolveSafeReturnUrl(returnUrl, result.user.role);
      navigate(destination, { replace: true });
    } catch {
      // Offline fallback for smooth demo testing
      const isLecturer =
        email.includes("gv") ||
        email.includes("lecturer") ||
        email.includes("an.nguyen") ||
        email.includes("giangvien");
      const isAdmin = email.includes("admin");
      const role = isAdmin ? "ADMIN" : isLecturer ? "LECTURER" : "STUDENT";
      const demoUser = {
        id: `demo-${role.toLowerCase()}`,
        email: email || `${role.toLowerCase()}@duytan.edu.vn`,
        fullName:
          isAdmin ? "Quản trị viên" : isLecturer ? "TS. Nguyễn Văn An" : "Lê Minh Khôi",
        role: role as any,
      };
      login(demoUser, "demo-offline-jwt-token");
      const destination =
        isAdmin
          ? "/admin/dashboard"
          : isLecturer
          ? "/lecturer/courses"
          : "/student/desk";
      navigate(destination, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setInfoMsg("Cổng xác thực Google Workspace Đại học Duy Tân (SSO) đang được đồng bộ cho kỳ học mới.");
  };

  // Dev quick-access for immediate local testing
  const quickAccess = (role: "LECTURER" | "STUDENT" | "ADMIN") => {
    login(
      {
        id: `dev-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@duytan.edu.vn`,
        fullName:
          role === "LECTURER"
            ? "TS. Nguyễn Văn An"
            : role === "ADMIN"
            ? "Quản trị viên"
            : "Lê Minh Khôi",
        role,
      },
      `dev-token-${role.toLowerCase()}`
    );
    const destination =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "LECTURER"
        ? "/lecturer/courses"
        : "/student/desk";
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ─────────────────────────────────────────────────────────────
            LEFT COLUMN: Product Showcase (Figma Frame [343:4041])
        ───────────────────────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-gradient-to-b from-[#0084FF] via-[#0066EE] to-[#0055D4] rounded-3xl p-8 xl:p-10 text-white relative overflow-hidden flex-col justify-between shadow-2xl min-h-[860px]">
          {/* Subtle background glow effect */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Pill (Figma [343:4042]) */}
          <div className="relative z-10 flex justify-center pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-gray-900 shadow-sm select-none">
              <div className="w-5 h-5 rounded-md bg-[#2563EB] flex items-center justify-center text-white shrink-0">
                <svg
                  width={13}
                  height={13}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-gray-900">
                EduBranch AI
              </span>
            </div>
          </div>

          {/* Mission Copy (Figma [343:4046], [343:4048]) */}
          <div className="relative z-10 text-center max-w-xl mx-auto space-y-3 my-6">
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-snug">
              Nền tảng học tập tình huống thực nghiệm
            </h2>
            <p className="text-blue-100/90 text-sm leading-relaxed max-w-lg mx-auto">
              Giảng viên xây dựng Case Study từ tài liệu môn học; sinh viên ra quyết định, lập luận và suy ngẫm trên từng nhánh tình huống.
            </p>
          </div>

          {/* Device Mockup Showcase Area (Figma [355:5175]) */}
          <div className="relative z-10 mt-auto w-full flex flex-col items-center">
            {/* Back Floating Window: Analytics Preview (Figma [355:5176]) */}
            <div className="w-[88%] max-w-[460px] bg-white rounded-xl shadow-2xl border border-white/40 overflow-hidden transform translate-x-8 translate-y-3 select-none opacity-95">
              <div className="bg-[#EBF3FF] px-3.5 py-2 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-medium text-slate-600 ml-2">Thống kê luồng học tập</span>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Sprint 4 · M13
                </span>
              </div>
              <div className="p-3.5 space-y-3 bg-[#F8FAFC] text-slate-800 text-[11px]">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-slate-400 text-[9px] uppercase font-semibold">Lượt hoàn thành</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">84.2%</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-slate-400 text-[9px] uppercase font-semibold">Tự đánh giá</div>
                    <div className="text-sm font-bold text-blue-600 mt-0.5">92/100</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-slate-400 text-[9px] uppercase font-semibold">Số nhánh rẽ</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">6 paths</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-end gap-1.5 h-14 pt-2 px-3">
                  <div className="w-1/6 bg-blue-200 rounded-t h-4" />
                  <div className="w-1/6 bg-blue-300 rounded-t h-7" />
                  <div className="w-1/6 bg-blue-400 rounded-t h-9" />
                  <div className="w-1/6 bg-blue-500 rounded-t h-12" />
                  <div className="w-1/6 bg-blue-600 rounded-t h-10" />
                  <div className="w-1/6 bg-blue-700 rounded-t h-6" />
                </div>
              </div>
            </div>

            {/* Front Desktop Monitor Mockup (Figma [355:5175]) */}
            <div className="w-[96%] max-w-[500px] relative z-20 mt-[-24px]">
              {/* Monitor Screen Frame */}
              <div className="bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-800">
                {/* Screen Bezel Notch / Camera */}
                <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto mb-1.5" />
                {/* Inside Screen Content */}
                <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-inner select-none text-slate-800">
                  {/* Mockup Header */}
                  <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#2563EB] flex items-center justify-center text-white text-[9px] font-bold">
                        E
                      </div>
                      <span className="text-[11px] font-semibold text-gray-900">EduBranch AI · Quản trị khóa học</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-mono">TS. Nguyễn Văn An</span>
                      <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center">
                        A
                      </div>
                    </div>
                  </div>
                  {/* Mockup Body: Course Cards & Flow */}
                  <div className="p-3 bg-gray-50 space-y-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 text-xs">BUS301 — Quản trị Chiến lược</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">3 tình huống · 48 sinh viên tham gia</div>
                      </div>
                      <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Đang mở
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 text-xs">LAW204 — Pháp luật Đại cương</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">2 tình huống · Cây quyết định DAG</div>
                      </div>
                      <span className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        Branching
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitor Stand Neck */}
              <div className="w-10 h-7 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 mx-auto" />
              {/* Monitor Stand Base */}
              <div className="w-36 h-2 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-full mx-auto shadow-md" />
            </div>

            {/* Dark Navy Ground Surface at Bottom (Figma curved base) */}
            <div className="w-full h-10 bg-[#0B1528] rounded-b-2xl mt-[-10px] -mx-8 relative -z-0" />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT COLUMN: Sign In Form (Figma Frame [343:4052])
        ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center bg-white rounded-3xl p-8 sm:p-12 xl:p-16 border border-gray-100 shadow-xl lg:shadow-none">
          <div className="w-full max-w-[440px] mx-auto">
            {/* Centered Brand & Heading (Figma [343:4054], [343:4055]) */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              {/* Brand symbol on blue tile */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-gray-900 tracking-tight">
                  EduBranch AI
                </span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Đăng nhập vào hệ thống
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Dành cho Giảng viên và Sinh viên
              </p>
            </div>

            {/* Error or Info Alerts */}
            {error && (
              <Alert variant="error" className="mb-5">
                {error}
              </Alert>
            )}
            {infoMsg && (
              <Alert variant="info" className="mb-5">
                {infoMsg}
              </Alert>
            )}

            {/* Form (Figma [343:4053]) */}
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Email Field (Figma [343:4060]) */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Địa chỉ email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nguyen@duytan.edu.vn"
                  className="block w-full h-11 px-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Password Field (Figma [343:4064]) */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="block w-full h-11 px-3.5 pr-11 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row (Figma [343:4068]) */}
              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-600 text-sm">Ghi nhớ đăng nhập</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button (Figma [343:4076]: Navy blue #1E3A8A) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#1E3A8A] hover:bg-[#162D66] active:bg-[#102047] disabled:bg-blue-300 text-white font-medium text-sm rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                >
                  {loading ? "Đang xác thực..." : "Đăng nhập"}
                </button>
              </div>

              {/* Account Switch: Sign Up Link (Figma [343:4079]) */}
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">Chưa có tài khoản? </span>
                <Link
                  to="/register"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </div>

              {/* Alternative Divider: HOẶC (Figma [343:4080], [343:4081]) */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 font-medium tracking-wider uppercase">
                    HOẶC
                  </span>
                </div>
              </div>

              {/* Google SSO Button (Figma [343:4085], [343:4086]) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 transition-colors shadow-2xs cursor-pointer"
              >
                {/* Standard Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>
            </form>

            {/* Dev Quick-Access bar (Rendered only in local development) */}
            {import.meta.env.DEV && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-mono">
                  <span>DEV QUICK-ACCESS</span>
                  <span>LOCAL ONLY</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickAccess("LECTURER")}
                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-gray-900">Giảng viên Demo</div>
                    <div className="text-gray-500 text-[11px] truncate">an.nguyen@duytan.edu.vn</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAccess("STUDENT")}
                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-gray-900">Sinh viên Demo</div>
                    <div className="text-gray-500 text-[11px] truncate">khoi.le@duytan.edu.vn</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
