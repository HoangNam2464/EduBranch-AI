import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Button, Alert, Input, BrandMark, IconMail, IconLock, IconArrowRight } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Login Page (Figma 00.3, MVP Review `135:2791`).
 * Real authentication via POST /api/v1/auth/login.
 * "Quên mật khẩu?" is Phase 2 (Figma section 08) and is not rendered.
 * Dev quick login calls POST /auth/dev-login; shown only in `npm run dev` with VITE_ENABLE_DEV_LOGIN=true,
 * and the backend refuses it unless NODE_ENV=development and ENABLE_DEV_LOGIN=true.
 */
const DEV_LOGIN_VISIBLE = Boolean(import.meta.env?.DEV) && import.meta.env?.VITE_ENABLE_DEV_LOGIN === "true";

function loginErrorMessage(err: any): string {
  const status = err?.response?.status;
  if (status === 401) return "Email hoặc mật khẩu không đúng.";
  if (status === 429) return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
  if (!err?.response) return "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  return "Đăng nhập không thành công. Vui lòng thử lại.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? typeof stateFrom === "string"
      ? stateFrom
      : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
    : null;

  const finish = (result: { user: any; accessToken: string }) => {
    login(result.user, result.accessToken);
    navigate(resolveSafeReturnUrl(returnUrl, result.user.role), { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Vui lòng nhập địa chỉ email.");
    if (!password) return setError("Vui lòng nhập mật khẩu.");
    setLoading(true);
    setError(null);
    try {
      finish(await authService.login({ email: email.trim(), password }));
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: "LECTURER" | "STUDENT") => {
    setLoading(true);
    setError(null);
    try {
      finish(await authService.devLogin(role));
    } catch {
      setError("Đăng nhập nhanh chưa được bật trên máy chủ, hoặc chưa chạy script seed dữ liệu demo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2.5">
            <BrandMark size={36} />
            <span className="text-lg font-semibold text-gray-900">EduBranch AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Đăng nhập vào hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">Dành cho Giảng viên và Sinh viên</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-900">
                Địa chỉ Email
              </label>
              <div className="relative">
                <IconMail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten@truong.edu.vn"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-900">
                Mật khẩu
              </label>
              <div className="relative">
                <IconLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={loading} id="btn-login-submit">
              Đăng nhập <IconArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" state={location.state} className="font-medium text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>

        {DEV_LOGIN_VISIBLE && (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Đăng nhập nhanh · chỉ môi trường phát triển
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" id="btn-quick-lecturer" disabled={loading} onClick={() => quickLogin("LECTURER")}>
                Giảng viên demo
              </Button>
              <Button variant="secondary" size="sm" id="btn-quick-branching" disabled={loading} onClick={() => quickLogin("STUDENT")}>
                Sinh viên demo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
