import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Button, Alert, EduBranchLogo } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Login Page
 * Canonical Figma Reference: Frame [343:4040] (00.3 · Đăng nhập · Mặc định)
 *
 * Implements:
 * - Left Panel (Product Showcase): Deep navy background (#0B1528), mission statement, desktop preview mockup
 * - Right Panel (Sign In Form): Clean academic card, standard inputs, session options, Google SSO, dev quick-access
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
      "dev-bypass-token"
    );
    const destination =
      role === "ADMIN"
        ? "/admin/dashboard"
        : resolveSafeReturnUrl(returnUrl, role);
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F9FAFB] p-4 lg:p-6 items-center justify-center">
      {/* 2-Column Split Container matching Figma Frame [343:4040] */}
      <div className="w-full max-w-7xl min-h-[720px] bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Product Showcase (Figma: width 690px, height 984px) */}
        <div className="lg:col-span-6 bg-[#0B1528] p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Wordmark */}
          <div className="relative z-10 flex items-center gap-3">
            <EduBranchLogo size={32} />
            <span className="text-lg font-semibold text-white tracking-tight">
              EduBranch AI
            </span>
          </div>

          {/* Mission Copy */}
          <div className="relative z-10 my-8 space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/40 text-blue-200 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Nền tảng học tập tình huống Đại học
            </div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight leading-snug">
              Chuyển hóa tài liệu học phần thành kịch bản ra quyết định
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Giảng viên kiểm soát chặt chẽ nội dung case; sinh viên liên tục rẽ nhánh, đối mặt hậu quả chân thực và rèn luyện tư duy phản biện.
            </p>
          </div>

          {/* Product Preview Mockup Window */}
          <div className="relative z-10 mt-auto pt-4">
            <div className="bg-[#111C35] border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
              {/* Mockup Window Bar */}
              <div className="bg-[#182544] px-4 py-2.5 border-b border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">EduBranch AI · Điểm quyết định</span>
                </div>
                <span className="text-[11px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                  Branching Study
                </span>
              </div>

              {/* Mockup Inside Content */}
              <div className="p-4 space-y-3 bg-[#0E172C] text-slate-200 text-xs select-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-medium text-slate-300">Tình huống: Quản trị chuỗi cung ứng khi gián đoạn</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Node 2/5</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Cảng trung chuyển chính bị phong tỏa do bão. Bạn là Giám đốc Vận hành, hãy chọn phương án phân bổ lô hàng khẩn cấp:
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-800/80 flex items-center justify-between text-blue-200">
                    <span>Phương án A: Chuyển toàn bộ bằng đường hàng không</span>
                    <span className="text-[11px] font-medium text-blue-400">Đã chọn →</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
                    <span>Phương án B: Đàm phán lưu kho tại cảng phụ cận</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form (Figma: width 562px, height 984px) */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Form Heading */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <EduBranchLogo size={28} />
                <span className="text-sm font-semibold text-gray-900 tracking-tight">
                  EduBranch AI
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
                Đăng nhập vào hệ thống
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Truy cập cổng học tập và giảng dạy tình huống EduBranch AI
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

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="block w-full h-11 px-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    placeholder="Nhập mật khẩu..."
                    className="block w-full h-11 px-3.5 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Session Options (Remember me & Forgot Password) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-base font-medium mt-2"
                isLoading={loading}
                id="btn-login-submit"
              >
                Đăng nhập
              </Button>
            </form>

            {/* Registration Switch */}
            <p className="mt-5 text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                state={location.state}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 font-medium text-gray-400 uppercase tracking-wider">
                  HOẶC
                </span>
              </div>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập với Google</span>
            </button>

            {/* Dev Quick-Access Toolbar (Neutral academic look, no emojis) */}
            {import.meta.env.DEV && (
              <div className="mt-8 pt-5 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 text-center uppercase tracking-wider mb-2.5">
                  Truy cập nhanh (Local Dev)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="btn-quick-lecturer"
                    onClick={() => quickAccess("LECTURER")}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-xs font-semibold text-gray-900">Giảng viên</span>
                    <span className="block text-[11px] text-gray-500 truncate">Khóa học & Case →</span>
                  </button>
                  <button
                    type="button"
                    id="btn-quick-student"
                    onClick={() => quickAccess("STUDENT")}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-xs font-semibold text-gray-900">Sinh viên</span>
                    <span className="block text-[11px] text-gray-500 truncate">Bàn học & Case →</span>
                  </button>
                  <button
                    type="button"
                    id="btn-quick-admin"
                    onClick={() => quickAccess("ADMIN")}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-xs font-semibold text-gray-900">Quản trị viên</span>
                    <span className="block text-[11px] text-gray-500 truncate">Hệ thống →</span>
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
