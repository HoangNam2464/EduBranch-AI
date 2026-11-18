import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Clock, LoaderCircle } from "lucide-react";

/*
 * 03.2 "Đang sinh case nháp" — progress dialog over 03.1 while POST /cases/generate runs.
 *  - Scrim #202124 at 45%. Panel 520 wide, white, radius 18, padding 24, column gap 16,
 *    shadow 0 16 40 rgba(32,33,36,.16).
 *  - Header row gap 12: icon tile 40x40 #DFEDF9 radius 8 with loader-circle 20 (stroke 1.33 #2A4E7F);
 *    title Regular 20/28, message Regular 14/20 #696A70 (gap 4).
 *  - Step rows: padding 12/14, gap 12, radius 12, 14/20 text.
 * The backend runs generation as one synchronous request and reports no per-step progress,
 * so the steps are listed as the pipeline (no done/running/waiting flags are invented).
 * The dialog cannot be dismissed: it closes when the request settles.
 */
export function GenerationDialog({ open, materialCount }: { open: boolean; materialCount: number }) {
  const { t } = useTranslation();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const steps = [
    materialCount > 0 ? t("g3.generation.stepRetrieve", { count: materialCount }) : t("g3.generation.stepRetrieveNone"),
    t("g3.generation.stepCompose"),
    t("g3.generation.stepValidate"),
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div aria-hidden="true" className="fixed inset-0 bg-ink/45" />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-busy="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative flex w-[520px] max-w-full flex-col gap-4 rounded-eb-xl bg-surface p-6 shadow-eb-dialog outline-none"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-eb-md bg-selected text-link">
            <LoaderCircle size={20} absoluteStrokeWidth strokeWidth={1.33} className="motion-safe:animate-spin" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={titleId} className="text-[20px] leading-7 font-normal text-ink">
              {t("g3.generation.title")}
            </h2>
            <p id={descId} className="text-[14px] leading-5 text-ink-secondary">
              {t("g3.generation.description")}
            </p>
          </div>
        </div>
        <ol className="flex flex-col gap-4">
          {steps.map((label) => (
            <li key={label} className="flex items-center gap-3 rounded-eb-lg bg-canvas px-3.5 py-3">
              <Clock aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.51} className="shrink-0 text-ink-secondary" />
              <span className="min-w-0 flex-1 text-[14px] leading-5 text-ink">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>,
    document.body,
  );
}
