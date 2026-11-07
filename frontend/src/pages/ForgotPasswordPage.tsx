import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EduBranchLogo } from "../components/ui";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
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
              {/* Back Window (Tablet / Table view) */}
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

        {/* ── Right Panel: Form State or Sent State ── */}
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
              Đặt lại mật khẩu
            </h1>
            <p className="text-xs text-slate-400">
              Nhập email đăng ký để nhận liên kết khôi phục.
            </p>
          </div>

          {!submitted ? (
            /* State 1: Input Email Form (Figma: Quên mật khẩu · Nhập email) */
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email của bạn
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@duytan.edu.vn"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                <span>Gửi liên kết đặt lại mật khẩu</span>
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
            /* State 2: Email Sent Box (Figma: Quên mật khẩu · Đã gửi hướng dẫn) */
            <div className="space-y-5 max-w-sm mx-auto w-full">
              {/* Green Alert Box */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Kiểm tra hòm thư của bạn
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc thư mục thư rác.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer shadow-xs block text-center"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

