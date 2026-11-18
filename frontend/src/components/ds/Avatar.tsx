import { cx } from "@/components/ds/shared";

/**
 * Figma `Data Display/Avatar` (page 02, node 226:225) — initials tile.
 *  - SM: 32x32, radius 8, Roboto Medium 12/16 · MD: 40x40, radius 8, Roboto Medium 14/20
 *  - Fill #DFEDF9 (bg/selected), initials #2A4E7F (text/link). Rounded square, not a circle.
 */
export type AvatarSize = "sm" | "md";

const SIZES: Record<AvatarSize, string> = {
  sm: "size-8 text-[12px] leading-4",
  md: "size-10 text-[14px] leading-5",
};

export interface AvatarProps {
  /** Initials shown in the tile, e.g. "NA". */
  initials: string;
  size?: AvatarSize;
  /** Accessible name (e.g. the person's full name). Omit when the name is shown next to it. */
  label?: string;
  className?: string;
}

export function Avatar({ initials, size = "md", label, className }: AvatarProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx(
        "inline-flex shrink-0 select-none items-center justify-center rounded-eb-md bg-selected font-medium text-link",
        SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
