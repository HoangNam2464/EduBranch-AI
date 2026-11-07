import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { EduBranchLogo } from "../../components/ui";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      // Authenticate as Admin user
      login(
        {
          id: "AD-01",
          email: "admin@duytan.edu.vn",
          fullName: "Quản trị viên",
          role: "ADMIN",
        },
        "mock-admin-jwt-token"
      );
      setLoading(false);
      navigate("/admin/dashboard", { replace: true });
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2F6] p-4 antialiased">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* ── Left Hero Side (Deep Blue Gradient & Laptop Illustration) ── */}
        <div className="relative flex flex-col justify-between bg-gradient-to-b from-[#0284C7] via-[#0369A1] to-[#0F172A] p-8 lg:p-10 text-white overflow-hidden">
          {/* Top Brand */}
          <div className="flex items-center gap-2.5 z-10">
            <EduBranchLogo size={32} />
            <span className="text-base font-bold tracking-tight">EduBranch AI</span>
          </div>

          {/* Hero Titles */}
          <div className="my-auto py-6 z-10 space-y-2">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Cổng quản trị hệ thống
            </h2>
            <p className="text-xs lg:text-sm text-sky-100/90 font-medium leading-relaxed">
              Quản lý người dùng, khóa học và dịch vụ AI.
            </p>

            {/* Laptop Mockup Presentation */}
            <div className="pt-6 relative mx-auto w-full max-w-[380px]">
              {/* Back Window (Tablet / Table view) */}
              <div className="absolute -top-3 right-2 w-[75%] h-32 rounded-xl bg-white/90 shadow-lg border border-white/40 p-2 transform rotate-1 scale-95 opacity-85 pointer-events-none">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-[8px] text-slate-500 font-bold">
                  <span>Quản lý người dùng</span>
                  <span className="text-[7px] text-blue-600">8 bản ghi</span>
                </div>
                <div className="space-y-1 mt-1.5">
                  <div className="h-2 w-full bg-slate-100 rounded"></div>
                  <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                  <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                </div>
              </div>

              {/* Front Laptop Display */}
              <div className="relative rounded-t-xl bg-slate-900 p-1.5 shadow-2xl border-t border-x border-slate-700">
                <div className="rounded-t-lg bg-[#EEF2F6] p-2 space-y-1.5">
                  {/* Mock dashboard header */}
                  <div className="flex items-center justify-between text-[7px] font-bold text-slate-800 pb-1 border-b border-slate-200">
                    <span>Bảng điều khiển</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    </div>
                  </div>

                  {/* 3 mini metric cards */}
                  <div className="grid grid-cols-3 gap-1">
                    <div className="rounded bg-white p-1 shadow-2xs text-[6px]">
                      <span className="text-slate-400 block">Sinh viên</span>
                      <span className="font-bold text-slate-800 text-[8px]">3</span>
                    </div>
                    <div className="rounded bg-white p-1 shadow-2xs text-[6px]">
                      <span className="text-slate-400 block">Giảng viên</span>
                      <span className="font-bold text-slate-800 text-[8px]">4</span>
                    </div>
                    <div className="rounded bg-white p-1 shadow-2xs text-[6px]">
                      <span className="text-slate-400 block">Khóa học</span>
                      <span className="font-bold text-slate-800 text-[8px]">3</span>
                    </div>
                  </div>

                  {/* Mock spline & donut */}
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <div className="rounded bg-white p-1 shadow-2xs h-10 flex flex-col justify-end">
                      <div className="w-full h-4 bg-blue-100 rounded-t-xs"></div>
                    </div>
                    <div className="rounded bg-white p-1 shadow-2xs h-10 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-[#1E3A8A] border-t-cyan-400"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Base Stand */}
              <div className="h-2.5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-b-lg shadow-md flex items-center justify-center">
                <div className="w-12 h-0.5 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Bottom subtle note */}
          <div className="z-10 text-[10px] text-sky-200/70">
            © 2026 EduBranch AI · Phân hệ bảo mật & Quản trị hệ thống
          </div>
        </div>

        {/* ── Right Panel: Login Form ── */}
        <div className="flex flex-col justify-center p-8 lg:p-12 space-y-6">
          {/* Header Brand & Title */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <EduBranchLogo size={24} />
              <span className="text-xs font-bold text-slate-900 tracking-tight">EduBranch AI</span>
            </div>

            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              EduBranch Admin Portal
            </h1>
            <p className="text-xs text-slate-400">
              Dành riêng cho quản trị viên hệ thống.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* Tên đăng nhập Admin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đăng nhập Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
              />
            </div>

            {/* Mật khẩu quản trị */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu quản trị
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>Xác thực quản trị</span>
            </button>
          </form>

          {/* Bottom Notice Badges */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1E3A8A] flex-shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Tài khoản quản trị được cấp từ máy chủ.</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1E3A8A] flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Mọi lần đăng nhập đều được ghi nhật ký.</span>
            </div>
          </div>

          {/* Link back to Main Login */}
          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 hover:text-[#1E3A8A] transition inline-flex items-center gap-1.5"
            >
              <span>← Quay lại cổng Giảng viên & Sinh viên</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

