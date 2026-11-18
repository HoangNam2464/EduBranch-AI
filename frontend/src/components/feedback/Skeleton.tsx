import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";

/**
 * Skeleton primitives of frame 01.1. Figma skeleton bars are fill #DFEDF9 with
 * a fully rounded radius (12px bar → radius 6, 9.6px bar → radius 4.8).
 * Placeholder blocks (thumbnails, tiles) use their own fills, e.g. #EFF6FF
 * radius 8 for course thumbnails. A gentle pulse is added only when the user
 * allows motion; the Figma frame itself is static.
 */
type Size = number | string;

const toCss = (value: Size | undefined): string | undefined =>
  value === undefined ? undefined : typeof value === "number" ? `${value}px` : value;

export interface SkeletonLineProps {
  /** Width in px or any CSS length; omit to fill (flex-1 / 100%). */
  width?: Size;
  /** "md" = 12px bar (titles, names), "sm" = 9.6px bar (meta, badges). */
  size?: "md" | "sm";
  className?: string;
}

/** Rounded text bar, fill #DFEDF9. */
export function SkeletonLine({ width, size = "md", className = "" }: SkeletonLineProps) {
  const style: CSSProperties = { width: toCss(width) ?? "100%" };
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`block shrink-0 rounded-full bg-selected motion-safe:animate-pulse ${size === "md" ? "h-3" : "h-[9.6px]"} ${className}`}
    />
  );
}

export interface SkeletonBlockProps {
  width?: Size;
  height?: Size;
  /** Tailwind classes for fill and radius; default thumbnail #EFF6FF radius 8. */
  className?: string;
  children?: ReactNode;
}

/** Rectangular placeholder (thumbnail, tile, avatar box). */
export function SkeletonBlock({ width, height, className = "rounded-eb-md bg-[#EFF6FF]", children }: SkeletonBlockProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width: toCss(width), height: toCss(height) }}
      className={`flex shrink-0 items-center justify-center motion-safe:animate-pulse ${className}`}
    >
      {children}
    </span>
  );
}

export interface SkeletonCircleProps {
  size?: number;
  className?: string;
}

/** Circular placeholder, fill #DFEDF9. */
export function SkeletonCircle({ size = 24, className = "" }: SkeletonCircleProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`block shrink-0 rounded-full bg-selected motion-safe:animate-pulse ${className}`}
    />
  );
}

/**
 * Figma "Badge" placeholder: padding 3/8, radius 24, fill #F3F6FC, holding a
 * 9.6px bar of the given width.
 */
export function SkeletonBadge({ width = 36, className = "bg-canvas" }: { width?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 rounded-[24px] px-2 py-[3px] ${className}`}>
      <SkeletonLine width={width} size="sm" />
    </span>
  );
}

export interface SkeletonRegionProps {
  /** Accessible name announced to screen readers; defaults to `states.loading.label`. */
  label?: string;
  className?: string;
  children: ReactNode;
}

/** Busy region wrapper: role="status" with a screen-reader label. */
export function SkeletonRegion({ label, className = "", children }: SkeletonRegionProps) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label ?? t("states.loading.label")}</span>
      {children}
    </div>
  );
}

/* Metadata bar widths of the 01.1 course card: level, count, materials, count, cases. */
const COURSE_META_WIDTHS = [87, 24, 45, 24, 36];

/**
 * Course card placeholder (01.1 "Course Card"): white, radius 14, padding 16;
 * row gap 20: thumbnail 137x82 #EFF6FF radius 8; info column padding-top 8,
 * gap 18 — title bar (fill) + badge, then instructor (24px avatar tile
 * #F3F6FC radius 7 + 119px bar, gap 8) and metadata bars (gap 8).
 */
export function CourseCardSkeleton() {
  return (
    <div className="flex rounded-[14px] bg-surface p-4">
      <div className="flex w-full gap-5">
        <SkeletonBlock width={137} height={82} />
        <div className="flex min-w-0 flex-1 flex-col gap-[18px] pt-2">
          <div className="flex items-start gap-2">
            <SkeletonLine className="flex-1" />
            <SkeletonBadge width={36} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SkeletonBlock width={24} height={24} className="rounded-[7px] bg-canvas">
                <SkeletonLine width={24} size="sm" />
              </SkeletonBlock>
              <SkeletonLine width={119} />
            </div>
            <div className="flex items-center gap-2">
              {COURSE_META_WIDTHS.map((width, index) => (
                <SkeletonLine key={index} width={width} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface CourseListSkeletonProps {
  /** Number of placeholder cards (Figma shows 4). */
  count?: number;
  /** Visible note in the footer card; defaults to `states.loading.courseList`. */
  loadingLabel?: string;
  className?: string;
}

/**
 * 01.1 course list area while loading: cards stacked with gap 16, then the
 * "List pagination" card (white, radius 18, padding 20) replaced by the loading
 * note — Icon/loader-circle 16 (stroke 1.33, #2A4E7F) + Roboto Regular 12/16
 * #696A70, gap 8. The list and the footer card are separated by 20.
 */
export function CourseListSkeleton({ count = 4, loadingLabel, className = "" }: CourseListSkeletonProps) {
  const { t } = useTranslation();
  const note = loadingLabel ?? t("states.loading.courseList");
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={`flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
      <div className="flex rounded-eb-xl bg-surface p-5">
        <div className="flex items-center gap-2">
          <LoaderCircle
            aria-hidden="true"
            size={16}
            absoluteStrokeWidth
            strokeWidth={1.33}
            className="shrink-0 text-primary motion-safe:animate-spin"
          />
          <span className="text-[12px] leading-4 text-ink-secondary">{note}</span>
        </div>
      </div>
    </div>
  );
}
