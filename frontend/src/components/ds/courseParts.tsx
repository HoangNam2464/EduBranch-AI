import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ds/shared";
import { THUMBNAIL_TONES, type CourseThumbnailTone } from "@/components/ds/courseTones";

/** Pieces shared by CourseCard and CourseOverview (page EduBranch AI – Screens, 02.x). Internal to the DS. */

export function ThumbnailIcon({ icon: Icon, size, strokeWidth, tone }: { icon: LucideIcon; size: number; strokeWidth: number; tone: CourseThumbnailTone }) {
  return <Icon aria-hidden="true" size={size} absoluteStrokeWidth strokeWidth={strokeWidth} className={cx("shrink-0", THUMBNAIL_TONES[tone].icon)} />;
}

/**
 * "Instructor" row: 24x24 avatar + name Regular 14/20 #696A70, gap 8.
 *  - subtle (02.1 card + detail panel): #DFEDF9 radius 7, initials Regular 9/16 #2A4E7F.
 *  - accent (02.4 course sidebar):      #00A5F5 radius 6, initials SemiBold 10/12 white.
 */
export function InstructorLine({ name, initials, avatarTone = "subtle" }: { name: string; initials: string; avatarTone?: "subtle" | "accent" }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden="true"
        className={cx(
          "inline-flex size-6 shrink-0 select-none items-center justify-center",
          avatarTone === "accent"
            ? "rounded-eb-sm bg-accent text-[10px] leading-3 font-semibold text-ink-inverse"
            : "rounded-[7px] bg-selected text-[9px] leading-4 font-normal text-link",
        )}
      >
        {initials}
      </span>
      <span className="truncate text-[14px] leading-5 text-ink-secondary" title={name}>
        {name}
      </span>
    </span>
  );
}
