import { Fragment, type ElementType, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { StatusPill, type StatusPillTone } from "@/components/ds/StatusPill";
import { InstructorLine, ThumbnailIcon } from "@/components/ds/courseParts";
import { THUMBNAIL_TONES, type CourseThumbnailTone } from "@/components/ds/courseTones";
import { cx } from "@/components/ds/shared";

/**
 * Page-08 "Course overview" — stacked course summary (column gap 16, no own fill: the caller's
 * card or panel provides fill and padding). Two layouts occur:
 *  - panel   (02.1 "Course Details", 384 wide): cover h200 radius 8, icon 126; instructor avatar subtle;
 *            statistics band #DFEDF9 radius 14, padding 16, gap 16, stats centred (label 14/20 #696A70,
 *            value 14/20 #202124, gap 8).
 *  - sidebar (02.4–02.6 "Course overview", 339 wide): cover h204 radius 13, icon 72; avatar accent;
 *            statistics band radius 13, stats left-aligned, separated by a 1x48 #F3F6FC divider.
 *  - Cover: tone fill + Lucide icon, code pill (StatusPill sm info) at 6,6.
 *  - Title Regular 16/24 #202124 · Instructor · "Status and enrollment" pills (gap 8).
 * Extra sections (about, links, actions) go in `children`, inside the same 16px stack.
 */
export type CourseOverviewVariant = "panel" | "sidebar";

export interface CourseOverviewStat {
  label: string;
  value: ReactNode;
}

export interface CourseOverviewStatus {
  label: string;
  tone?: StatusPillTone;
}

export interface CourseOverviewProps {
  variant?: CourseOverviewVariant;
  title: string;
  code: string;
  coverIcon: LucideIcon;
  coverIconStrokeWidth?: number;
  coverTone?: CourseThumbnailTone;
  instructorName: string;
  instructorInitials: string;
  statuses: CourseOverviewStatus[];
  stats: CourseOverviewStat[];
  /** Heading element for the title (default h2). */
  titleAs?: ElementType;
  children?: ReactNode;
  className?: string;
}

const LAYOUT: Record<CourseOverviewVariant, { cover: string; icon: number; band: string }> = {
  panel: { cover: "h-[200px] rounded-eb-md", icon: 126, band: "rounded-[14px]" },
  sidebar: { cover: "h-[204px] rounded-[13px]", icon: 72, band: "rounded-[13px]" },
};

export function CourseOverview({
  variant = "panel",
  title,
  code,
  coverIcon,
  coverIconStrokeWidth = 1.7,
  coverTone = "primary",
  instructorName,
  instructorInitials,
  statuses,
  stats,
  titleAs: Title = "h2",
  children,
  className,
}: CourseOverviewProps) {
  const layout = LAYOUT[variant];
  return (
    <div className={cx("flex min-w-0 flex-col gap-4", className)}>
      <div className={cx("relative flex items-center justify-center", layout.cover, THUMBNAIL_TONES[coverTone].box)}>
        <ThumbnailIcon icon={coverIcon} size={layout.icon} strokeWidth={coverIconStrokeWidth} tone={coverTone} />
        <StatusPill tone="info" className="absolute top-1.5 left-1.5">
          {code}
        </StatusPill>
      </div>
      <Title className="text-[16px] leading-6 font-normal tracking-normal text-ink">{title}</Title>
      <InstructorLine name={instructorName} initials={instructorInitials} avatarTone={variant === "sidebar" ? "accent" : "subtle"} />
      {/* "Status and enrollment": 22 tall on 02.1, fixed 24 on 02.4 */}
      <div className={cx("flex items-start gap-2", variant === "sidebar" && "h-6")}>
        {statuses.map((s) => (
          <StatusPill key={s.label} tone={s.tone ?? "success"}>
            {s.label}
          </StatusPill>
        ))}
      </div>
      {stats.length > 0 && (
        <div className={cx("flex gap-4 bg-selected p-4 text-[14px] leading-5", layout.band)}>
          {stats.map((stat, index) => (
            <Fragment key={stat.label}>
              {variant === "sidebar" && index > 0 && <span aria-hidden="true" className="h-12 w-px shrink-0 bg-canvas" />}
              <div className={cx("flex min-w-0 flex-1 flex-col gap-2", variant === "panel" ? "items-center text-center" : "items-start")}>
                <p className="text-ink-secondary">{stat.label}</p>
                <p className="text-ink">{stat.value}</p>
              </div>
            </Fragment>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
