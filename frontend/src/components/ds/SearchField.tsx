import type { InputHTMLAttributes, Ref } from "react";
import { Search } from "lucide-react";
import { cx } from "@/components/ds/shared";

/**
 * Figma `Forms/Search Field` (page EduBranch AI – Design System, node 230:460) — the h32 search box of list toolbars.
 *  - 200x32 by default, padding 0 12, space-between, white fill, 1px inside stroke #D1D9E8, radius 8
 *  - Text Roboto Regular 12/16: placeholder #909198, typed value #202124 (frame 01.8)
 *  - Trailing Icon/search 16x16, stroke 1.6, #696A70
 * Focus (not drawn in the set) reuses the `Forms/Field` focus: stroke #00A5F5 + 3px glow.
 */
export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "className"> {
  /** Accessible name; the field has no visible label. */
  label: string;
  /** Width/position classes for the outer box (default w-[200px]). */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function SearchField({ label, className, ref, ...inputProps }: SearchFieldProps) {
  return (
    <div
      className={cx(
        "flex h-8 w-[200px] shrink-0 items-center justify-between gap-2 rounded-eb-md border border-line-strong bg-surface px-3",
        "focus-within:border-accent focus-within:shadow-eb-focus",
        className,
      )}
    >
      <input
        {...inputProps}
        ref={ref}
        type="search"
        aria-label={label}
        className="min-w-0 flex-1 appearance-none bg-transparent p-0 text-[12px] leading-4 text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
      />
      <Search aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.6} className="shrink-0 text-ink-secondary" />
    </div>
  );
}
