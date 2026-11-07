import { useState } from "react";

export function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("Admin@2026");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [localhostOnly, setLocalhostOnly] = useState(true);
  const [adminEmail, setAdminEmail] = useState("admin@duytan.edu.vn");
  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  return (
    <div className="space-y-6">
      {savedSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Đã lưu cấu hình hệ thống thành công. Các thay đổi đã được áp dụng.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Forms */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Card 1: Đổi mật khẩu quản trị viên */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Đổi mật khẩu quản trị viên</h3>
                <p className="text-[11px] text-slate-400">
                  Cập nhật thông tin xác thực cho tài khoản quản trị hệ thống
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Mật khẩu hiện tại */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số
                </p>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Bảo vệ cổng kết nối & email thông báo */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Bảo vệ cổng kết nối & email thông báo</h3>
                <p className="text-[11px] text-slate-400">
                  Cấu hình rào cản truy cập mạng nội bộ và các kênh nhận cảnh báo
                </p>
              </div>
            </div>

            {/* ADMIN_LOCALHOST_ONLY Toggle */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">ADMIN_LOCALHOST_ONLY</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#1E3A8A]">
                    Giới hạn truy cập cục bộ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Chỉ cho phép truy cập <code className="text-[#1E3A8A] font-mono">/admin/*</code> từ mạng nội bộ hoặc localhost (127.0.0.1 / IP mạng trường). Ngăn chặn hoàn toàn truy cập quản trị từ Internet mở.
                </p>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                onClick={() => setLocalhostOnly(!localhostOnly)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localhostOnly ? "bg-[#1E3A8A]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localhostOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Email thông báo quản trị */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email thông báo quản trị
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Nhận cảnh báo khi có đăng nhập bất thường, lỗi kết nối dịch vụ AI hoặc yêu cầu duyệt giảng viên mới
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 shadow-xs transition cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>

        {/* Right 1 Column: Security Guidelines */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Lưu ý bảo mật</h3>
                <p className="text-[11px] text-slate-400">Quy định quản trị hệ thống</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Đổi mật khẩu định kỳ</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Khuyến nghị thay đổi mật khẩu quản trị ít nhất 90 ngày một lần để đảm bảo an toàn truy cập máy chủ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Mạng nội bộ</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Chế độ <code className="text-xs font-mono text-[#1E3A8A]">ADMIN_LOCALHOST_ONLY</code> được khuyến nghị luôn bật trên môi trường máy chủ sản xuất của trường.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Ghi nhật ký kiểm toán</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Mọi thao tác đổi mật khẩu và cập nhật cấu hình đều được ghi vào nhật ký hệ thống kèm địa chỉ IP và thời gian thực.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Xác thực 2 bước (2FA)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Khuyến nghị kích hoạt 2FA khi hệ thống tích hợp vào cổng dịch vụ tập trung của Trường Đại học Duy Tân.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

