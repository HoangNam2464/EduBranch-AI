import type { ReactNode } from "react";
import { CircleCheck, CircleX, Info, X, type LucideIcon } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Figma `Feedback/Toast` (page EduBranch AI – Design System, node 228:178) — Type Success | Error | Info.
 *  - Card: white, width 360 (page EduBranch AI – Screens frame 03.3 uses 480), padding 16, gap 12, radius 12,
 *    shadow 0 8 24 rgba(42,78,127,.16); items top-aligned
 *  - Icon box 32x32 radius 8 with a 16px icon:
 *      Success #E1F7E9 + circle-check stroke 0.85 #00B343
 *      Error   #FFE5E5 + circle-x stroke 1.143 #FF3535
 *      Info    #DFEDF9 + info stroke 1.295 #2A4E7F
 *  - Content column gap 2: Title Roboto Medium 14/20 #202124, Message Regular 12/16 #696A70
 *  - Close: Icon/x 16px stroke 1.333 #909198
 * Position: bottom-right 24px (PO decision 2026-11-21, spec 006; Figma frame 03.3 still shows top 96 / right 32): see <ToastRegion>.
 */
export type ToastType = "success" | "error" | "info";

const TYPES: Record<ToastType, { box: string; icon: LucideIcon; stroke: number; color: string }> = {
  success: { box: "bg-success-bg", icon: CircleCheck, stroke: 0.85, color: "text-success" },
  error: { box: "bg-error-bg", icon: CircleX, stroke: 1.143, color: "text-error" },
  info: { box: "bg-selected", icon: Info, stroke: 1.295, color: "text-link" },
};

export interface ToastProps {
  type?: ToastType;
  title: ReactNode;
  message?: ReactNode;
  /** Shows the close button when provided. */
  onClose?: () => void;
  /** Accessible name of the close button (e.g. "Đóng thông báo"). */
  closeLabel?: string;
  /** Card width in px (default 360). */
  width?: number;
  className?: string;
}

export function Toast({ type = "info", title, message, onClose, closeLabel, width = 360, className }: ToastProps) {
  const t = TYPES[type];
  const Icon = t.icon;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      style={{ width }}
      className={cx("flex max-w-full items-start gap-3 rounded-eb-lg bg-surface p-4 shadow-eb-toast", className)}
    >
      <span className={cx("flex size-8 shrink-0 items-center justify-center rounded-eb-md", t.box)}>
        <Icon aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={t.stroke} className={t.color} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[14px] leading-5 font-medium text-ink">{title}</p>
        {message && <p className="text-[12px] leading-4 font-normal text-ink-secondary">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cx("flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-eb-sm text-ink-muted hover:text-ink-secondary", FOCUS_RING)}
        >
          <X aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.333} />
        </button>
      )}
    </div>
  );
}

/**
 * Fixed stack for toasts, bottom-right 24px from the edges, newest at the bottom, gap 12
 * (PO decision 2026-11-21, spec 006 AC-T1: the former top-right position covered the header
 * and the content being read). Below 640px the stack spans the width, 12px from the edges.
 */
export function ToastRegion({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section aria-label={label} className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col items-stretch gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end [&>*]:pointer-events-auto">
      {children}
    </section>
  );
}
