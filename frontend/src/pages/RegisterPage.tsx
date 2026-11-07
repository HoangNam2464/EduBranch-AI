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
 * Implements both Figma designs in a unified, reactive interface:
 * - 00.4: Student registration with Student ID, case player preview mockup
 * - 00.5: Lecturer registration with Department/Faculty, academic verification notice, case authoring mockup
 * - Dynamic role switcher matching Figma tabs (Card S vs Card G)
 * - Stack: React 19 + TypeScript + TailwindCSS v4
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  // Initialize role from URL query param if present (e.g., ?role=lecturer or ?role=student)
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
      // Backend validates standard RegisterDto: { email, password, fullName, role }
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/80 p-4 sm:p-6 lg:p-8">
      
      {/* ─────────────────────────────────────────────────────────────
          MAIN REGISTRATION SPLIT CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* ───────────────────────────────────────────────────────────
            LEFT COLUMN: BRANDING & DESKTOP MONITOR ILLUSTRATION
        ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#0F172A] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          
          {/* Background Ambient Glow */}
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
          <div className="relative z-10 my-6 space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Nền tảng học tập tình huống thực nghiệm
            </h2>
            <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
              Giảng viên xây dựng Case Study từ tài liệu môn học, sinh viên ra quyết định, lập luận và suy ngẫm trên từng nhánh tình huống.
            </p>
          </div>

          {/* Bottom: Desktop Monitor Mockup on Stand (Changes dynamically per role) */}
          <div className="relative z-10 mt-2">
            <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
              
              {/* Monitor Screen Frame */}
              <div className="rounded-xl bg-gray-900 border-2 border-gray-700 p-2 shadow-2xl">
                
                {/* Inside Screen Preview */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-gray-800 space-y-2 select-none overflow-hidden text-[10px]">
                  
                  {role === "STUDENT" ? (
                    // ── Student Screen: Branching Case Player & Decisions ──
                    <>
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                        <span className="font-bold text-blue-900 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                          Điểm quyết định 01
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                          Khủng hoảng bảo mật
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded border border-gray-200/80 shadow-2xs space-y-1.5">
                        <p className="text-[9px] text-gray-700 leading-snug">
                          Hệ thống ngân hàng bị tấn công DDoS. Bạn phải ra quyết định cô lập cổng giao dịch hay duy trì kết nối?
                        </p>
                        <div className="space-y-1">
                          <div className="p-1 rounded bg-blue-50 border border-blue-200 text-[8.5px] text-blue-900 font-medium flex items-center justify-between">
                            <span>A. Ngắt kết nối cụm phụ</span>
                            <span className="text-blue-600 font-bold">Lựa chọn ✓</span>
                          </div>
                          <div className="p-1 rounded bg-gray-50 border border-gray-200 text-[8.5px] text-gray-600">
                            B. Chuyển hướng lưu lượng
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // ── Lecturer Screen: Case Review & Tree Topology ──
                    <>
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                        <span className="font-bold text-blue-900 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                          Biên tập Case Study
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                          Bản nháp (DRAFT)
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded border border-gray-200/80 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-bold text-gray-800">Cây quyết định: 4 nút, 6 phương án</span>
                          <span className="text-emerald-600 font-semibold">DFS Hợp lệ ✓</span>
                        </div>
                        <div className="p-1.5 rounded bg-gray-50 border border-gray-200 text-[8.5px] text-gray-600">
                          Tài liệu nguồn: <strong>GiaoTrinh_AnNinhMang.pdf</strong> (trang 114)
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-blue-700 font-semibold">
                          <span>Duyệt 4 bước: DRAFT → REVIEWED → APPROVED → PUBLISHED</span>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* Monitor Stand (Neck + Base Plate) */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-3 bg-gradient-to-b from-gray-400 to-gray-500 shadow-sm" />
                <div className="w-20 h-1.5 bg-gray-400 rounded-full shadow-md" />
              </div>

            </div>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────
            RIGHT COLUMN: REGISTRATION FORM
        ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          
          <div className="w-full max-w-md mx-auto">
            
            {/* Brand Logo Header */}
            <div className="flex items-center gap-2 mb-2">
              <EduBranchLogo size={28} />
              <span className="text-sm font-bold text-gray-900 tracking-tight">
                EduBranch AI
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Đăng ký tài khoản mới
            </h1>

            {/* Role-specific subtitle matching Figma */}
            <p className="mt-1 text-xs sm:text-sm text-gray-500 mb-5">
              {role === "STUDENT"
                ? "Cổng đăng ký dành cho Sinh viên tham gia học tập Case Study"
                : "Cổng đăng ký dành cho Giảng viên & Cán bộ tham gia biên soạn Case Study"}
            </p>

            {/* Error & Info Alerts */}
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {infoMsg && <Alert variant="info" className="mb-4">{infoMsg}</Alert>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              
              {/* ─── ROLE SELECTOR TABS (Figma Card S vs Card G) ─── */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tôi là
                </label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Card S: Sinh viên */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("STUDENT")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      role === "STUDENT"
                        ? "bg-blue-50/70 border-2 border-blue-500 shadow-xs"
                        : "bg-white border-gray-200/90 hover:border-gray-300"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      role === "STUDENT" ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      S
                    </div>
                    <div>
                      <span className={`block text-xs font-bold leading-tight ${
                        role === "STUDENT" ? "text-blue-950" : "text-gray-900"
                      }`}>
                        Sinh viên
                      </span>
                      <span className="block text-[10px] text-gray-500 leading-tight">
                        Học & phản biện tình huống
                      </span>
                    </div>
                  </button>

                  {/* Card G: Giảng viên */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("LECTURER")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      role === "LECTURER"
                        ? "bg-blue-50/70 border-2 border-blue-500 shadow-xs"
                        : "bg-white border-gray-200/90 hover:border-gray-300"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      role === "LECTURER" ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      G
                    </div>
                    <div>
                      <span className={`block text-xs font-bold leading-tight ${
                        role === "LECTURER" ? "text-blue-950" : "text-gray-900"
                      }`}>
                        Giảng viên
                      </span>
                      <span className="block text-[10px] text-gray-500 leading-tight">
                        Tạo case & duyệt học thuật
                      </span>
                    </div>
                  </button>

                </div>
              </div>

              {/* ─── ROW 1: Họ và tên & Địa chỉ email (2 Columns) ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
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
                    className="block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900
                               placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Địa chỉ email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@duytan.edu.vn"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900
                               placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* ─── ROW 2: Role-Specific Single Column Field ─── */}
              {role === "STUDENT" ? (
                // Student ID (00.4)
                <div>
                  <label htmlFor="reg-student-id" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Mã số sinh viên
                  </label>
                  <input
                    id="reg-student-id"
                    type="text"
                    required
                    placeholder="Ví dụ: 272030491"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900
                               placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              ) : (
                // Faculty / Department (00.5)
                <div>
                  <label htmlFor="reg-department" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Khoa / Đơn vị công tác
                  </label>
                  <input
                    id="reg-department"
                    type="text"
                    required
                    placeholder="Ví dụ: Khoa Công nghệ Thông tin"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900
                               placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              )}

              {/* ─── ROW 3: Mật khẩu & Xác nhận mật khẩu (2 Columns) ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
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
                      className="block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900
                                 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
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
                      className="block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900
                                 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── LECTURER VERIFICATION NOTICE (00.5 only) ─── */}
              {role === "LECTURER" && (
                <div className="rounded-xl border border-amber-200/90 bg-amber-50/70 p-3 flex items-start gap-2.5 text-xs text-amber-900 leading-snug">
                  <span className="text-amber-600 text-sm shrink-0 mt-0.5">ℹ️</span>
                  <span>
                    Nhằm tuân thủ tính chuẩn mực học thuật và bản quyền học liệu, tài khoản Giảng viên sẽ được kích hoạt toàn quyền tác giả sau khi Khoa/Bộ môn xác nhận thông tin công tác.
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm hover:shadow text-sm cursor-pointer mt-2"
                isLoading={loading}
                id="btn-register-submit"
              >
                Hoàn tất đăng ký
              </Button>
            </form>

            {/* Link to Login */}
            <p className="mt-4 text-center text-xs text-gray-500">
              Đã có tài khoản?{" "}
              <Link to="/login" state={location.state} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-4">
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
              onClick={handleGoogleRegister}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 py-2 px-4 text-xs font-semibold text-gray-700 inline-flex items-center justify-center gap-2.5 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng ký với Google</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
