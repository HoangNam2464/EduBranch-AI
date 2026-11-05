import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Button, Alert, Input, Field, BrandMark, cx } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Register Page (Figma 00.4 Sinh viên `135:2836`, 00.5 Giảng viên `135:2914`).
 * One page with a role switch instead of two routes. The Google sign-up button in the frames is not
 * rendered: there is no OAuth backend and no task for it in the review scope (MVP-REVIEW-MAPPING).
 */
type RoleOption = "STUDENT" | "LECTURER";

function registerErrorMessage(err: any): string {
  const status = err?.response?.status;
  if (status === 409) return "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.";
  if (status === 429) return "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
  if (status === 400) return "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại email và mật khẩu.";
  if (!err?.response) return "Không kết nối được máy chủ. Vui lòng thử lại.";
  return "Đăng ký không thành công. Vui lòng thử lại.";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", role: "STUDENT" as RoleOption });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? typeof stateFrom === "string"
      ? stateFrom
      : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
    : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setError("Vui lòng nhập họ và tên.");
    if (!form.email.trim()) return setError("Vui lòng nhập địa chỉ email.");
    if (form.password.length < 8) return setError("Mật khẩu phải có ít nhất 8 ký tự.");
    if (form.password !== form.confirm) return setError("Mật khẩu xác nhận không khớp.");
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      login(result.user, result.accessToken);
      navigate(resolveSafeReturnUrl(returnUrl, result.user.role), { replace: true });
    } catch (err) {
      setError(registerErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2.5">
            <BrandMark size={36} />
            <span className="text-lg font-semibold text-gray-900">EduBranch AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-gray-500">
            {form.role === "STUDENT"
              ? "Cổng đăng ký dành cho Sinh viên tham gia học tập Case Study"
              : "Cổng đăng ký dành cho Giảng viên biên soạn và kiểm duyệt Case Study"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div role="radiogroup" aria-label="Vai trò" className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
            {(["STUDENT", "LECTURER"] as RoleOption[]).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={form.role === r}
                onClick={() => setForm({ ...form, role: r })}
                className={cx(
                  "h-8 cursor-pointer rounded-md text-sm font-medium transition-colors",
                  form.role === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
                )}
              >
                {r === "STUDENT" ? "Sinh viên" : "Giảng viên"}
              </button>
            ))}
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Họ và tên" htmlFor="register-fullname" required>
              <Input id="register-fullname" autoComplete="name" value={form.fullName} onChange={set("fullName")} disabled={loading} placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Địa chỉ Email" htmlFor="register-email" required>
              <Input id="register-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} disabled={loading} placeholder="ten@truong.edu.vn" />
            </Field>
            <Field label="Mật khẩu" htmlFor="register-password" required hint="Tối thiểu 8 ký tự.">
              <Input id="register-password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} disabled={loading} />
            </Field>
            <Field label="Xác nhận mật khẩu" htmlFor="register-confirm" required>
              <Input id="register-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} disabled={loading} />
            </Field>
            <Button type="submit" size="lg" className="w-full" isLoading={loading} id="btn-register-submit">
              Tạo tài khoản
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" state={location.state} className="font-medium text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
