import { Fragment, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Flag, type LucideIcon } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds";

/*
 * Page-08 building blocks of the student case screens (05.1–05.9, 06.1).
 * Values are measured on the Figma frames; the DS has no shared twin for them
 * (they only occur on G5 screens).
 */

/** White card: radius 18, padding 20. `gap` differs per frame (16 / 18 / 20 / 23 / 24). */
export function Card({
  children,
  className,
  as: Tag = "section",
  ...rest
}: { children: ReactNode; className?: string; as?: "section" | "div" | "aside"; "aria-labelledby"?: string }) {
  return (
    <Tag {...rest} className={cx("flex min-w-0 flex-col rounded-eb-xl bg-surface p-5 shadow-eb-card", className)}>
      {children}
    </Tag>
  );
}

/** Card title: Roboto Regular 16/24 #202124. */
export function CardTitle({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={cx("text-[16px] leading-6 font-normal tracking-normal text-ink", className)}>
      {children}
    </h2>
  );
}

/**
 * "Course cover" (05.1/05.2/05.4): 339x204, radius 13, #2A4E7F, badge 6/6 from the corner
 * (#DFEDF9, radius 16, padding 3/8, 12/16 #2A4E7F) and a 72px white icon centred.
 */
export function CaseCover({ badge, icon: Icon, strokeWidth }: { badge: string; icon: LucideIcon; strokeWidth: number }) {
  return (
    <div className="relative flex h-[204px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-primary">
      <span className="absolute top-1.5 left-1.5 rounded-2xl bg-selected px-2 py-[3px] text-[12px] leading-4 text-link">{badge}</span>
      <Icon aria-hidden="true" size={72} absoluteStrokeWidth strokeWidth={strokeWidth} className="text-ink-inverse" />
    </div>
  );
}

/** Instructor row of the case cover card: 24px avatar #00A5F5 radius 6 + name 14/20 #696A70. */
export function TagRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export interface InfoItem {
  label: ReactNode;
  value: ReactNode;
}

/**
 * Label/value panel (05.1 "Course statistics" / "Feature details"):
 * radius 13, padding 16, gap 16; label 14/20 #696A70, value 14/20 #202124, gap 8;
 * rows separated by a 1px divider. `columns` puts the first row's items side by side
 * with a vertical divider (05.2 / 05.4).
 */
export function InfoPanel({
  rows,
  tone = "canvas",
  className,
}: {
  rows: Array<InfoItem | [InfoItem, InfoItem]>;
  tone?: "selected" | "canvas";
  className?: string;
}) {
  const divider = tone === "selected" ? "bg-canvas" : "bg-surface-hover";
  return (
    <dl className={cx("flex flex-col gap-4 rounded-[13px] p-4", tone === "selected" ? "bg-selected" : "bg-canvas", className)}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <div aria-hidden="true" className={cx("h-px shrink-0", divider)} />}
          {Array.isArray(row) ? (
            <div className="flex gap-4">
              <InfoCell item={row[0]} className="flex-1" />
              <div aria-hidden="true" className={cx("w-px shrink-0 self-stretch", divider)} />
              <InfoCell item={row[1]} className="flex-1" />
            </div>
          ) : (
            <InfoCell item={row} />
          )}
        </Fragment>
      ))}
    </dl>
  );
}

function InfoCell({ item, className }: { item: InfoItem; className?: string }) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-2 text-[14px] leading-5", className)}>
      <dt className="text-ink-secondary">{item.label}</dt>
      <dd className="break-words text-ink">{item.value}</dd>
    </div>
  );
}

/** Text panel (05.1 "About the course"): #F3F6FC, radius 13, padding 16, gap 16; title 14/20, body 14/20 #696A70. */
export function TextPanel({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[13px] bg-canvas p-4 text-[14px] leading-5">
      <h3 className="text-[14px] leading-5 font-normal text-ink">{title}</h3>
      <div className="whitespace-pre-line text-ink-secondary">{children}</div>
    </div>
  );
}

/**
 * "Section duration" pill of an accordion heading (05.1/05.2/05.4): padding 3/9, gap 6,
 * radius 16, icon 10px, label 12/16. Expanded sections use #DFEDF9/#2A4E7F, collapsed #F3F6FC/#696A70.
 */
