/**
 * EduBranch AI — Shared UI Components
 *
 * Reusable presentational components for the design system.
 * No API calls here — all business logic stays in services/.
 */

import React from "react";

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
// Button
// ============================================================================
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary:   "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  ghost:     "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
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
// Card
// ============================================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// Badge
// ============================================================================
type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error:   "bg-red-100 text-red-800",
  info:    "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

// ============================================================================
// Alert
// ============================================================================
type AlertVariant = "info" | "success" | "warning" | "error";

const alertStyles: Record<AlertVariant, string> = {
  info:    "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  error:   "border-red-200 bg-red-50 text-red-800",
};

export function Alert({ variant = "info", children, className = "" }: { variant?: AlertVariant; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border p-4 text-sm ${alertStyles[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================
export function EmptyState({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-4xl text-gray-300">📭</div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================================
// Page Header
// ============================================================================
export function PageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ============================================================================
// Status Badge (for case lifecycle)
// ============================================================================
type CaseStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

const caseStatusStyles: Record<CaseStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT:     { label: "Draft",     variant: "default" },
  REVIEWED:  { label: "Reviewed",  variant: "info"    },
  APPROVED:  { label: "Approved",  variant: "success" },
  PUBLISHED: { label: "Published", variant: "success" },
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const { label, variant } = caseStatusStyles[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}

// ============================================================================
// Modal
// ============================================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
