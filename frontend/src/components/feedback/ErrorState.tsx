import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, RotateCcw, type LucideIcon } from "lucide-react";
import { StateCard, StatePanel } from "@/components/feedback/StateCard";
import { SupportEmailLink } from "@/components/feedback/StateButton";
import { formatClockTime, isValidDate } from "@/components/feedback/stateFormat";

/**
 * 01.3 — load error inside a list area.
 * Card tone "error": icon box #FFE5E5, Icon/circle-alert 20 stroke 1.5 #D11F1F,
 * Secondary SM "Thử lại" with Icon/rotate-ccw (stroke 1.7, #202124).
 * Below the card (no gap): Roboto Regular 12/16 #909198 line
 * "Mã lỗi 503 · 09:42 — nếu lỗi lặp lại, gửi mã này tới " + support mailbox
 * in Roboto Medium 12/16 #2A4E7F.
 */
export interface ErrorStateProps {
  /** Defaults to `states.error.title`. */
  title?: ReactNode;
  /** Defaults to `states.error.description`. */
  description?: ReactNode;
  /** Shows the "Thử lại" button when provided. */
  onRetry?: () => void;
  /** HTTP status or error code shown in the help line (line hidden when absent). */
  errorCode?: string | number;
  /** When the error happened; shown as HH:mm next to the code. */
  occurredAt?: Date;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  /** Wrap the card in the "List state" panel (default true). */
  framed?: boolean;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  errorCode,
  occurredAt,
  icon = CircleAlert,
  iconStrokeWidth = 1.5,
  framed = true,
  className = "",
}: ErrorStateProps) {
  const { t } = useTranslation();
  const hasCode = errorCode !== undefined && errorCode !== "";
  const codeLine = hasCode
    ? isValidDate(occurredAt)
      ? t("states.error.codeLine", { code: errorCode, time: formatClockTime(occurredAt) })
      : t("states.error.codeLineNoTime", { code: errorCode })
    : null;

  const body = (
    <>
      <StateCard
        tone="error"
        icon={icon}
        iconStrokeWidth={iconStrokeWidth}
        title={title ?? t("states.error.title")}
        description={description ?? t("states.error.description")}
        actionVariant="secondary"
        action={
          onRetry
            ? { label: t("states.error.retry"), icon: RotateCcw, iconStrokeWidth: 1.7, onClick: onRetry }
            : undefined
        }
      />
      {codeLine && (
        <p className="text-center text-[12px] leading-4 text-ink-muted">
          {codeLine}
          <SupportEmailLink />
        </p>
      )}
    </>
  );

  if (!framed) {
    return (
      <div role="alert" className={`flex flex-col items-center ${className}`}>
        {body}
      </div>
    );
  }
  return (
    <StatePanel role="alert" className={className}>
      {body}
    </StatePanel>
  );
}
