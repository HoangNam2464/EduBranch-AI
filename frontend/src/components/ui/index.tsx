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
// Skeleton Block (loading placeholder)
// ============================================================================
export function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-blue-50 ${className}`}
      aria-hidden="true"
    />
  );
}

// ── 01.1 Loading Skeleton Page ───────────────────────────────────────────────
export function LoadingSkeletonPage() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="h-7 w-48" />
        <SkeletonBlock className="h-9 w-36 rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBlock className="h-9 w-56 rounded-lg" />
        <SkeletonBlock className="h-9 w-36 rounded-lg" />
        <SkeletonBlock className="h-9 w-36 rounded-lg" />
      </div>

      {/* Content rows skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
            <SkeletonBlock className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-56" />
              <SkeletonBlock className="h-3 w-32" />
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Loading label */}
      <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        Đang tải dữ liệu...
      </div>
    </div>
  );
}

// ── 01.2 Empty State Page ────────────────────────────────────────────────────
export function EmptyStatePage({
  title = "Chưa có khóa học nào",
  description = "Tạo khóa học đầu tiên để bắt đầu xây dựng case tình huống cho sinh viên.",
  actionLabel = "Tạo khóa học mới",
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon circle */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── 01.3 Error State Page ────────────────────────────────────────────────────
export function ErrorStatePage({
  title = "Không tải được danh sách Khóa học",
  description = "Kiểm tra kết nối mạng của bạn. Nếu lỗi vẫn tiếp diễn, hãy thử lại hoặc liên hệ hỗ trợ.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Orange alert icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Thử lại
        </button>
      )}
    </div>
  );
}

// ── 01.4 Forbidden Page (403) ────────────────────────────────────────────────
export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Lock icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p className="text-6xl font-bold text-gray-900 mb-3">403</p>
      <h3 className="text-base font-semibold text-gray-900">
        Tình huống không khả dụng hoặc bạn không có quyền truy cập
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        Tình huống đó có thể chưa được xuất bản, nội dung đó trống, bạn sử dụng tài khoản không có quyền, hoặc liên kết đó đã hết hạn.
      </p>
      <a
        href="/student"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Về trang chủ
      </a>
    </div>
  );
}

// ── 01.5 Not Found Page (404) ────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Broken link icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
        </svg>
      </div>
      <p className="text-6xl font-bold text-gray-900 mb-3">404</p>
      <h3 className="text-base font-semibold text-gray-900">Không tìm thấy trang</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        Đường dẫn có thể đã có hay nằm ngoài phạm vi của hệ thống, hoặc đường dẫn đó thuộc quyền riêng tư.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Trở về
      </button>
    </div>
  );
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

export { EduBranchLogo } from "./EduBranchLogo";
