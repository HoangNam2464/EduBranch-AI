import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EduBranchLogo, Button } from "../components/ui";

/**
 * EduBranch AI — Forgot Password Page (Figma: 00.3b · Quên mật khẩu)
 */
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Hero Side (Deep Navy #0B1528) */}
        <div className="lg:col-span-5 bg-[#0B1528] p-8 sm:p-10 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3">
              <EduBranchLogo size={28} />
              <span className="text-base font-semibold text-white tracking-tight">
                EduBranch AI
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/60 text-blue-200 border border-blue-700/50">
                Bảo mật tài khoản
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Khôi phục quyền truy cập học tập
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Nhập email đại học của bạn để nhận liên kết khôi phục mật khẩu. Hệ thống sẽ gửi hướng dẫn bảo mật vào hộp thư đến.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800/80 pt-4 text-xs text-gray-400">
            © 2026 EduBranch AI · Đại học Duy Tân
          </div>
        </div>

        {/* Right Panel: Form State or Sent State */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Đặt lại mật khẩu
              </h1>
              <p className="text-sm text-gray-600">
                Nhập email đăng ký tài khoản để nhận liên kết khôi phục.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email đại học của bạn
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@duytan.edu.vn"
                    required
                    className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-10"
                  isLoading={loading}
                >
                  Gửi liên kết khôi phục
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs font-medium text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kiểm tra hộp thư đến của bạn</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu tới địa chỉ <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến hoặc thư mục thư rác.
                  </p>
                </div>

                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full h-10">
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
