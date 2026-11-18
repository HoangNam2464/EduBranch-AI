import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, CircleCheck, CloudUpload, Compass, FileText, GitBranch, MessageSquare, SquarePen, type LucideIcon } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds";
import { SectionTitle } from "@/pages/landing/landingShared";
import { LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * "Cách hoạt động · #cach-hoat-dong" (580:8645): column gap 32, padding 96 104, items centred.
 *  - Header: H2 + Regular 14/20 #696A70, gap 8
 *  - Steps row (1232): five cards (fill) joined by 30px connectors (line at y 41, 2px, round caps)
 *  - Progress: chips row (gap 8, 16x2 joins) + status line Regular 14/20, gap 12
 * The frame shows step 3 active. UX notes: the flow plays by itself (2 500 ms per step, 1 500 ms
 * pause after step 5, then loops); clicking a card or chip jumps there; reduced motion shows every
 * step done. Playback starts on step 3 so the first paint matches the approved frame.
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

const STEP_MS = 2500;
const LOOP_PAUSE_MS = 1500;
const START_STEP = 2;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = t("g1.landing.how.steps", { returnObjects: true }) as StepCopy[];
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(START_STEP);

  useEffect(() => {
    if (reducedMotion) return;
    const delay = active === steps.length - 1 ? STEP_MS + LOOP_PAUSE_MS : STEP_MS;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % steps.length), delay);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, steps.length]);

  // Reduced motion: every step is shown as done.
  const current = reducedMotion ? steps.length : active;
  const stateOf = (i: number): StepState => (i < current ? "done" : i === current ? "active" : "next");

  return (
    <section id={LANDING_ANCHORS.how} className="w-full scroll-mt-[72px] py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <SectionTitle>{t("g1.landing.how.title")}</SectionTitle>
          <p className="text-[14px] leading-5 font-normal text-ink-secondary">{t("g1.landing.how.subtitle")}</p>
        </div>

        <ol aria-label={t("g1.landing.how.stepsLabel")} className="flex w-full">
          {steps.map((step, i) => (
            <li key={step.title} className="contents">
              {i > 0 && <StepConnector state={i <= current ? "done" : i - 1 === current ? "active" : "next"} />}
              <StepCard index={i} step={step} state={stateOf(i)} onSelect={() => setActive(i)} />
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.chip} className="contents">
                {i > 0 && <span aria-hidden="true" className={cx("h-0.5 w-4 rounded-[1px]", i <= current ? "bg-primary" : "bg-line")} />}
                <ProgressChip index={i} label={step.chip} state={stateOf(i)} onSelect={() => setActive(i)} title={step.title} />
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
      <svg width="22" height="2" viewBox="0 0 22 2" className="overflow-visible">
        <line
          x1="1"
          y1="1"
          x2="21"
          y2="1"
          strokeWidth="2"
          strokeLinecap="round"
          stroke={state === "done" ? "var(--color-primary)" : state === "active" ? "var(--color-accent)" : "var(--color-line-strong)"}
          strokeDasharray={state === "done" ? undefined : "4 4"}
        />
      </svg>
    </span>
  );
}

function StepCard({ index, step, state, onSelect }: { index: number; step: StepCopy; state: StepState; onSelect: () => void }) {
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
        "flex min-w-0 flex-1 cursor-pointer flex-col gap-3 rounded-[20px] bg-surface p-5 text-left transition-[opacity,box-shadow,border-color]",
        active ? "border-2 border-accent shadow-[0_10px_24px_-6px_rgb(41_79_128/0.14)]" : "border border-line",
        state === "next" && "opacity-55",
        FOCUS_RING,
      )}
    >
      <span className="flex w-full items-center justify-between">
        <span className={cx("flex size-11 items-center justify-center rounded-eb-lg", active ? "bg-primary-subtle" : "bg-canvas")}>
          <Icon aria-hidden="true" size={22} absoluteStrokeWidth strokeWidth={stroke} className={active ? "text-primary" : "text-ink-muted"} />
        </span>
        <span
          className={cx(
            "flex size-[30px] items-center justify-center rounded-full text-[12px] leading-4 font-medium",
            state === "next" ? "bg-canvas text-ink-muted" : "bg-primary text-ink-inverse",
          )}
        >
          {state === "done" ? <Check aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={2.09} /> : index + 1}
        </span>
      </span>
      <span className={cx("text-[14px] leading-5 font-medium", active ? "text-primary" : "text-ink")}>{step.title}</span>
      <span className="self-start rounded-full bg-canvas px-2 py-[3px] text-[12px] leading-4 text-ink-secondary">{step.actor}</span>
      <span className="text-[12px] leading-4 text-ink-secondary">{step.desc}</span>
      <span className={cx("flex w-full flex-col gap-1.5 rounded-eb-lg p-2.5", active ? "bg-primary-subtle" : "bg-canvas")}>
        <StepDemo index={index} />
      </span>
    </button>
  );
}

