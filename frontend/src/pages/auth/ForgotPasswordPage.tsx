import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cx, FOCUS_RING } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { FormMessage } from "@/pages/auth/components/FormMessage";
import { AuthFormHeading, AuthSplitLayout, AuthSubmitButton, AuthTextField } from "@/pages/auth/components/AuthLayout";
import showcaseImage from "@/pages/auth/assets/showcase-recovery.webp";

/**
 * "Quay lại đăng nhập" (Figma "Account switch" inside "Primary action"):
 * Regular 15/22 text-secondary, centred, 32 below the button.
 */
export function RecoveryBackToLogin() {
  const { t } = useTranslation();
  return (
    <Link
      to={PATHS.AUTH.LOGIN}
      className={cx("rounded-eb-sm text-[15px] leading-[22px] font-normal text-ink-secondary hover:text-ink hover:underline", FOCUS_RING)}
    >
      {t("authRecovery.backToLogin")}
    </Link>
  );
}

/**
 * 00.3b · Quên mật khẩu · Nhập email (Figma page EduBranch AI – Screens, node 483:20016).
 * Same split layout as 00.3. "Sign in form" 562 wide, column gap 20: heading · email
 * · "Primary action" (padding-top 16, column gap 32: button · back to sign in).
 * The backend has no forgot-password endpoint (auth = register, login, me): the form
 * stays as designed and submitting explains that the function is not available yet.
 */
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUnavailable(true);
  };

  return (
    <AuthSplitLayout showcaseImage={showcaseImage}>
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[420px] sm:max-w-[440px] flex-col gap-5">
        <AuthFormHeading title={t("authRecovery.forgot.title")} subtitle={t("authRecovery.forgot.subtitle")} />

        {unavailable && <FormMessage tone="info">{t("authRecovery.unavailable")}</FormMessage>}

        <AuthTextField
          id="forgot-email"
          label={t("authRecovery.forgot.emailLabel")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("authRecovery.forgot.emailPlaceholder")}
        />

        <div className="flex w-full flex-col items-center gap-8">
          <AuthSubmitButton>{t("authRecovery.forgot.submit")}</AuthSubmitButton>
          <RecoveryBackToLogin />
        </div>
      </form>
    </AuthSplitLayout>
  );
}
