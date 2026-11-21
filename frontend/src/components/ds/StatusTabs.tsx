import { useRef, type KeyboardEvent } from "react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Page-08 "Status tabs" (03.1–03.3 / 10.6) — segmented status filter of case lists.
 *  - Track: h32, padding 3, fill #F3F6FC (bg/canvas), radius 8, tabs side by side (gap 0).
 *  - Tab: h26, padding 0 10, radius 6, label Roboto Regular 12/16, each tab tinted by its tone:
 *      default  #DFEDF9 / #202124 (bg/selected + text/primary — "Tất cả")
 *      neutral  #EEF2F9 / #696A70 (status/draft-*)
 *      info     #DFEDF9 / #2A4E7F (status/reviewed-*)
 *      success  #E1F7E9 / #007A2D (status/published-*)
 *      warning  #FFF1DE / #9A5700 (status/approved-*)
 *  - Selected tab: 1px inset #2A4E7F ring (Figma tints every tab and draws no separate selected
 *    state, so the ring is the only visual addition; it does not change the box).
 * WAI-ARIA tabs with automatic activation: ←/→ move and select, Home/End jump.
 * Pass `panelId` when the tabs control a tabpanel.
 */
export type StatusTabTone = "default" | "neutral" | "info" | "success" | "warning";

export interface StatusTabItem {
  value: string;
  label: string;
  tone?: StatusTabTone;
}

const TONES: Record<StatusTabTone, string> = {
  default: "bg-selected text-ink",
  neutral: "bg-surface-muted text-ink-secondary",
  info: "bg-selected text-link",
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
};

export interface StatusTabsProps {
  /** Accessible name of the tab list. */
  label: string;
  items: StatusTabItem[];
  value: string;
  onChange: (value: string) => void;
  /** id of the tabpanel the tabs control (sets aria-controls). */
  panelId?: string;
  className?: string;
}

export function StatusTabs({ label, items, value, onChange, panelId, className }: StatusTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );

  const move = (index: number) => {
    const next = (index + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next].value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      move(keys[event.key]);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx("inline-flex h-8 shrink-0 items-center rounded-eb-md bg-canvas p-[3px]", className)}
    >
      {items.map((item, index) => {
        const selected = index === current;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              "inline-flex h-[26px] shrink-0 cursor-pointer items-center whitespace-nowrap rounded-eb-sm px-2.5 text-[12px] leading-4 font-normal",
              TONES[item.tone ?? "default"],
              selected && "shadow-[inset_0_0_0_1px_var(--color-primary)]",
              FOCUS_RING,
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
