import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { RecoveryBackToLogin } from "@/pages/auth/ForgotPasswordPage";
import { FormMessage } from "@/pages/auth/components/FormMessage";
import { AuthFormHeading, AuthPasswordField, AuthSplitLayout, AuthSubmitButton } from "@/pages/auth/components/AuthLayout";
import showcaseImage from "@/pages/auth/assets/showcase-recovery.webp";

/**
 * 00.3c · Mật khẩu mới · Biểu mẫu (Figma page 08, node 483:21621).
 * "Sign in form" 562 wide, column gap 20: heading · new password · confirm password
 * · "Primary action" (padding-top 16, column gap 32: button · back to sign in).
 * The backend has no reset-password endpoint: the form stays as designed and
 * submitting explains that the function is not available yet.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUnavailable(true);
  };

  return (
    <AuthSplitLayout showcaseImage={showcaseImage}>
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[420px] sm:max-w-[440px] flex-col gap-5">
        <AuthFormHeading title={t("authRecovery.reset.title")} subtitle={t("authRecovery.reset.subtitle")} />

        {unavailable && <FormMessage tone="info">{t("authRecovery.unavailable")}</FormMessage>}

        <AuthPasswordField
          id="reset-password"
          label={t("authRecovery.reset.passwordLabel")}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("authRecovery.reset.passwordPlaceholder")}
        />
        <AuthPasswordField
          id="reset-password-confirm"
          label={t("authRecovery.reset.confirmLabel")}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("authRecovery.reset.confirmPlaceholder")}
        />

        <div className="flex w-full flex-col items-center gap-8">
          <AuthSubmitButton>{t("authRecovery.reset.submit")}</AuthSubmitButton>
          <RecoveryBackToLogin />
        </div>
      </form>
    </AuthSplitLayout>
  );
}
