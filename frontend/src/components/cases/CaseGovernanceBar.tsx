/**
 * Case editor action bar + publish dialog.
 * Figma page EduBranch AI – Screens:
 *  - 03.4 / 03.5 "Page actions": white card, radius 18, padding 20, 84 high, items centred and
 *    spread (space-between): left action · Learning/Case Lifecycle Stepper (720) · right actions (gap 8).
 *    Bar buttons are 44 high, padding 0 16, radius 8, Eduva/Body 14/20:
 *      left  bg/canvas + text/primary · approve bg/selected + text/link · publish action/primary + text/inverse;
 *      a locked button is drawn at 45% opacity.
 *  - 03.6: the four states (Draft · Reviewed · Approved · Published); Published has no left action.
 *  - 03.7: "Xuất bản Case Study" dialog, 560 wide: summary card (bg/surface-muted, radius 12, padding 16,
 *    gap 12) with checks, warning note (semantic/warning-bg, radius 10), Hủy bỏ + Xác nhận xuất bản.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button, CaseLifecycleStepper, Dialog, cx, FOCUS_RING } from "@/components/ds";
import type { CaseStatus } from "@/types";

export type GovernanceStatus = CaseStatus;

/** Error of a failed request: translated summary + optional backend text. */
export interface RequestError {
  summary: string;
  detail?: string;
}

export interface PublishSummary {
  title: string;
  /** e.g. "CS402 · Branching Study · 3 điểm quyết định · 3 kết cục". */
  meta: string;
  /** Pre-publish checks derived from the loaded case. */
  checks: Array<{ label: string; ok: boolean }>;
  /** Course code or name for the dialog description; omitted when unknown. */
  course?: string;
}

interface CaseGovernanceBarProps {
  status: GovernanceStatus;
  /** A save or status request is in flight: every action is disabled. */
  saving?: boolean;
  /** The editor has unsaved changes (Approve is blocked until they are saved). */
  dirty?: boolean;
  publish: PublishSummary;
  onSaveReviewed: () => void;
  onSaveDraft: () => void;
  onApprove: () => void;
  /** Resolves null when the backend accepted PUBLISHED (the dialog then closes), else the error. */
  onConfirmPublish: () => Promise<RequestError | null>;
  /** Called when publishing failed after the dialog was already closed. */
  onPublishErrorAfterClose: (error: RequestError) => void;
  onRevertToDraft: () => void;
  onCopyLink: () => void;
}

const BAR_BUTTON = cx(
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-eb-md px-4 text-[14px] leading-5 font-normal transition-colors",
  "enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-45",
  FOCUS_RING,
);
const LEFT_BUTTON = cx(BAR_BUTTON, "bg-canvas text-ink enabled:hover:bg-surface-hover");
const APPROVE_BUTTON = cx(BAR_BUTTON, "bg-selected text-link enabled:hover:bg-primary-subtle-hover");
const PRIMARY_BUTTON = cx(BAR_BUTTON, "bg-primary text-ink-inverse enabled:hover:bg-primary-hover");

