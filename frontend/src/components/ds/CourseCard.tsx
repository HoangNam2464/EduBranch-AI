import type { ElementType } from "react";
import { Link } from "react-router-dom";
import { FileText, type LucideIcon } from "lucide-react";
import { StatusPill, type StatusPillTone } from "@/components/ds/StatusPill";
import { InstructorLine, ThumbnailIcon } from "@/components/ds/courseParts";
import { THUMBNAIL_TONES, type CourseThumbnailTone } from "@/components/ds/courseTones";
import { cx } from "@/components/ds/shared";

/**
 * Page-08 "Course Card" (02.1–02.3, 01.6, 10.5) — row card of the course list.
 *  - Card 732x114: white, radius 14, padding 16; selected = 1.5px inside stroke #2A4E7F (border/selected).
 *  - "Course overview" row gap 20:
 *      Media 137x82: thumbnail radius 8 (tone fill) with a 52x52 Lucide icon (stroke per instance),
 *      status pill (StatusPill sm) overlaid at 6,6.
 *      Information column (padding-top 8, gap 18):
 *        title row gap 8: title Regular 16/24 #202124 (fills) + code pill (StatusPill sm info);
 *        bottom row space-between: Instructor (InstructorLine subtle) · metadata row gap 12, Regular 12/16
 *        #696A70: documents (12px file icon #909198 stroke 1.7, gap 6, min 128) · cases (min 80) ·
 *        status note (min 124, right-aligned; error #D11F1F / warning #9A5700 / info #00699E).
 * The card is selectable: `onSelect` (button) or `to` (link) is attached to the title and its hit area
 * is stretched over the whole card. Figma shows no per-card actions on any instance.
 */
export type CourseNoteTone = "error" | "warning" | "info" | "neutral";

const NOTE_TONES: Record<CourseNoteTone, string> = {
  error: "text-error-text",
  warning: "text-warning-text",
  info: "text-note-info",
  neutral: "text-ink-secondary",
};

export interface CourseCardProps {
  title: string;
  /** Course code shown in the pill next to the title, e.g. "CS402". */
  code: string;
  statusLabel: string;
  statusTone?: StatusPillTone;
  instructorName: string;
  instructorInitials: string;
  thumbnailIcon: LucideIcon;
  /** Absolute stroke measured on the Figma thumbnail icon (1.7 shield-check, 1.5 git-branch, 2 database …). */
  thumbnailIconStrokeWidth?: number;
  thumbnailTone?: CourseThumbnailTone;
  /** e.g. "2/5 tài liệu sẵn sàng". */
  documentsLabel: string;
  /** e.g. "6 case". */
  casesLabel: string;
  casesTone?: CourseNoteTone;
  /** Right-aligned status note, e.g. "1 tệp lỗi lập chỉ mục". */
  note?: string;
  noteTone?: CourseNoteTone;
  selected?: boolean;
  onSelect?: () => void;
  to?: string;
  /** Heading element for the title (default h3). */
  titleAs?: ElementType;
  className?: string;
}

export function CourseCard({
  title,
  code,
  statusLabel,
  statusTone = "success",
  instructorName,
  instructorInitials,
  thumbnailIcon,
  thumbnailIconStrokeWidth = 1.7,
  thumbnailTone = "subtle",
  documentsLabel,
  casesLabel,
  casesTone = "neutral",
  note,
  noteTone = "error",
  selected = false,
  onSelect,
  to,
  titleAs: Title = "h3",
  className,
}: CourseCardProps) {
  const stretch = "text-left after:absolute after:inset-0 after:rounded-[14px] focus-visible:outline-none";
  let titleNode = <>{title}</>;
  if (to !== undefined) {
    titleNode = (
      <Link to={to} className={cx(stretch, "cursor-pointer")} aria-current={selected ? "true" : undefined}>
        {title}
      </Link>
    );
  } else if (onSelect) {
    titleNode = (
      <button type="button" onClick={onSelect} aria-pressed={selected} className={cx(stretch, "cursor-pointer")}>
        {title}
      </button>
    );
  }

  return (
    <article
      className={cx(
        "relative flex rounded-[14px] bg-surface p-4",
        selected
          ? "shadow-[inset_0_0_0_1.5px_var(--color-primary)]"
          : "shadow-eb-card hover:shadow-eb-hover transition-shadow",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 gap-5">
        <div className={cx("relative flex h-[82px] w-[137px] shrink-0 items-center justify-center rounded-eb-md", THUMBNAIL_TONES[thumbnailTone].box)}>
          <ThumbnailIcon icon={thumbnailIcon} size={52} strokeWidth={thumbnailIconStrokeWidth} tone={thumbnailTone} />
          <StatusPill tone={statusTone} className="absolute top-1.5 left-1.5">
            {statusLabel}
          </StatusPill>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[18px] pt-2">
          <div className="flex items-start gap-2">
            <Title className="min-w-0 flex-1 text-[16px] leading-6 font-normal tracking-normal text-ink">{titleNode}</Title>
            <StatusPill tone="info">{code}</StatusPill>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <InstructorLine name={instructorName} initials={instructorInitials} />
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[12px] leading-4">
              <span className="flex items-center gap-1.5 text-ink-secondary min-[1440px]:min-w-32">
                <FileText aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={1.7} className="shrink-0 text-ink-muted" />
                {documentsLabel}
              </span>
              <span className={cx("min-[1440px]:min-w-20", NOTE_TONES[casesTone])}>{casesLabel}</span>
              <span className={cx("text-right min-[1440px]:min-w-[124px]", NOTE_TONES[noteTone])}>{note}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
