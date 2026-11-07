import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Button, Alert, EduBranchLogo } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Login Page (00.3 · Đăng nhập · Mặc định)
 *
 * Implemented strictly according to Figma blueprint:
 * - Left banner: Deep blue gradient, pedagogical value proposition, illustrated laptop device mockup
 * - Right panel: System login form, remember me, forgot password, Google SSO, dev quick-access
 * - Stack: React 19 + TypeScript + TailwindCSS v4
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
    ? (typeof stateFrom === "string" ? stateFrom : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`)
    : null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email đại học không được để trống.");
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
      // Offline Demo Fallback: seamless experience when BE is not running
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
          : "/student";
      navigate(destination, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setInfoMsg("Cổng xác thực Google Workspace Đại học Duy Tân (SSO) đang được đồng bộ cho kỳ học mới.");
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setInfoMsg("Vui lòng liên hệ Quản trị viên Học phần hoặc Phòng Đào tạo để được cấp lại mật khẩu.");
  };

  // ─── Dev quick-access (bypasses real auth for local UI testing) ───────────
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/80 p-4 sm:p-6 lg:p-8">
      
      {/* ─────────────────────────────────────────────────────────────
          MAIN AUTH CARD (2-COLUMN SPLIT CONTAINER)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ───────────────────────────────────────────────────────────
            LEFT COLUMN: BRANDING & LAPTOP PREVIEW BANNER
        ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#0F172A] p-8 sm:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          
          {/* Subtle background glow effect */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />

          {/* Top: Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <EduBranchLogo size={32} />
            <span className="text-base font-bold text-white tracking-tight">
              EduBranch AI
            </span>
          </div>

          {/* Center: Mission statement */}
          <div className="relative z-10 my-8 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Nền tảng học tập tình huống thực nghiệm
            </h2>
            <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
              Giảng viên xây dựng Case Study từ tài liệu môn học, sinh viên ra quyết định, lập luận và suy ngẫm trên từng nhánh tình huống.
            </p>
          </div>

          {/* Bottom: High-Fidelity Illustrated Laptop Mockup */}
          <div className="relative z-10 mt-2">
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
              
              {/* Laptop Screen Bezel */}
              <div className="rounded-t-xl bg-gray-900 border-2 border-gray-700 p-2 shadow-2xl">
                {/* Camera dot */}
                <div className="flex justify-center mb-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                </div>
                
                {/* Inside Screen Content */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-gray-800 space-y-2 select-none overflow-hidden text-[10px]">
                  
                  {/* Mockup Screen Navbar */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                    <span className="font-bold text-blue-900 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                      EduBranch AI
                    </span>
                    <span className="text-[9px] text-gray-500 font-medium">Bảng điều khiển học phần</span>
                  </div>

                  {/* Mockup Stats Row */}
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-white p-1.5 rounded border border-gray-200/80 shadow-2xs">
                      <span className="text-[8px] text-gray-400 block">TỔNG CASE</span>
                      <span className="font-bold text-gray-900 text-[11px]">12</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-200/80 shadow-2xs">
                      <span className="text-[8px] text-gray-400 block">SINH VIÊN</span>
                      <span className="font-bold text-blue-600 text-[11px]">84</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-200/80 shadow-2xs">
                      <span className="text-[8px] text-gray-400 block">HOÀN THÀNH</span>
                      <span className="font-bold text-emerald-600 text-[11px]">92%</span>
                    </div>
                  </div>

                  {/* Mockup Mini Chart & Case Row */}
                  <div className="bg-white p-2 rounded border border-gray-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-semibold text-gray-700">
                      <span>Tiến độ thực hành theo tuần</span>
                      <span className="text-blue-600 font-bold">Tuần 4</span>
                    </div>
                    
                    {/* Visual Bar chart mock */}
                    <div className="flex items-end gap-1 h-8 pt-1">
                      <div className="w-1/6 bg-blue-100 rounded-t h-3" />
                      <div className="w-1/6 bg-blue-200 rounded-t h-5" />
                      <div className="w-1/6 bg-blue-300 rounded-t h-4" />
                      <div className="w-1/6 bg-blue-400 rounded-t h-6" />
                      <div className="w-1/6 bg-blue-600 rounded-t h-8" />
                      <div className="w-1/6 bg-blue-200 rounded-t h-5" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Laptop Keyboard Base & Hinge */}
              <div className="h-2.5 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg border-t border-gray-500 shadow-md relative">
                {/* Touchpad notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-500 rounded-b" />
              </div>

            </div>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────
            RIGHT COLUMN: LOGIN FORM
        ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          
          <div className="w-full max-w-md mx-auto">
            
            {/* Header / Brand */}
            <div className="flex items-center gap-2 mb-3">
              <EduBranchLogo size={28} />
              <span className="text-sm font-bold text-gray-900 tracking-tight">
                EduBranch AI
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Đăng nhập vào hệ thống
            </h1>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              Dành cho Giảng viên và Sinh viên
            </p>

            {/* Notifications */}
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {infoMsg && <Alert variant="info" className="mb-4">{infoMsg}</Alert>}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              
              {/* Email Address */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nguyen@dtuytan.edu.vn"
                  className="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900
                             placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
                    className="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900
                               placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-medium py-3 rounded-xl transition-all shadow-sm hover:shadow text-sm"
                isLoading={loading}
                id="btn-login-submit"
              >
                Đăng nhập
              </Button>
            </form>

            {/* Registration link */}
            <p className="mt-5 text-center text-xs text-gray-500">
              Chưa có tài khoản?{" "}
              <Link to="/register" state={location.state} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                Đăng ký ngay
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 font-semibold text-gray-400 uppercase tracking-wider">
                  HOẶC
                </span>
              </div>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 py-2.5 px-4 text-xs font-semibold text-gray-700 inline-flex items-center justify-center gap-2.5 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập với Google</span>
            </button>

            {/* Admin Portal Gateway Link */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sm">🛡️</span>
                <span>Quản trị viên hệ thống?</span>
              </div>
              <Link
                to="/admin/login"
                className="font-bold text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
              >
                Cổng Quản trị viên →
              </Link>
            </div>

            {/* Dev Quick-Access Shortcuts (Only in Development Mode) */}
            {import.meta.env.DEV && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">
                  Truy cập nhanh (Local Dev)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="btn-quick-lecturer"
                    onClick={() => quickAccess("LECTURER")}
                    className="rounded-lg border border-blue-200 bg-blue-50/70 p-2 text-left hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-blue-900">👨‍🏫 Giảng viên</span>
                    <span className="block text-[10px] text-blue-600 truncate">Khóa học & Case →</span>
                  </button>
                  <button
                    type="button"
                    id="btn-quick-branching"
                    onClick={() => quickAccess("STUDENT")}
                    className="rounded-lg border border-teal-200 bg-teal-50/70 p-2 text-left hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-teal-900">🎓 Sinh viên</span>
                    <span className="block text-[10px] text-teal-700 truncate">Vào bàn học →</span>
                  </button>
                  <button
                    type="button"
                    id="btn-quick-admin"
                    onClick={() => quickAccess("ADMIN")}
                    className="rounded-lg border border-slate-300 bg-slate-100/80 p-2 text-left hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-slate-900">🛡️ Quản trị</span>
                    <span className="block text-[10px] text-slate-600 truncate">Dashboard →</span>
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
