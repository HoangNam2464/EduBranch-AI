/**
 * EduBranch AI — Shared UI Components
 *
 * Presentational components aligned with the Figma Design System page "01 · Design System"
 * (file 6CtSgJPKo4jCIbB7WwCaWw). Token values are PROVISIONAL until the PO approves the token
 * gate (C1, figma/TOKEN-REPORT-C1.md); Tailwind classes map 1:1 to the Figma primitives
 * (e.g. action/primary = blue-600, text/subtle = gray-500, border/default = gray-200).
 * No API calls here — business logic stays in services/.
 */

import React, { useEffect, useId } from "react";
import { IconAlert, IconX, IconLock, IconCompass } from "./icons";

export * from "./icons";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

// ============================================================================
// Spinner
// ============================================================================
export function Spinner({ size = "md", label = "Đang tải" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <span
      className={`${sizes[size]} inline-block animate-spin rounded-full border-2 border-current border-t-transparent`}
      role="status"
      aria-label={label}
    />
  );
}

// ============================================================================
// Button
// ============================================================================
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300",
  secondary: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:text-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  link: "bg-transparent px-0 text-blue-600 hover:text-blue-700 hover:underline",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  leftIcon,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed cursor-pointer",
        buttonStyles[variant],
        variant === "link" ? "h-auto text-sm" : buttonSizes[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : leftIcon}
      {children}
    </button>
  );
}

// ============================================================================
// Card
// ============================================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div className={cx("rounded-xl border border-gray-200 bg-white", padding && "p-6", className)}>{children}</div>
  );
}

// ============================================================================
// Badge (pill) — `dot` adds the status dot used by the Figma status chips
// ============================================================================
type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "teal"
  | "pink";

const badgeStyles: Record<BadgeVariant, { pill: string; dot: string }> = {
  default: { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  neutral: { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  info: { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  success: { pill: "bg-green-50 text-green-800", dot: "bg-green-600" },
  warning: { pill: "bg-amber-50 text-amber-800", dot: "bg-amber-600" },
  error: { pill: "bg-red-50 text-red-700", dot: "bg-red-600" },
  teal: { pill: "bg-teal-50 text-teal-700", dot: "bg-teal-700" },
  pink: { pill: "bg-pink-50 text-pink-700", dot: "bg-pink-700" },
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}) {
  const s = badgeStyles[variant];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", s.pill, className)}>
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}

// ============================================================================
// Alert
// ============================================================================
type AlertVariant = "info" | "success" | "warning" | "error";

const alertStyles: Record<AlertVariant, string> = {
  info: "border-blue-200 bg-blue-50",
  success: "border-green-200 bg-green-50",
  warning: "border-amber-200 bg-amber-50",
  error: "border-red-200 bg-red-50",
};

/** Body text stays text/primary-secondary for AA contrast (TOKEN-REPORT-C1 §3.2). */
export function Alert({
  variant = "info",
  children,
  className = "",
}: {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("rounded-lg border p-3 text-sm text-gray-800", alertStyles[variant], className)} role={variant === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

// ============================================================================
// Empty / Error / Forbidden states (Figma 01.2–01.5)
// ============================================================================
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        {icon ?? <IconCompass size={22} />}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Không tải được dữ liệu",
  description = "Đã có lỗi khi kết nối tới máy chủ. Vui lòng thử lại.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <IconAlert size={22} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      )}
    </div>
  );
}

export function ForbiddenState({ description }: { description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        <IconLock size={22} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">Bạn không có quyền truy cập</h3>
      <p className="mt-1 max-w-md text-sm text-gray-500">
        {description ?? "Nội dung này không thuộc phạm vi tài khoản của bạn hoặc chưa được xuất bản."}
      </p>
    </div>
  );
}

/** Skeleton block for loading states (Figma 01.1). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-md bg-gray-200/80", className)} aria-hidden="true" />;
}

// ============================================================================
// Page header & breadcrumb
// ============================================================================
export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string; onClick?: () => void }> }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {it.onClick ? (
            <button type="button" onClick={it.onClick} className="cursor-pointer hover:text-gray-900 hover:underline">
              {it.label}
            </button>
          ) : (
            <span className={i === items.length - 1 ? "text-gray-700" : ""}>{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb}
        <h1 className="text-2xl font-semibold leading-8 text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}

// ============================================================================
// Case lifecycle status & learning mode (Figma status/* and mode/* tokens)
// ============================================================================
type CaseStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  DRAFT: "Bản nháp",
  REVIEWED: "Đã rà soát",
  APPROVED: "Đã phê duyệt",
  PUBLISHED: "Đã xuất bản",
};

const caseStatusVariant: Record<CaseStatus, BadgeVariant> = {
  DRAFT: "neutral",
  REVIEWED: "info",
  APPROVED: "warning",
  PUBLISHED: "success",
};

export function CaseStatusBadge({ status }: { status: CaseStatus | string }) {
  const s = status as CaseStatus;
  return (
    <Badge variant={caseStatusVariant[s] ?? "default"} dot>
      {CASE_STATUS_LABEL[s] ?? status}
    </Badge>
  );
}

export function ModeBadge({ mode }: { mode?: string | null }) {
  if (mode === "REVIEW_STUDY") return <Badge variant="pink">Review Study</Badge>;
  return <Badge variant="teal">Branching Study</Badge>;
}

// ============================================================================
// Form fields
// ============================================================================
export function Field({
  label,
  required,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-700">{error}</p>
      ) : (
        hint && <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

/** Input border uses gray-400 (not border/strong #D1D5DB) for 3:1 boundary contrast — see TOKEN-REPORT-C1 §3.3. */
const inputBase =
  "w-full rounded-md border border-gray-400 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 " +
  "focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-gray-50 disabled:text-gray-500";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={cx(inputBase, "h-10", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", ...props }, ref) {
    return <textarea ref={ref} className={cx(inputBase, "py-2 leading-6", className)} {...props} />;
  },
);

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(inputBase, "h-10 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

// ============================================================================
// Tabs (underline tabs, Figma 02.4)
// ============================================================================
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" className="mb-6 flex gap-6 border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "-mb-px cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors",
            active === t.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Modal & confirm dialog (Figma 02.2/02.3/02.6/03.7/05.10, Elevation/2 Modal)
// ============================================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const titleId = useId();
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const widths = { sm: "max-w-md", md: "max-w-[560px]", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx("relative z-10 w-full rounded-xl bg-white shadow-[0_20px_40px_-12px_rgba(17,24,39,0.25)]", widths[size])}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Đóng"
          >
            <IconX size={18} />
          </button>
        </div>
        {children && <div className="px-6 pt-4">{children}</div>}
        <div className="flex justify-end gap-3 px-6 pb-5 pt-5">{footer}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  tone = "danger",
  isLoading,
  onConfirm,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant={tone} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

// ============================================================================
// Helpers
// ============================================================================
export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return withTime
    ? d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export { cx };
