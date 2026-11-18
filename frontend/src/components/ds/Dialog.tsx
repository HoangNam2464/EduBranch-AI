import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ds/Button";
import { cx } from "@/components/ds/shared";

/**
 * Figma `Overlays/Dialog` (page 02, node 228:318) — Type Confirm | Destructive.
 *  - Panel: white, width 480 (custom dialogs on page 08 use 520/560/600), padding 24, gap 8,
 *    radius 18, shadow 0 16 40 rgba(32,33,36,.16)
 *  - Title Roboto Regular 20/28 #202124 · Message Regular 14/20 #696A70
 *  - Actions row: padding-top 16, gap 12, right-aligned; Secondary MD "cancel" +
 *    Primary MD (Confirm) or Danger MD (Destructive)
 *  - Scrim (page 08 frames 01.6, 02.3, 05.10, 10.4): #202124 at 45% over the whole viewport
 * Accessibility: role="dialog", aria-modal, labelled by the title, Escape closes,
 * Tab is trapped inside, focus returns to the opener on close.
 */
export type DialogType = "confirm" | "destructive";

export interface DialogProps {
  open: boolean;
  /** Called on Escape, scrim click and the cancel action. */
  onClose: () => void;
  title: ReactNode;
  /** Message under the title. */
  description?: ReactNode;
  /** Extra body content (forms etc.) rendered after the message. */
  children?: ReactNode;
  type?: DialogType;
  /** Label of the right-hand action. Omit together with `onConfirm` for a single-button dialog. */
  confirmLabel?: ReactNode;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  /** Label of the Secondary cancel action; omit to hide it. */
  cancelLabel?: ReactNode;
  /** Replaces the whole actions row. */
  actions?: ReactNode;
  /** Panel width in px (default 480). */
  width?: number;
  /** Element to focus on open (default: first focusable element in the panel). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close when the scrim is clicked (default true). */
  closeOnScrim?: boolean;
  className?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  type = "confirm",
  confirmLabel,
  onConfirm,
  confirmDisabled,
  cancelLabel,
  actions,
  width = 480,
  initialFocusRef,
  closeOnScrim = true,
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const target = initialFocusRef?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
    target?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  const actionRow =
    actions ??
    (cancelLabel !== undefined || confirmLabel !== undefined ? (
      <>
        {cancelLabel !== undefined && (
          <Button variant="secondary" size="md" onClick={onClose}>
            {cancelLabel}
          </Button>
        )}
        {confirmLabel !== undefined && (
          <Button variant={type === "destructive" ? "danger" : "primary"} size="md" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        )}
      </>
    ) : null);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div aria-hidden="true" className="fixed inset-0 bg-ink/45" onClick={closeOnScrim ? onClose : undefined} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        style={{ width }}
        className={cx("relative flex max-w-full flex-col gap-2 rounded-eb-xl bg-surface p-6 shadow-eb-dialog outline-none", className)}
      >
        <DialogContent titleId={titleId} descId={descId} title={title} description={description}>
          {children}
        </DialogContent>
        {actionRow && <div className="flex items-start justify-end gap-3 pt-4">{actionRow}</div>}
      </div>
    </div>,
    document.body,
  );
}

function DialogContent({
  titleId,
  descId,
  title,
  description,
  children,
}: {
  titleId?: string;
  descId?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <h2 id={titleId} className="text-[20px] leading-7 font-normal tracking-normal text-ink">
        {title}
      </h2>
      {description && (
        <p id={descId} className="text-[14px] leading-5 font-normal text-ink-secondary">
          {description}
        </p>
      )}
      {children}
    </>
  );
}

/**
 * Static panel of `Overlays/Dialog` without scrim/portal — for docs and galleries only.
 * Screens must use <Dialog>.
 */
export function DialogPanelPreview({
  title,
  description,
  actions,
  width = 480,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  width?: number;
}) {
  return (
    <div style={{ width }} className="flex flex-col gap-2 rounded-eb-xl bg-surface p-6 shadow-eb-dialog">
      <DialogContent title={title} description={description} />
      {actions && <div className="flex items-start justify-end gap-3 pt-4">{actions}</div>}
    </div>
  );
}
