/**
 * EduBranch AI — Shared UI Components
 *
 * Reusable presentational components adhering strictly to GLOBAL-DESIGN-SYSTEM.md.
 * Light-theme only, accessible, content-first academic design foundation.
 * No API calls here — all business logic stays in services/.
 */

import React, { useId } from "react";

// ============================================================================
// Spinner
// ============================================================================
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );
}

// ============================================================================
// Skeleton
// ============================================================================
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-100 ${className}`}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Button
// ============================================================================
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-eb-action-primary text-white hover:bg-eb-action-primary-hover active:bg-eb-action-primary-active focus-visible:ring-blue-500 disabled:bg-eb-action-primary-disabled disabled:opacity-80",
  secondary:
    "bg-eb-surface text-eb-text-primary border border-eb-border-default hover:bg-eb-surface-muted active:bg-gray-100 focus-visible:ring-gray-300 disabled:bg-eb-surface-muted disabled:text-eb-text-muted disabled:border-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-300 disabled:opacity-80",
  ghost:
    "bg-transparent text-eb-text-secondary hover:bg-eb-surface-muted active:bg-gray-200 focus-visible:ring-gray-300 disabled:text-eb-text-muted",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium h-8",
  md: "px-4 py-2 text-sm font-medium h-10",
  lg: "px-6 py-2.5 text-base font-medium h-12",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md
        transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${buttonStyles[variant]} ${buttonSizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ============================================================================
// Input
// ============================================================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id: customId,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = customId || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-eb-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        disabled={disabled}
        className={`
          w-full rounded-md border bg-eb-surface px-3 py-2 text-sm text-eb-text-primary
          placeholder:text-eb-text-muted transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-eb-surface-muted disabled:text-eb-text-muted
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-eb-border-default focus:border-eb-action-primary focus:ring-eb-action-primary/20"
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-eb-semantic-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-eb-text-secondary">{helperText}</p>}
    </div>
  );
}

// ============================================================================
// Textarea
// ============================================================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  id: customId,
  className = "",
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = customId || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-eb-text-primary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        className={`
          w-full rounded-md border bg-eb-surface px-3 py-2 text-sm text-eb-text-primary
          placeholder:text-eb-text-muted transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-eb-surface-muted disabled:text-eb-text-muted
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-eb-border-default focus:border-eb-action-primary focus:ring-eb-action-primary/20"
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-eb-semantic-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-eb-text-secondary">{helperText}</p>}
    </div>
  );
}

// ============================================================================
// Card
// ============================================================================
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className = "", padding = true, hoverable = false }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-eb-border-default bg-eb-surface
        ${hoverable ? "transition-shadow duration-150 hover:shadow-sm" : "shadow-none"}
        ${padding ? "p-6" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Badge
// ============================================================================
export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-eb-surface-muted text-eb-text-secondary",
  success: "bg-eb-status-published-bg text-eb-status-published-text",
  warning: "bg-eb-status-approved-bg text-eb-status-approved-text",
  error:   "bg-red-50 text-red-800",
  info:    "bg-eb-status-reviewed-bg text-eb-status-reviewed-text",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ============================================================================
// Case Status Badge (Canonical §2.5)
// ============================================================================
export type CaseStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

const caseStatusConfig: Record<CaseStatus, { label: string; bg: string; text: string }> = {
  DRAFT:     { label: "Draft",     bg: "bg-eb-status-draft-bg",     text: "text-eb-status-draft-text" },
  REVIEWED:  { label: "Reviewed",  bg: "bg-eb-status-reviewed-bg",  text: "text-eb-status-reviewed-text" },
  APPROVED:  { label: "Approved",  bg: "bg-eb-status-approved-bg",  text: "text-eb-status-approved-text" },
  PUBLISHED: { label: "Published", bg: "bg-eb-status-published-bg", text: "text-eb-status-published-text" },
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const config = caseStatusConfig[status] ?? {
    label: status,
    bg: "bg-[#F3F4F6]",
    text: "text-[#4B5563]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// Learning Mode Badge (Canonical §2.6)
// ============================================================================
export type LearningMode = "BRANCHING_STUDY" | "REVIEW_STUDY";

const learningModeConfig: Record<LearningMode, { label: string; bg: string; text: string }> = {
  BRANCHING_STUDY: { label: "Branching Study", bg: "bg-eb-mode-branching-bg", text: "text-eb-mode-branching-text" },
  REVIEW_STUDY:    { label: "Review Study",    bg: "bg-eb-mode-review-bg",    text: "text-eb-mode-review-text" },
};

export function LearningModeBadge({ mode }: { mode: LearningMode }) {
  const config = learningModeConfig[mode] ?? {
    label: mode,
    bg: "bg-eb-surface-muted",
    text: "text-eb-text-secondary",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// AI Origin Tag (Canonical §2.7 — Muted tag, never decorative glow/sparkle)
// ============================================================================
export function AiOriginTag({ label = "AI-assisted" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-eb-ai-bg px-2 py-0.5 text-xs font-medium text-eb-ai-text">
      <svg
        className="h-3 w-3 text-eb-text-secondary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      {label}
    </span>
  );
}

// ============================================================================
// Alert
// ============================================================================
export type AlertVariant = "info" | "success" | "warning" | "error";

const alertStyles: Record<AlertVariant, string> = {
  info:    "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error:   "border-red-200 bg-red-50 text-red-900",
};

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
    <div className={`rounded-md border p-4 text-sm ${alertStyles[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
}

// ============================================================================
// Empty State (Canonical §5.11 — Clean SVG icon, no emoji clutter)
// ============================================================================
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="mb-3 h-10 w-10 text-eb-text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      <h3 className="text-sm font-semibold text-eb-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-eb-text-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================================
// Error State (Canonical §5.11 — With retry action)
// ============================================================================
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" role="alert">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-eb-text-primary">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-eb-text-secondary">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Page Header
// ============================================================================
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-eb-text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-eb-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ============================================================================
// Modal
// ============================================================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-eb-border-default bg-eb-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-eb-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-eb-text-muted hover:text-eb-text-secondary focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
