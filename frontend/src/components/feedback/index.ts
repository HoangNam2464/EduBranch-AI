/**
 * Shared feedback states — Figma page EduBranch AI – Screens, frames 01.1–01.8 (Jira FE-025).
 * Strings live under the `states` namespace key in `locales/vi.json` and `locales/en.json`.
 */
export { StateButton, SupportEmailLink } from "@/components/feedback/StateButton";
export type {
  StateAction,
  StateActionTarget,
  StateButtonProps,
  StateButtonSize,
  StateButtonVariant,
} from "@/components/feedback/StateButton";
export { StateCard, StatePanel } from "@/components/feedback/StateCard";
export type { StateCardProps, StatePanelProps, StateTone } from "@/components/feedback/StateCard";
export { EmptyState } from "@/components/feedback/EmptyState";
export type { EmptyStateProps } from "@/components/feedback/EmptyState";
export { ErrorState } from "@/components/feedback/ErrorState";
export type { ErrorStateProps } from "@/components/feedback/ErrorState";
export { NoResultsState } from "@/components/feedback/NoResultsState";
export type { NoResultsStateProps } from "@/components/feedback/NoResultsState";
export { StatusPage } from "@/components/feedback/StatusPage";
export type { StatusPageProps, StatusTone } from "@/components/feedback/StatusPage";
export { ForbiddenStatusPage } from "@/components/feedback/ForbiddenStatusPage";
export type { ForbiddenStatusPageProps } from "@/components/feedback/ForbiddenStatusPage";
export { NotFoundStatusPage } from "@/components/feedback/NotFoundStatusPage";
export type { NotFoundStatusPageProps } from "@/components/feedback/NotFoundStatusPage";
export { ServerErrorStatusPage } from "@/components/feedback/ServerErrorStatusPage";
export type { ServerErrorStatusPageProps } from "@/components/feedback/ServerErrorStatusPage";
export { SessionExpiredDialog } from "@/components/feedback/SessionExpiredDialog";
export type { SessionExpiredDialogProps } from "@/components/feedback/SessionExpiredDialog";
export {
  CourseCardSkeleton,
  CourseListSkeleton,
  SkeletonBadge,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonLine,
  SkeletonRegion,
} from "@/components/feedback/Skeleton";
export type {
  CourseListSkeletonProps,
  SkeletonBlockProps,
  SkeletonCircleProps,
  SkeletonLineProps,
  SkeletonRegionProps,
} from "@/components/feedback/Skeleton";
export { SubmissionReviewList } from "@/components/feedback/SubmissionReviewList";
export type { SubmissionReviewListProps } from "@/components/feedback/SubmissionReviewList";
export { SUPPORT_EMAIL, formatClockTime, formatDateTime, isValidDate } from "@/components/feedback/stateFormat";
