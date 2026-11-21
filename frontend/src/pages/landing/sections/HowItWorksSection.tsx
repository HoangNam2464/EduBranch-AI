import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, CircleCheck, CloudUpload, Compass, Cpu, FileText, GitBranch, MessageSquare, SquarePen, type LucideIcon } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds";
import { SectionTitle } from "@/pages/landing/landingShared";
import { LANDING_ANCHORS } from "@/pages/landing/landingConstants";
import { usePrefersReducedMotion } from "@/pages/landing/usePrefersReducedMotion";

/**
 * "Cách hoạt động · #cach-hoat-dong" (580:8645): column gap 32, padding 96 104, items centred.
 *  - Header: H2 + Regular 14/20 #696A70, gap 8
 *  - Steps row (1232): five cards (fill) joined by 30px connectors
 *  - Progress: chips row (gap 8, 16x2 joins) + status line Regular 14/20, gap 12
 * Upgraded with smooth progress bar timing, active card elevated transitions, and animated demos.
 */
type StepState = "done" | "active" | "next";

interface StepCopy {
  title: string;
  actor: string;
  desc: string;
  chip: string;
  status: string;
}

const STEP_ICONS: { icon: LucideIcon; stroke: number }[] = [
  { icon: CloudUpload, stroke: 1.09 },
  { icon: GitBranch, stroke: 1.5 },
  { icon: CircleCheck, stroke: 0.85 },
  { icon: Compass, stroke: 1.36 },
  { icon: MessageSquare, stroke: 1.36 },
];

const STEP_MS = 3200;
const LOOP_PAUSE_MS = 1500;
const START_STEP = 2;

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = t("g1.landing.how.steps", { returnObjects: true }) as StepCopy[];
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(START_STEP);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (reducedMotion || isPaused) return;
    const delay = active === steps.length - 1 ? STEP_MS + LOOP_PAUSE_MS : STEP_MS;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % steps.length), delay);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, isPaused, steps.length]);

  // Reduced motion: every step is shown as done.
  const current = reducedMotion ? steps.length : active;
  const stateOf = (i: number): StepState => (i < current ? "done" : i === current ? "active" : "next");

  return (
    <section
      id={LANDING_ANCHORS.how}
      className="w-full scroll-mt-[72px] py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <SectionTitle>{t("g1.landing.how.title")}</SectionTitle>
          <p className="text-[15px] leading-6 font-normal text-ink-secondary">{t("g1.landing.how.subtitle")}</p>
        </div>

        <ol aria-label={t("g1.landing.how.stepsLabel")} className="grid grid-cols-1 sm:grid-cols-2 lg:flex w-full items-stretch gap-4 lg:gap-0">
          {steps.map((step, i) => (
            <li key={step.title} className="flex min-w-0 flex-1">
              {i > 0 && (
                <span className="hidden lg:flex items-center">
                  <StepConnector state={i <= current ? "done" : i - 1 === current ? "active" : "next"} />
                </span>
              )}
              <StepCard
                index={i}
                step={step}
                state={stateOf(i)}
                onSelect={() => setActive(i)}
                activeDuration={STEP_MS}
              />
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.chip} className="contents">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className={cx("h-0.5 w-4 rounded-[1px] transition-colors duration-300", i <= current ? "bg-primary" : "bg-line")}
                  />
                )}
                <ProgressChip
                  index={i}
                  label={step.chip}
                  state={stateOf(i)}
                  onSelect={() => setActive(i)}
                  title={step.title}
                />
              </div>
            ))}
          </div>
          <p aria-live="polite" className="text-[14px] leading-5 font-normal text-ink-secondary">
            {current < steps.length ? steps[current].status : t("g1.landing.how.allDone")}
          </p>
        </div>
      </div>
    </section>
  );
}

function StepConnector({ state }: { state: StepState }) {
  return (
    <span aria-hidden="true" className="flex w-[30px] shrink-0 px-1 pt-[41px]">
      <svg width="22" height="6" viewBox="0 0 22 6" className="overflow-visible">
        <line
          x1="1"
          y1="3"
          x2="21"
          y2="3"
          strokeWidth="2.5"
          strokeLinecap="round"
          stroke={
            state === "done"
              ? "var(--color-primary)"
              : state === "active"
              ? "var(--color-accent)"
              : "var(--color-line-strong)"
          }
          strokeDasharray={state === "done" ? undefined : "4 4"}
        />
        {state === "active" && (
          <circle cx="11" cy="3" r="3" fill="var(--color-accent)" className="animate-pulse" />
        )}
      </svg>
    </span>
  );
}

