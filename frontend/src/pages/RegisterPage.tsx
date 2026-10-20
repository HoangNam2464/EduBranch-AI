import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { RegisterRequest } from "../types";
import { Button, Alert } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState<RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? (typeof stateFrom === "string" ? stateFrom : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setError("Họ và tên không được để trống.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email đại học không được để trống.");
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

    try {
      const result = await authService.register({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });
      login(result.user, result.accessToken);
      const destination = resolveSafeReturnUrl(returnUrl, result.user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Join EduBranch AI — University Case-Based Learning
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <Alert variant="error" className="mb-4">{error}</Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="register-fullname" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="register-fullname"
                type="text"
                autoComplete="name"
                required
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nguyen Van A"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                University Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="name@university.edu.vn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="register-role" className="block text-sm font-medium text-gray-700">
                I am a…
              </label>
              <select
                id="register-role"
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "LECTURER" | "STUDENT" })}
              >
                <option value="STUDENT">Student (Sinh viên)</option>
                <option value="LECTURER">Lecturer (Giảng viên)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                required
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              id="btn-register-submit"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" state={location.state} className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
