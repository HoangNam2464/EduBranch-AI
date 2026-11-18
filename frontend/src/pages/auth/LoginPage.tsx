import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";
import { SocialSignIn } from "@/components/ds";
import { resolveSafeReturnUrl } from "@/utils/navigation";
import { PATHS } from "@/routes/paths";
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
import showcaseImage from "@/pages/auth/assets/showcase-login.webp";

/**
 * 00.3 · Đăng nhập · Mặc định (Figma page 08, node 483:17474).
 * "Sign in form" 562 wide, column gap 20: heading · email · password · session options
 * (space-between) · primary action · EB/Social Sign-in (padding-top 4) · account switch.
 */
export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? typeof stateFrom === "string"
      ? stateFrom
      : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
    : null;

  const handleLogin = async (e: FormEvent) => {
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
    setInfoMsg(null);

    try {
      const result = await authService.login({ email: email.trim(), password });
      login(result.user, result.accessToken);
      const destination = resolveSafeReturnUrl(returnUrl, result.user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err, t, "login"));
    } finally {
      setLoading(false);
    }
  };

  const handleSso = () => {
    setInfoMsg(t("g1.info.ssoPending"));
  };

  return (
    <AuthSplitLayout showcaseImage={showcaseImage}>
      <form onSubmit={handleLogin} noValidate className="flex w-full max-w-[420px] sm:max-w-[440px] flex-col gap-5">
        <AuthFormHeading title={t("g1.login.title")} subtitle={t("g1.login.subtitle")} />

        {error && <FormMessage tone="error">{error}</FormMessage>}
        {infoMsg && <FormMessage tone="info">{infoMsg}</FormMessage>}

        <AuthTextField
          id="login-email"
          label={t("g1.form.email")}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("g1.login.emailPlaceholder")}
        />
        <AuthPasswordField
          id="login-password"
          label={t("g1.form.password")}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
        />

        <div className="flex h-[22px] items-center justify-between">
          <AuthCheckbox label={t("g1.form.rememberMe")} checked={rememberMe} onChange={setRememberMe} />
          <Link
            to={PATHS.AUTH.FORGOT_PASSWORD}
            className="text-[13px] leading-5 font-normal text-link hover:underline"
          >
            {t("g1.login.forgotPassword")}
          </Link>
        </div>

        <AuthSubmitButton disabled={loading}>{loading ? t("g1.login.submitting") : t("g1.login.submit")}</AuthSubmitButton>

        <div className="pt-1">
          <SocialSignIn
            dividerLabel={t("g1.social.divider")}
            googleLabel={t("g1.social.google")}
            microsoftLabel={t("g1.social.microsoft")}
            onGoogle={handleSso}
            onMicrosoft={handleSso}
          />
        </div>

        <AuthAccountSwitch prompt={t("g1.login.noAccount")} linkLabel={t("g1.login.registerLink")} to={PATHS.AUTH.REGISTER} />
      </form>
    </AuthSplitLayout>
  );
}
