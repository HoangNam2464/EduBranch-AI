/**
 * EduBranch design-system components — React twins of the Figma component sets
 * on page "02 · Eduva – Design System" (and the EB/* public-site sets on page 05)
 * exactly as they are instanced on page "08 · EduBranch – Bản hoàn chỉnh".
 */
export { cx, FOCUS_RING } from "@/components/ds/shared";

export { Button, ButtonContent } from "@/components/ds/Button";
export { buttonClassName, publicButtonClassName } from "@/components/ds/buttonStyles";
export type { ButtonProps, ButtonVariant, ButtonSize } from "@/components/ds/Button";
export { PublicButton } from "@/components/ds/PublicButton";
export type { PublicButtonProps, PublicButtonVariant, PublicButtonSize } from "@/components/ds/PublicButton";

export { Avatar } from "@/components/ds/Avatar";
export type { AvatarProps, AvatarSize } from "@/components/ds/Avatar";

export { BadgeBase } from "@/components/ds/BadgeBase";
export { CaseStatusBadge } from "@/components/ds/CaseStatusBadge";
export type { CaseStatus, CaseStatusBadgeProps } from "@/components/ds/CaseStatusBadge";
export { LearningModeBadge } from "@/components/ds/LearningModeBadge";
export type { LearningMode, LearningModeBadgeProps } from "@/components/ds/LearningModeBadge";
export { AiOriginBadge } from "@/components/ds/AiOriginBadge";
export type { AiOrigin, AiOriginBadgeProps } from "@/components/ds/AiOriginBadge";
export { ProcessingBadge } from "@/components/ds/ProcessingBadge";
export type { ProcessingStatus, ProcessingBadgeProps } from "@/components/ds/ProcessingBadge";
export { SubmissionBadge } from "@/components/ds/SubmissionBadge";
export type { SubmissionStatus, SubmissionBadgeProps } from "@/components/ds/SubmissionBadge";

export { SearchField } from "@/components/ds/SearchField";
export type { SearchFieldProps } from "@/components/ds/SearchField";
export { Field } from "@/components/ds/Field";
export type { FieldProps, InputFieldProps, TextareaFieldProps } from "@/components/ds/Field";

export { Dialog, DialogPanelPreview } from "@/components/ds/Dialog";
export type { DialogProps, DialogType } from "@/components/ds/Dialog";
export { Toast, ToastRegion } from "@/components/ds/Toast";
export type { ToastProps, ToastType } from "@/components/ds/Toast";

export { CaseLifecycleStepper } from "@/components/ds/CaseLifecycleStepper";
export type { CaseLifecycleStatus, CaseLifecycleStepperProps } from "@/components/ds/CaseLifecycleStepper";
export { OptionCard } from "@/components/ds/OptionCard";
export type { OptionCardProps } from "@/components/ds/OptionCard";

export { SocialSignIn } from "@/components/ds/SocialSignIn";
export type { SocialSignInProps } from "@/components/ds/SocialSignIn";
export { PublicNav, PublicBrand } from "@/components/ds/PublicNav";
export type { PublicNavProps, PublicNavLink, PublicNavAction } from "@/components/ds/PublicNav";
export { PublicFooter } from "@/components/ds/PublicFooter";
export type { PublicFooterProps, PublicFooterColumn, PublicFooterLink } from "@/components/ds/PublicFooter";

// Shared page patterns (hand-built on page 08, reused across screens).
export { StatusPill } from "@/components/ds/StatusPill";
export type { StatusPillProps, StatusPillTone, StatusPillSize } from "@/components/ds/StatusPill";
export { FilterControl } from "@/components/ds/FilterControl";
export type { FilterControlProps, FilterControlVariant, FilterOption } from "@/components/ds/FilterControl";
export { StatusTabs } from "@/components/ds/StatusTabs";
export type { StatusTabsProps, StatusTabItem, StatusTabTone } from "@/components/ds/StatusTabs";
export { Pagination } from "@/components/ds/Pagination";
export type { PaginationProps, PaginationLabels } from "@/components/ds/Pagination";
export { ResultCount } from "@/components/ds/ResultCount";
export type { ResultCountProps } from "@/components/ds/ResultCount";
export { MetricCard } from "@/components/ds/MetricCard";
export type { MetricCardProps, MetricCardVariant, MetricDelta } from "@/components/ds/MetricCard";
export { CourseCard } from "@/components/ds/CourseCard";
export type { CourseCardProps, CourseNoteTone } from "@/components/ds/CourseCard";
export { CourseOverview } from "@/components/ds/CourseOverview";
export type { CourseOverviewProps, CourseOverviewVariant, CourseOverviewStat, CourseOverviewStatus } from "@/components/ds/CourseOverview";
export type { CourseThumbnailTone } from "@/components/ds/courseTones";
export { Breadcrumb } from "@/components/ds/Breadcrumb";
export type { BreadcrumbProps, BreadcrumbItem } from "@/components/ds/Breadcrumb";
export { PageContext } from "@/components/ds/PageContext";
export type { PageContextProps } from "@/components/ds/PageContext";
export { SectionHeading } from "@/components/ds/SectionHeading";
export type { SectionHeadingProps } from "@/components/ds/SectionHeading";
export { BackIconButton } from "@/components/ds/BackIconButton";
export type { BackIconButtonProps } from "@/components/ds/BackIconButton";
export { LanguageSwitcher } from "@/components/ds/LanguageSwitcher";
export { ThemeToggle } from "@/components/ds/ThemeToggle";