export function SectionPill({
  icon: Icon,
  strokeWidth,
  children,
  muted = false,
}: {
  icon: LucideIcon;
  strokeWidth: number;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-[9px] py-[3px] text-[12px] leading-4",
        muted ? "bg-canvas text-ink-secondary" : "bg-selected text-link",
      )}
    >
      <Icon aria-hidden="true" size={10} absoluteStrokeWidth strokeWidth={strokeWidth} />
      {children}
    </span>
  );
}

/**
 * Accordion section (05.1 "Expanded / Collapsed curriculum section", 05.2, 05.4).
 *  - Expanded: #F3F6FC, 1px #DFEDF9 stroke, radius 12, padding 16, gap 16; chevron-up 18 (stroke 1.5, #202124).
 *  - Collapsed: height 56, padding 0 16, gap 18, same stroke, no fill; chevron-down 18 (stroke 1.7, #4B5563).
 * Heading text Roboto Regular 16/24.
 */
export function AccordionSection({
  title,
  meta,
  actions,
  expanded,
  onToggle,
  children,
  toggleLabel,
}: {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  expanded: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  toggleLabel: string;
}) {
  const chevron = expanded ? (
    <ChevronUp aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.5} className="text-ink" />
  ) : (
    <ChevronDown aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} className="text-control-icon" />
  );
  const toggle = onToggle ? (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={toggleLabel}
      className={cx("inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm", FOCUS_RING)}
    >
      {chevron}
    </button>
  ) : null;

  if (!expanded) {
    return (
      <div className="flex min-h-14 items-center gap-[18px] rounded-eb-lg border border-selected px-4">
        <h3 className="min-w-0 flex-1 truncate text-[16px] leading-6 font-normal text-ink">{title}</h3>
        {meta}
        {actions}
        {toggle}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 rounded-eb-lg border border-selected bg-canvas p-4">
      <div className="flex h-[23px] items-center gap-[18px]">
        <h3 className="min-w-0 flex-1 truncate text-[16px] leading-6 font-normal text-ink">{title}</h3>
        {meta}
        {actions}
        {toggle}
      </div>
      {children}
    </div>
  );
}

/** White sub panel of an expanded section: radius 9, padding 8, heading 12/16 #696A70 (pl 12, h35) + divider. */
export function SubPanel({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex min-w-0 flex-col rounded-[9px] bg-surface p-2", className)}>
      <div className="flex h-[35px] shrink-0 items-start pl-3 text-[12px] leading-4 text-ink-secondary">{title}</div>
      <div aria-hidden="true" className="h-px shrink-0 bg-canvas" />
      {children}
    </div>
  );
}

/**
 * "Lesson row" (05.1 progress, 05.2 options): padding 10/12, gap 12, radius 8, icon 12,
 * title 12/16 #202124, trailing meta 10px #909198. `active` = #F3F6FC (05.1) or #DFEDF9 (05.2) + 1px #DFEDF9 stroke.
 */
export function LessonRow({
  icon: Icon,
  strokeWidth,
  title,
  meta,
  active,
  activeTone = "canvas",
  className,
}: {
  icon: LucideIcon;
  strokeWidth: number;
  title: ReactNode;
  meta?: ReactNode;
  active?: boolean;
  activeTone?: "canvas" | "selected";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "flex min-h-11 w-full items-center gap-3 rounded-eb-md border px-3 py-2.5 text-left",
        active ? cx("border-selected", activeTone === "selected" ? "bg-selected" : "bg-canvas") : "border-transparent",
        className,
      )}
    >
      <Icon aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={strokeWidth} className="shrink-0 text-link" />
      <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink">{title}</span>
      {meta && <span className="shrink-0 text-[10px] leading-[14px] text-ink-muted">{meta}</span>}
    </span>
  );
}

/**
 * "List row" (05.3): #F3F6FC, radius 12, padding 12/14, gap 12; icon tile 36 #DFEDF9 radius 8;
 * title Medium 14/20, optional subtitle 12/16 #696A70, trailing element.
 */
