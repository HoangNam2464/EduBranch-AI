import { useTranslation } from "react-i18next";
import { Dialog } from "@/components/ds";
import type { AttemptSummary } from "@/types";

/**
 * Figma 05.10 "Bắt đầu lượt làm mới?" — Overlays/Dialog (Confirm, 480 wide).
 * A retry creates a NEW attempt row (attempt_number + 1); earlier attempts stay untouched.
 */
export function NewAttemptDialog({
  open,
  onClose,
  onConfirm,
  busy,
  nextNumber,
  previous,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  nextNumber: number;
  previous?: { summary: AttemptSummary; steps: number };
}) {
  const { t } = useTranslation();
  const prev = previous?.summary;
  const prevLine = prev
    ? t("g5.newAttempt.previous", {
        n: prev.attemptNumber,
        state: t(prev.completed ? "g5.newAttempt.stateCompleted" : "g5.newAttempt.stateInProgress"),
        count: previous.steps,
        reflection: t(prev.reflectionStatus === "SUBMITTED" ? "g5.newAttempt.reflected" : "g5.newAttempt.notReflected"),
      })
    : null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("g5.newAttempt.title")}
      description={
        <>
          {t("g5.newAttempt.message")}
          {prevLine && (
            <>
              <br />
              {prevLine}
            </>
          )}
        </>
      }
      cancelLabel={t("g5.common.cancel")}
      confirmLabel={t("g5.newAttempt.confirm", { n: nextNumber })}
      onConfirm={onConfirm}
      confirmDisabled={busy}
    />
  );
}
