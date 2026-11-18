import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/routes/paths";
import { authService } from "@/services/authService";
import { authErrorMessage } from "@/pages/auth/components/authErrors";
import { FormMessage } from "@/pages/auth/components/FormMessage";
import {
  AuthAccountSwitch,
  AuthCheckbox,
  AuthFormHeading,
  AuthPasswordField,
  AuthSplitLayout,
  AuthSubmitButton,
  AuthTextField,
} from "@/pages/auth/components/AuthLayout";
import showcaseImage from "@/pages/auth/assets/showcase-admin.webp";

/**
 * 10.1 · Admin · Đăng nhập quản trị (Figma page EduBranch AI – Screens, node 536:9029).
 * Same split layout as 00.3. "Sign in form" 562 wide, column gap 20: heading · email · password
 * · session options · primary action (button, then the account switch 32 below) · an empty
 * "Alternative sign in" block (gap 20 + padding-top 44 + 44 tall, content hidden in Figma) = pb 108.
 */
export function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t("g1.errors.emailRequired"));
      return;
    }
    if (!password) {
      setError(t("g1.errors.passwordRequired"));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await authService.login({ email: email.trim(), password });
      // This entry point is for administrators only: never keep a session for another role.
      if (result.user.role !== "ADMIN") {
        setError(t("g1.errors.notAdmin"));
        return;
      }
      login(result.user, result.accessToken);
      navigate(PATHS.ADMIN.DASHBOARD, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err, t, "login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout showcaseImage={showcaseImage}>
      <form onSubmit={handleAdminLogin} noValidate className="flex w-full max-w-[420px] sm:max-w-[440px] flex-col gap-5 pb-6 sm:pb-8">
        <AuthFormHeading title={t("g1.admin.title")} subtitle={t("g1.admin.subtitle")} />

        {error && <FormMessage tone="error">{error}</FormMessage>}

        <AuthTextField
          id="admin-email"
          label={t("g1.form.email")}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("g1.admin.emailPlaceholder")}
        />
        <AuthPasswordField
          id="admin-password"
          label={t("g1.form.password")}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
        />

        <div className="flex h-[22px] items-center">
          <AuthCheckbox label={t("g1.form.rememberMe")} checked={rememberMe} onChange={setRememberMe} />
        </div>

        <div className="flex flex-col gap-8">
          <AuthSubmitButton disabled={loading}>{loading ? t("g1.login.submitting") : t("g1.login.submit")}</AuthSubmitButton>
          <AuthAccountSwitch prompt={t("g1.admin.notAdmin")} linkLabel={t("g1.admin.backToLogin")} to={PATHS.AUTH.LOGIN} />
        </div>
      </form>
    </AuthSplitLayout>
  );
}
