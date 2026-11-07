import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EduBranchLogo } from "../components/ui";

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Mật khẩu phải có tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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

          {/* Center: Mission statement */}
          <div className="my-auto py-6 z-10 space-y-2.5">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug">
              Nền tảng học tập tình huống thực nghiệm
            </h2>
            <p className="text-xs lg:text-sm text-sky-100/90 font-medium leading-relaxed">
              Giảng viên xây dựng Case Study từ tài liệu môn học; sinh viên ra quyết định, lập luận và suy ngẫm trên từng nhánh tình huống.
            </p>

            {/* Laptop Mockup Presentation */}
            <div className="pt-6 relative mx-auto w-full max-w-[380px]">
              {/* Back Window */}
              <div className="absolute -top-3 right-2 w-[75%] h-32 rounded-xl bg-white/90 shadow-lg border border-white/40 p-2 transform rotate-1 scale-95 opacity-85 pointer-events-none">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-[8px] text-slate-500 font-bold">
                  <span>Thống kê học tập học phần</span>
                  <span className="text-[7px] text-blue-600">Tháng 11, 2026</span>
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
                  <div className="flex items-center justify-between text-[7px] font-bold text-slate-800 pb-1 border-b border-slate-200">
                    <span>Quản lý khóa học</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    </div>
                  </div>

                  {/* 3 mini metric cards */}
                  <div className="grid grid-cols-3 gap-1">
                    <div className="rounded bg-white p-1 shadow-2xs text-[6px]">
                      <span className="text-slate-400 block">TỔNG CASE</span>
                      <span className="font-bold text-slate-800 text-[8px]">6</span>
                    </div>
                    <div className="rounded bg-white p-1 shadow-2xs text-[6px]">
                      <span className="text-slate-400 block">SINH VIÊN</span>
                      <span className="font-bold text-blue-600 text-[8px]">84</span>
                    </div>
                    <div className="rounded bg-white p-1 shadow-2xs text-[6px]">
                      <span className="text-slate-400 block">HOÀN THÀNH</span>
                      <span className="font-bold text-emerald-600 text-[8px]">92%</span>
                    </div>
                  </div>

                  <div className="rounded bg-white p-1 shadow-2xs h-12 flex flex-col justify-end">
                    <div className="w-full h-5 bg-blue-100 rounded-t-xs"></div>
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
            © 2026 EduBranch AI · Trường Đại học Duy Tân
          </div>
        </div>

        {/* ── Right Panel: Form State or Success State ── */}
        <div className="flex flex-col justify-center p-8 lg:p-12 space-y-6">
          {/* Header Brand */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <EduBranchLogo size={24} />
              <span className="text-xs font-bold text-slate-900 tracking-tight">EduBranch AI</span>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                Phase 2
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight pt-1">
              Thiết lập mật khẩu mới
            </h1>
            <p className="text-xs text-slate-400">
              {!submitted
                ? "Mật khẩu tối thiểu 6 ký tự."
                : "Mật khẩu của bạn đã được cập nhật."}
            </p>
          </div>

          {!submitted ? (
            /* State 1: Reset Password Form (Figma: Mật khẩu mới · Biểu mẫu) */
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
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

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                <span>Lưu mật khẩu mới</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            /* State 2: Success Alert (Figma: Mật khẩu mới · Thành công) */
            <div className="space-y-5 max-w-sm mx-auto w-full">
              {/* Green Alert Box */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Đổi mật khẩu thành công!
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Đang tự động chuyển hướng bạn tới trang Đăng nhập...
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer shadow-xs block text-center"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