export function ListRow({
  tile,
  title,
  subtitle,
  trailing,
}: {
  tile: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-eb-lg bg-canvas px-3.5 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-eb-md bg-selected text-link">{tile}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[14px] leading-5 font-medium text-ink">{title}</span>
        {subtitle && <span className="text-[12px] leading-4 text-ink-secondary">{subtitle}</span>}
      </span>
      {trailing}
    </div>
  );
}

/**
 * "Path #n" (05.3 / 05.9): the options chosen in one attempt.
 * Row #F3F6FC radius 10 padding 12 gap 8, wraps. Number box 32 radius 8 (#2A4E7F white text, or
 * #DFEDF9 #2A4E7F when in progress). Step chip white radius 6 padding 5/10/5/6 gap 6 with a 20px
 * index box #DFEDF9 radius 4; chevron-right 14 (stroke 1.33) between chips. Outcome chip: 1px #D1D9E8
 * stroke, flag 14 (stroke 1.94), Medium 14/20. Trailing status Medium 12/16.
 */
export function JourneyPath({
  number,
  steps,
  outcome,
  note,
  status,
  statusTone,
  inProgress = false,
  label,
}: {
  number: number;
  steps: string[];
  outcome?: string;
  note?: string;
  status: string;
  statusTone: "success" | "info";
  inProgress?: boolean;
  label: string;
}) {
  return (
    <div aria-label={label} role="group" className="flex flex-wrap items-center gap-2 rounded-[10px] bg-canvas p-3">
      <span
        className={cx(
          "flex size-8 shrink-0 items-center justify-center rounded-eb-md text-[12px] leading-4 font-medium",
          inProgress ? "bg-selected text-link" : "bg-primary text-ink-inverse",
        )}
      >
        #{number}
      </span>
      {steps.map((text, index) => (
        <Fragment key={index}>
          {index > 0 && <ChevronRight aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.333} className="shrink-0 text-ink-secondary" />}
          <span className="flex min-w-0 items-center gap-1.5 rounded-eb-sm bg-surface py-[5px] pr-2.5 pl-1.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-selected text-[12px] leading-4 font-medium text-link">
              {index + 1}
            </span>
            <span className="min-w-0 truncate text-[14px] leading-5 text-ink">{text}</span>
          </span>
        </Fragment>
      ))}
      {outcome !== undefined && (
        <>
          {steps.length > 0 && (
            <ChevronRight aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.333} className="shrink-0 text-ink-secondary" />
          )}
          <span className="flex min-w-0 items-center gap-1.5 rounded-eb-sm border border-line-strong bg-surface py-[5px] pr-2.5 pl-2">
            <Flag aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.943} className="shrink-0 text-ink" />
            <span className="min-w-0 truncate text-[14px] leading-5 font-medium text-ink">{outcome}</span>
          </span>
        </>
      )}
      {note && <span className="text-[12px] leading-4 text-ink-secondary">{note}</span>}
      <span className="min-w-6 flex-1" />
      <span className={cx("text-[12px] leading-4 font-medium", statusTone === "success" ? "text-status-published-text" : "text-link")}>
        {status}
      </span>
    </div>
  );
}

/** "Page actions" bar (05.7 / 06.1): white, radius 18, padding 20, space-between, centred note 12/16 #696A70. */
export function ActionBar({ start, note, end }: { start: ReactNode; note?: ReactNode; end?: ReactNode }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-4 rounded-eb-xl bg-surface p-5">
      <div className="flex shrink-0 items-center gap-2">{start}</div>
      {note && <p className="min-w-0 text-center text-[12px] leading-4 text-ink-secondary">{note}</p>}
      <div className="flex shrink-0 items-center gap-2">{end}</div>
    </div>
  );
}

/** "Course content row" list (05.7 / 06.1): rows h36, padding 8/0, 1px bottom stroke #E8EDF6, gap 8; 14/20. */
export function KeyValueList({ rows }: { rows: Array<{ label: ReactNode; value: ReactNode }> }) {
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <li key={index} className="border-b border-surface-hover py-2 text-[14px] leading-5">
          <span className="text-ink-secondary">{row.label}: </span>
          <span className="text-ink">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