/** The "Mini demo" content of each card, as drawn in the frame. */
function StepDemo({ index }: { index: number }) {
  const { t } = useTranslation();
  const d = (key: string) => t(`g1.landing.how.demo.${key}`);
  const list = (key: string) => t(`g1.landing.how.demo.${key}`, { returnObjects: true }) as string[];

  if (index === 0) {
    return list("files").map((file) => (
      <span key={file} className="flex items-center gap-1.5 rounded-eb-md bg-surface px-2 py-[5px]">
        <FileText aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={1.7} className="shrink-0 text-ink-muted" />
        <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink">{file}</span>
        <Check aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={2.09} className="shrink-0 text-primary" />
      </span>
    ));
  }
  if (index === 1) {
    return (
      <>
        <span className="flex w-full text-[12px] leading-4">
          <span className="min-w-0 flex-1 text-ink-secondary">{d("generating")}</span>
          <span className="font-medium text-ink">100%</span>
        </span>
        <span className="block h-1.5 w-full overflow-hidden rounded-[3px] bg-surface">
          <span className="block h-full w-full rounded-[3px] bg-primary" />
        </span>
        <span className="flex flex-wrap gap-1">
          {list("nodes").map((node) => (
            <Pill key={node} className="bg-surface">
              {node}
            </Pill>
          ))}
        </span>
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        <DemoState>{d("draft")}</DemoState>
        <DemoState>{d("reviewed")}</DemoState>
        <span className="flex h-6 items-center gap-2 rounded-eb-md bg-surface px-2">
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-accent" />
          <span className="min-w-0 flex-1 text-[12px] leading-4 font-medium text-ink">{d("approve")}</span>
          <span className="text-[12px] leading-4 text-[#00699E]">{d("running")}</span>
        </span>
        <span className="flex h-6 items-center gap-2 rounded-eb-md px-2">
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full border-[1.5px] border-line-strong" />
          <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink-muted">{d("publish")}</span>
        </span>
      </>
    );
  }
  if (index === 3) {
    return list("options").map((option, i) => {
      const chosen = i === 1;
      return (
        <span
          key={option}
          className={cx("flex items-center gap-1.5 rounded-eb-md bg-surface px-2 py-[5px]", chosen && "border border-primary")}
        >
          <span
            className={cx(
              "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] text-[12px] leading-4 font-medium",
              chosen ? "bg-primary text-ink-inverse" : "bg-canvas text-ink-secondary",
            )}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink">{option}</span>
        </span>
      );
    });
  }
  return (
    <>
      <span className="flex flex-col gap-0.5 rounded-[10px] bg-surface px-2.5 py-2">
        <span className="text-[12px] leading-4 font-medium text-ink">{d("lecturer")}</span>
        <span className="text-[12px] leading-4 text-ink-secondary">{d("feedback")}</span>
      </span>
      <span className="flex items-center gap-1.5 rounded-[10px] bg-surface px-2.5 py-1.5">
        <SquarePen aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={1.51} className="shrink-0 text-ink-muted" />
        <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink-muted">{d("reflection")}</span>
      </span>
    </>
  );
}

function DemoState({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-6 items-center gap-2 rounded-eb-md px-2">
      <CircleCheck aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0 text-primary" />
      <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink">{children}</span>
    </span>
  );
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("rounded-full px-2 py-[3px] text-[12px] leading-4 text-ink-secondary", className)}>{children}</span>;
}

function ProgressChip({ index, label, title, state, onSelect }: { index: number; label: string; title: string; state: StepState; onSelect: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={t("g1.landing.how.goToStep", { n: index + 1, title })}
      aria-current={state === "active" ? "step" : undefined}
      className={cx(
        "flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12px] leading-4 whitespace-nowrap",
        state === "done" && "bg-primary-subtle text-primary",
        state === "active" && "bg-primary font-medium text-ink-inverse",
        state === "next" && "bg-canvas text-ink-muted",
        FOCUS_RING,
      )}
    >
      {state === "done" && <Check aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={2.09} />}
      {/* Ellipse 8 with a 3px outside stroke → 14px white dot that keeps the 8px layout slot. */}
      {state === "active" && <span aria-hidden="true" className="size-2 rounded-full bg-white shadow-[0_0_0_3px_#FFFFFF]" />}
      {state === "next" && <span className="font-medium">{index + 1}</span>}
      <span>{label}</span>
    </button>
  );
}
