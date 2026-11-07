import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { RegisterRequest } from "../types";
import { Button, Alert, EduBranchLogo } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Register Page (00.4 · Đăng ký · Sinh viên & 00.5 · Đăng ký · Giảng viên)
 *
 * Implements Figma master template:
 * - Left column: Deep navy (#0B1528) showcase panel with role-adaptive academic preview
 * - Right column: Clean academic registration form with interactive Role Selector tabs
 * - Strict adherence to 7 Anti-AI-Slop rules (zero emojis, zero raw ASCII symbols, accessible typography)
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  // Initialize role from URL query param if present (?role=lecturer or ?role=student)
  const initialRoleParam = searchParams.get("role")?.toUpperCase();
  const [role, setRole] = useState<"STUDENT" | "LECTURER">(
    initialRoleParam === "LECTURER" ? "LECTURER" : "STUDENT"
  );

  const [form, setForm] = useState<RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT",
  });

  // Role-specific field states
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Sync role state with form
  useEffect(() => {
    setForm((prev) => ({ ...prev, role }));
  }, [role]);

  // Handle URL change
  useEffect(() => {
    if (initialRoleParam === "LECTURER" && role !== "LECTURER") {
      setRole("LECTURER");
    } else if (initialRoleParam === "STUDENT" && role !== "STUDENT") {
      setRole("STUDENT");
    }
  }, [initialRoleParam]);

  const handleRoleChange = (newRole: "STUDENT" | "LECTURER") => {
    setRole(newRole);
    setSearchParams({ role: newRole.toLowerCase() });
    setError(null);
  };

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? (typeof stateFrom === "string" ? stateFrom : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!form.email.trim()) {
      setError("Vui lòng nhập địa chỉ email đại học.");
      return;
    }
    if (role === "STUDENT" && !studentId.trim()) {
      setError("Vui lòng nhập Mã số sinh viên (MSSV).");
      return;
    }
    if (role === "LECTURER" && !department.trim()) {
      setError("Vui lòng nhập Khoa / Đơn vị công tác.");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (form.password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const result = await authService.register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
      });
      login(result.user, result.accessToken);
      const destination = resolveSafeReturnUrl(returnUrl, result.user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleRegister = () => {
    setInfoMsg("Cổng xác thực Google Workspace Đại học Duy Tân (SSO) đang được đồng bộ cho kỳ học mới.");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* ─────────────────────────────────────────────────────────────
          MAIN REGISTRATION CONTAINER (2 COLUMNS)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* ───────────────────────────────────────────────────────────
            LEFT COLUMN: BRAND SHOWCASE (Navy #0B1528)
        ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-[#0B1528] p-8 sm:p-10 flex flex-col justify-between text-white relative">
          {/* Top: Logo & Platform Identity */}
          <div>
            <div className="flex items-center gap-3">
              <EduBranchLogo size={28} />
              <span className="text-base font-semibold text-white tracking-tight">
                EduBranch AI
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/60 text-blue-200 border border-blue-700/50">
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Giáo dục Đại học Thực nghiệm
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Nền tảng học tập tình huống & ra quyết định
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Biến học liệu giáo trình thành các kịch bản phân nhánh thực tế. Sinh viên trực tiếp đưa ra quyết định, đối mặt hệ quả và tự đánh giá hành trình.
              </p>
            </div>
          </div>

          {/* Center: Dynamic Role-Specific Preview Card */}
          <div className="my-6">
            <div className="bg-[#111C33] border border-blue-900/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs text-gray-400">
                <span className="font-medium text-gray-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {role === "STUDENT" ? "Điểm quyết định · Kịch bản số 01" : "Biên tập Cây quyết định · DAG"}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  role === "STUDENT" ? "bg-teal-900/50 text-teal-300 border border-teal-700/50" : "bg-amber-900/50 text-amber-300 border border-amber-700/50"
                }`}>
                  {role === "STUDENT" ? "Branching Study" : "Bản nháp (DRAFT)"}
                </span>
              </div>

              {role === "STUDENT" ? (
                <div className="space-y-2.5 text-xs">
                  <p className="text-gray-300 leading-relaxed">
                    Khủng hoảng dòng tiền quý 3: Doanh nghiệp đối mặt nguy cơ mất thanh khoản 30 ngày tới. Bạn lựa chọn giải pháp nào?
                  </p>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded bg-blue-950/60 border border-blue-600/40 text-blue-200 flex items-center justify-between">
                      <span>A. Cơ cấu lại nợ ngắn hạn & cắt giảm chi phí vận hành</span>
                      <span className="text-blue-400 font-semibold">Đã chọn</span>
                    </div>
                    <div className="p-2.5 rounded bg-gray-900/40 border border-gray-800 text-gray-400">
                      B. Phát hành cổ phiếu ưu đãi khẩn cấp
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Cấu trúc cây: 5 nút, 8 phương án</span>
                    <span className="text-emerald-400 font-medium">DFS Hợp lệ</span>
                  </div>
                  <div className="p-2 rounded bg-gray-900/60 border border-gray-800 text-gray-400">
                    Học liệu trích xuất: <strong className="text-gray-200">GiaoTrinh_QuanTriChienLuoc.pdf</strong> (Chương 4)
                  </div>
                  <p className="text-gray-400 text-xs">
                    Quy trình duyệt 4 bước: DRAFT → REVIEWED → APPROVED → PUBLISHED
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Trust & Academic Principles */}
          <div className="border-t border-gray-800/80 pt-4 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>100% Giảng viên trực tiếp phê duyệt và công bố kịch bản</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Zero AI Grading — Tôn trọng tư duy phản biện độc lập</span>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            RIGHT COLUMN: REGISTRATION FORM
        ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Đăng ký tài khoản
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {role === "STUDENT"
                  ? "Cổng đăng ký dành cho Sinh viên tham gia giải quyết tình huống"
                  : "Cổng đăng ký dành cho Giảng viên thiết kế và quản trị tình huống"}
              </p>
            </div>

            {/* Error & Info Alerts */}
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {infoMsg && <Alert variant="info" className="mb-4">{infoMsg}</Alert>}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* ─── ROLE SELECTOR TABS (Sinh viên vs Giảng viên) ─── */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Vai trò trên hệ thống
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Card S: Sinh viên */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("STUDENT")}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      role === "STUDENT"
                        ? "bg-blue-50/60 border-blue-600 ring-1 ring-blue-600/30"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${
                      role === "STUDENT" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <span className={`block text-sm font-semibold ${
                        role === "STUDENT" ? "text-blue-900" : "text-gray-900"
                      }`}>
                        Sinh viên
                      </span>
                      <span className="block text-xs text-gray-500">
                        Ra quyết định & phản biện
                      </span>
                    </div>
                  </button>

                  {/* Card G: Giảng viên */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("LECTURER")}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      role === "LECTURER"
                        ? "bg-blue-50/60 border-blue-600 ring-1 ring-blue-600/30"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${
                      role === "LECTURER" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <span className={`block text-sm font-semibold ${
                        role === "LECTURER" ? "text-blue-900" : "text-gray-900"
                      }`}>
                        Giảng viên
                      </span>
                      <span className="block text-xs text-gray-500">
                        Biên soạn & duyệt kịch bản
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ─── ROW 1: Họ và tên & Địa chỉ email (2 Columns) ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-fullname" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ và tên
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email đại học
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@duytan.edu.vn"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              {/* ─── ROW 2: Role-Specific Single Column Field ─── */}
              {role === "STUDENT" ? (
                <div>
                  <label htmlFor="reg-student-id" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mã số sinh viên (MSSV)
                  </label>
                  <input
                    id="reg-student-id"
                    type="text"
                    required
                    placeholder="Ví dụ: 272030491"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="reg-department" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Khoa / Đơn vị công tác
                  </label>
                  <input
                    id="reg-department"
                    type="text"
                    required
                    placeholder="Ví dụ: Khoa Công nghệ Thông tin"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              )}

              {/* ─── ROW 3: Mật khẩu & Xác nhận mật khẩu (2 Columns) ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Tối thiểu 8 ký tự"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
              </div>

              {/* ─── LECTURER VERIFICATION NOTICE ─── */}
              {role === "LECTURER" && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                  <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Nhằm tuân thủ tính chuẩn mực học thuật và bản quyền học liệu, tài khoản Giảng viên sẽ được kích hoạt toàn quyền tác giả sau khi Khoa/Bộ môn xác nhận thông tin công tác.
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full h-10 mt-2"
                isLoading={loading}
                id="btn-register-submit"
              >
                {role === "STUDENT" ? "Đăng ký tài khoản Sinh viên" : "Đăng ký tài khoản Giảng viên"}
              </Button>
            </form>

            {/* Link to Login */}
            <p className="mt-4 text-center text-xs text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/login" state={location.state} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500 uppercase tracking-wider">
                  Hoặc
                </span>
              </div>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 px-4 text-xs font-medium text-gray-700 inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng ký với Google Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
