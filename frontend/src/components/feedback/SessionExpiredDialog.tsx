import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { StateButton, type StateActionTarget } from "@/components/feedback/StateButton";

/**
 * 01.6 — session expired (401). Modal over the current page.
 *  - Scrim: #202124 at 45% opacity, full viewport
 *  - Dialog ("Overlays/Dialog", Type=Destructive): 480 wide, white, radius 18,
 *    padding 24, gap 8, shadow 0 16 40 rgba(32,33,36,0.16)
 *  - Title Roboto Regular 20/28 #202124 · Message Regular 14/20 #696A70
 *  - Actions: padding-top 16, gap 12, right-aligned; Primary MD "Đăng nhập lại" (no icon)
 * The action is focused on open; Tab stays inside; Escape calls `onClose` when given.
 */
export interface SessionExpiredDialogProps {
  open: boolean;
  /** "Đăng nhập lại". */
  signIn: StateActionTarget;
  /** Called on Escape. Omit to make the dialog non-dismissable. */
  onClose?: () => void;
}

export function SessionExpiredDialog({ open, signIn, onClose }: SessionExpiredDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const messageId = useId();
  const actionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    actionRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && onClose) {
      event.stopPropagation();
      onClose();
    } else if (event.key === "Tab") {
      // Only one focusable element: keep focus on it.
      event.preventDefault();
      actionRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <div aria-hidden="true" className="absolute inset-0 bg-ink opacity-45" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative flex w-[480px] max-w-full flex-col gap-2 rounded-eb-xl bg-surface p-6 shadow-[0_16px_40px_rgba(32,33,36,0.16)]"
      >
        <h2 id={titleId} className="text-xl leading-7 font-normal tracking-normal text-ink">
          {t("states.sessionExpired.title")}
        </h2>
        <p id={messageId} className="text-sm leading-5 text-ink-secondary">
          {t("states.sessionExpired.description")}
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <StateButton
            action={{ ...signIn, label: t("states.sessionExpired.signIn") }}
            variant="primary"
            size="md"
            buttonRef={(element) => {
              actionRef.current = element;
            }}
          />
        </div>
      </div>
    </div>
  );
}