function StepCard({
  index,
  step,
  state,
  onSelect,
  activeDuration,
}: {
  index: number;
  step: StepCopy;
  state: StepState;
  onSelect: () => void;
  activeDuration: number;
}) {
  const { t } = useTranslation();
  const { icon: Icon, stroke } = STEP_ICONS[index];
  const active = state === "active";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "step" : undefined}
      aria-label={t("g1.landing.how.goToStep", { n: index + 1, title: step.title })}
      className={cx(
        "relative flex min-w-0 flex-1 cursor-pointer flex-col gap-3 rounded-[20px] bg-surface p-5 text-left transition-all duration-300 overflow-hidden",
        active
          ? "border-2 border-accent shadow-[0_12px_28px_-6px_rgba(42,78,127,0.18)] scale-[1.02] z-10"
          : "border border-line hover:border-line-strong hover:shadow-eb-hover",
        state === "next" && "opacity-75 hover:opacity-100",
        FOCUS_RING,
      )}
    >
      {/* Top Animated Active Progress Line */}
      {active && (
        <motion.div
          key={index}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: activeDuration / 1000, ease: "linear" }}
          className="absolute top-0 left-0 h-1 bg-accent"
        />
      )}

      <span className="flex w-full items-center justify-between">
        <span
          className={cx(
            "flex size-11 items-center justify-center rounded-eb-lg transition-colors",
            active ? "bg-primary-subtle text-primary" : "bg-canvas text-ink-muted",
          )}
        >
          <Icon aria-hidden="true" size={22} absoluteStrokeWidth strokeWidth={stroke} />
        </span>
        <span
          className={cx(
            "flex size-[30px] items-center justify-center rounded-full text-[12px] leading-4 font-medium transition-colors",
            state === "next"
              ? "bg-canvas text-ink-muted"
              : active
              ? "bg-accent text-white shadow-sm"
              : "bg-primary text-ink-inverse",
          )}
        >
          {state === "done" ? <Check aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={2.09} /> : index + 1}
        </span>
      </span>

      <span className={cx("text-[14px] leading-5 font-medium transition-colors", active ? "text-primary" : "text-ink")}>
        {step.title}
      </span>
      <span className="self-start rounded-full bg-canvas px-2 py-[3px] text-[12px] leading-4 text-ink-secondary">
        {step.actor}
      </span>
      <span className="text-[12px] leading-4 text-ink-secondary line-clamp-2">{step.desc}</span>

      <span className={cx("mt-auto flex w-full flex-col gap-1.5 rounded-eb-lg p-2.5 transition-colors", active ? "bg-primary-subtle/80" : "bg-canvas")}>
        <StepDemo index={index} state={state} />
      </span>
    </button>
  );
}

