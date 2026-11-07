import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EduBranchLogo, Button, Alert } from "../components/ui";

/**
 * EduBranch AI — Reset Password Page (Figma: 00.3c · Đặt lại mật khẩu)
 */
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
    if (password.length < 8) {
      setError("Mật khẩu phải có tối thiểu 8 ký tự.");
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

      setTimeout(() => {
        navigate("/login");
      }, 2500);
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
                Tạo mật khẩu mới
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Thiết lập mật khẩu an toàn có ít nhất 8 ký tự để bảo vệ tài khoản và kết quả học tập của bạn trên EduBranch AI.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800/80 pt-4 text-xs text-gray-400">
            © 2026 EduBranch AI · Đại học Duy Tân
          </div>
        </div>

        {/* Right Panel: Form State or Success State */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Thiết lập mật khẩu mới
              </h1>
              <p className="text-sm text-gray-600">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      required
                      className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Hiện hoặc ẩn mật khẩu"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      required
                      className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Hiện hoặc ẩn mật khẩu xác nhận"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        {showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-10"
                  isLoading={loading}
                >
                  Cập nhật mật khẩu
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Đặt lại mật khẩu thành công!</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Mật khẩu mới đã được cập nhật thành công. Đang chuyển hướng bạn tới trang đăng nhập...
                  </p>
                </div>

                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full h-10">
                    Đến trang đăng nhập ngay
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
