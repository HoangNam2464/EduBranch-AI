import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Button, Alert } from "../components/ui";
import { resolveSafeReturnUrl } from "../utils/navigation";

/**
 * EduBranch AI — Login Page
 *
 * Real authentication via POST /api/v1/auth/login.
 * Dev quick-access shortcuts preserved for local testing.
 */
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
    ? (typeof stateFrom === "string" ? stateFrom : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`)
    : null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.login({ email, password });
      login(result.user, result.accessToken);
      const destination = resolveSafeReturnUrl(returnUrl, result.user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Dev quick-access (bypasses real auth for local UI testing) ───────────
  const quickAccess = (role: "LECTURER" | "STUDENT") => {
    login(
      {
        id: `dev-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@university.edu.vn`,
        fullName: role === "LECTURER" ? "TS. Trần Giảng Viên" : "Nguyễn Văn Sinh Viên",
        role,
      },
      "dev-bypass-token",
    );
    const destination = resolveSafeReturnUrl(returnUrl, role);
    navigate(destination, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">EduBranch AI</h1>
          <p className="mt-2 text-sm text-gray-500">
            Hệ thống học tập tình huống thực nghiệm bậc Đại học
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                Email đại học
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu.vn"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              id="btn-login-submit"
            >
              Đăng nhập
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link to="/register" state={location.state} className="font-medium text-blue-600 hover:underline">
              Đăng ký
            </Link>
          </p>

          {/* Dev quick access (local dev only) */}
          {import.meta.env.DEV && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Truy cập nhanh (local dev only)
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  id="btn-quick-branching"
                  onClick={() => quickAccess("STUDENT")}
                  className="w-full rounded border border-blue-200 bg-blue-50 px-3 py-2 text-left
                             text-xs font-medium text-blue-800 hover:bg-blue-100 flex items-center justify-between"
                >
                  <span>👉 Sinh viên — <strong>Branching Study</strong></span>
                  <span className="text-blue-600">Khám phá →</span>
                </button>
                <button
                  type="button"
                  id="btn-quick-lecturer"
                  onClick={() => quickAccess("LECTURER")}
                  className="w-full rounded border border-purple-200 bg-purple-50 px-3 py-2 text-left
                             text-xs font-medium text-purple-800 hover:bg-purple-100 flex items-center justify-between"
                >
                  <span>👨‍🏫 Giảng viên — <strong>Quản lý học phần & Case</strong></span>
                  <span className="text-purple-600">Quản trị →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