/** The "Mini demo" content of each card, with live dynamic states matching pedagogical progression. */
function StepDemo({ index, state }: { index: number; state: StepState }) {
  const { t } = useTranslation();
  const d = (key: string) => t(`g1.landing.how.demo.${key}`);
  const list = (key: string) => t(`g1.landing.how.demo.${key}`, { returnObjects: true }) as string[];

  const isDone = state === "done";
  const isActive = state === "active";
  const isDoneOrActive = isDone || isActive;

  if (index === 0) {
    return (
      <>
        {list("files").map((file) => (
          <span
            key={file}
            className={cx(
              "flex items-center gap-1.5 rounded-eb-md bg-surface px-2 py-[5px] transition-all",
              isActive && "shadow-xs",
            )}
          >
            <FileText aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={1.7} className="shrink-0 text-ink-muted" />
            <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink truncate">{file}</span>
            <Check
              aria-hidden="true"
              size={12}
              absoluteStrokeWidth
              strokeWidth={2.09}
              className={cx("shrink-0", isDone ? "text-emerald-600" : isActive ? "text-emerald-600 animate-pulse" : "text-primary")}
            />
          </span>
        ))}
      </>
    );
  }
  if (index === 1) {
    return (
      <>
        <span className="flex w-full text-[12px] leading-4 items-center">
          <span className="min-w-0 flex-1 text-ink-secondary flex items-center gap-1">
            <Cpu size={11} className={cx("text-accent", isActive && "animate-pulse")} />
            {isDone ? d("draftGenerated") : d("generating")}
          </span>
          <span className="font-semibold text-primary">
            {isDoneOrActive ? "100%" : "0%"}
          </span>
        </span>
        <span className="block h-1.5 w-full overflow-hidden rounded-[3px] bg-surface">
          <span
            className={cx(
              "block h-full rounded-[3px] bg-primary transition-all duration-700",
              isDoneOrActive ? "w-full" : "w-0",
            )}
          />
        </span>
        <span className="flex flex-wrap gap-1 pt-0.5">
          {list("nodes").map((node) => (
            <Pill key={node} className={cx("bg-surface text-[11px]", isDoneOrActive && "border border-primary-subtle font-medium")}>
              {node}
            </Pill>
          ))}
        </span>
      </>
    );
  }
  if (index === 2) {
    return (
      <span className="flex items-center justify-between rounded-eb-md bg-surface px-2.5 py-2 shadow-xs transition-colors">
        <span className="flex items-center gap-1.5 text-[12px] leading-4 font-medium text-ink">
          <CircleCheck size={13} className={cx("shrink-0", isDoneOrActive ? "text-success" : "text-ink-muted")} />
          <span>{d("reviewed")}</span>
        </span>
        <span
          className={cx(
            "rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-colors",
            isDoneOrActive ? "bg-success-bg text-success-text" : "bg-surface-muted text-ink-secondary",
          )}
        >
          {isDone ? d("publishedForClass") : d("done")}
        </span>
      </span>
    );
  }
  if (index === 3) {
    return (
      <>
        {list("options").map((option, i) => {
          const chosen = i === 1;
          return (
            <span
              key={option}
              className={cx(
                "flex items-center gap-1.5 rounded-eb-md px-2 py-[5px] transition-all",
                chosen
                  ? "bg-surface border border-accent shadow-xs"
                  : "bg-surface/70 opacity-70",
              )}
            >
              <span
                className={cx(
                  "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] text-[11px] leading-4 font-bold",
                  chosen ? "bg-accent text-white" : "bg-canvas text-ink-secondary",
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className={cx("min-w-0 flex-1 text-[12px] leading-4 truncate", chosen ? "font-medium text-ink" : "text-ink-secondary")}>
                {option}
              </span>
            </span>
          );
        })}
      </>
    );
  }
  return (
    <>
      <span className="flex flex-col gap-0.5 rounded-[10px] bg-surface px-2.5 py-2 shadow-xs border border-line-soft">
        <span className="text-[11px] leading-4 font-semibold text-primary">{d("lecturer")}</span>
        <span className="text-[12px] leading-4 text-ink italic">"{d("feedback")}"</span>
      </span>
      <span className="flex items-center gap-1.5 rounded-[10px] bg-surface px-2.5 py-1.5 border border-line-soft">
        <SquarePen aria-hidden="true" size={12} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1 text-[11px] leading-4 font-medium text-accent">{d("reflection")}</span>
      </span>
    </>
  );
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("rounded-full px-2 py-[3px] text-[12px] leading-4 text-ink-secondary", className)}>{children}</span>;
}

function ProgressChip({
  index,
  label,
  title,
  state,
  onSelect,
}: {
  index: number;
  label: string;
  title: string;
  state: StepState;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={t("g1.landing.how.goToStep", { n: index + 1, title })}
      aria-current={state === "active" ? "step" : undefined}
      className={cx(
        "flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12px] leading-4 whitespace-nowrap transition-all duration-200",
        state === "done" && "bg-primary-subtle text-primary hover:bg-primary-subtle/80",
        state === "active" && "bg-primary font-medium text-ink-inverse shadow-sm scale-105",
        state === "next" && "bg-canvas text-ink-muted hover:bg-surface-hover hover:text-ink",
        FOCUS_RING,
      )}
    >
      {state === "done" && <Check aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={2.09} />}
      {state === "active" && <span aria-hidden="true" className="size-2 rounded-full bg-white shadow-[0_0_0_3px_#FFFFFF]" />}
      {state === "next" && <span className="font-medium">{index + 1}</span>}
      <span>{label}</span>
    </button>
  );
}