export function CaseGovernanceBar({
  status,
  saving = false,
  dirty = false,
  publish,
  onSaveReviewed,
  onSaveDraft,
  onApprove,
  onConfirmPublish,
  onPublishErrorAfterClose,
  onRevertToDraft,
  onCopyLink,
}: CaseGovernanceBarProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishError, setPublishError] = useState<RequestError | null>(null);
  const openRef = useRef(false);
  const approveHintId = useId();
  const lockedHintId = useId();

  useEffect(() => {
    openRef.current = dialogOpen;
  }, [dialogOpen]);

  function openDialog() {
    setPublishError(null);
    setDialogOpen(true);
  }

  async function confirmPublish() {
    setPublishError(null);
    const error = await onConfirmPublish();
    if (!error) {
      setDialogOpen(false);
      return;
    }
    if (openRef.current) setPublishError(error);
    else onPublishErrorAfterClose(error);
  }

  const busy = (label: ReactNode) => (saving ? t("caseReview.bar.saving") : label);
  const approveBlocked = status === "REVIEWED" && dirty;

  return (
    <>
      <div
        role="group"
        aria-label={t("caseReview.bar.label")}
        className="flex h-[84px] items-center justify-between rounded-eb-xl bg-surface p-5"
      >
        <div className="flex">
          {status === "DRAFT" && (
            <button type="button" onClick={onSaveReviewed} disabled={saving} className={LEFT_BUTTON}>
              {busy(t("caseReview.bar.saveAndReview"))}
            </button>
          )}
          {status === "REVIEWED" && (
            <button type="button" onClick={onSaveDraft} disabled={saving || !dirty} className={LEFT_BUTTON}>
              {busy(t("caseReview.bar.saveChanges"))}
            </button>
          )}
          {status === "APPROVED" && (
            <button type="button" onClick={onRevertToDraft} disabled={saving} className={LEFT_BUTTON}>
              {busy(t("caseReview.bar.revertToDraft"))}
            </button>
          )}
        </div>

        <CaseLifecycleStepper
          status={status === "DRAFT" ? "draft" : status === "REVIEWED" ? "reviewed" : status === "APPROVED" ? "approved" : "published"}
          labels={[t("caseReview.status.DRAFT"), t("caseReview.status.REVIEWED"), t("caseReview.status.APPROVED"), t("caseReview.status.PUBLISHED")]}
          ariaLabel={t("caseReview.bar.stepper")}
          className="w-[720px] shrink-0"
        />

        <div className="flex gap-2">
          <span id={lockedHintId} className="sr-only">
            {t(`caseReview.bar.locked.${status}`)}
          </span>
          <span id={approveHintId} className="sr-only">
            {t("caseReview.bar.approveNeedsSave")}
          </span>
          {(status === "DRAFT" || status === "REVIEWED") && (
            <>
              <button
                type="button"
                onClick={onApprove}
                disabled={status === "DRAFT" || saving || approveBlocked}
                aria-describedby={status === "DRAFT" ? lockedHintId : approveBlocked ? approveHintId : undefined}
                title={status === "DRAFT" ? t("caseReview.bar.locked.DRAFT") : approveBlocked ? t("caseReview.bar.approveNeedsSave") : undefined}
                className={APPROVE_BUTTON}
              >
                {t("caseReview.bar.approve")}
              </button>
              <button
                type="button"
                disabled
                aria-describedby={lockedHintId}
                title={t(`caseReview.bar.locked.${status}`)}
                className={PRIMARY_BUTTON}
              >
                {t("caseReview.bar.publish")}
              </button>
            </>
          )}
          {status === "APPROVED" && (
            <button type="button" onClick={openDialog} disabled={saving} className={PRIMARY_BUTTON}>
              {t("caseReview.bar.publishForStudents")}
            </button>
          )}
          {status === "PUBLISHED" && (
            <button type="button" onClick={onCopyLink} className={PRIMARY_BUTTON}>
              {t("caseReview.bar.copyLink")}
            </button>
          )}
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t("caseReview.publishModal.title")}
        description={
          publish.course
            ? t("caseReview.publishModal.description", { course: publish.course })
            : t("caseReview.publishModal.descriptionNoCourse")
        }
        width={560}
      >
        <div className="mt-3 flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-eb-lg bg-surface-muted p-4">
            <p className="text-[14px] leading-5 font-medium text-ink">{publish.title}</p>
            <p className="text-[12px] leading-4 font-normal text-ink-secondary">{publish.meta}</p>
            <ul className="flex flex-col gap-3">
              {publish.checks.map((check) => (
                <li key={check.label} className="flex items-center gap-2.5 text-[14px] leading-5 font-normal text-ink">
                  {check.ok ? (
                    <CircleCheck aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0 text-success-text" />
                  ) : (
                    <CircleAlert aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.5} className="shrink-0 text-error-text" />
                  )}
                  <span>
                    <span className="sr-only">{check.ok ? t("caseReview.publishModal.checkOk") : t("caseReview.publishModal.checkFailed")} </span>
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2.5 rounded-[10px] bg-warning-bg px-3 py-2.5 text-[14px] leading-5 font-normal text-warning-text">
            <CircleAlert aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.5} className="shrink-0" />
            <span>{t("caseReview.publishModal.warning")}</span>
          </p>

          {publishError && (
            <div role="alert" className="flex flex-col gap-0.5 rounded-[10px] bg-error-bg px-3 py-2.5 text-[14px] leading-5 text-error-text">
              <span>{publishError.summary}</span>
              {publishError.detail && (
                <span className="text-[12px] leading-4 text-ink-secondary">
                  {t("caseReview.errors.detail", { detail: publishError.detail })}
                </span>
              )}
            </div>
          )}

          <div className="flex items-start justify-end gap-3">
            <Button variant="secondary" size="md" onClick={() => setDialogOpen(false)}>
              {t("caseReview.publishModal.cancel")}
            </Button>
            <Button variant="primary" size="md" onClick={() => void confirmPublish()} disabled={saving}>
              {saving ? t("caseReview.publishModal.publishing") : t("caseReview.publishModal.confirm")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
