import { useTranslation } from "react-i18next";
import { ChevronRight, Cpu, Eye, FileCheck2, GraduationCap, LockOpen, PenLine, SquarePen, User, type LucideIcon } from "lucide-react";
import { cx } from "@/components/ds";
import { DISPLAY_FONT } from "@/pages/landing/landingConstants";

/**
 * "Giảng viên quyết định" (499:4828): #2A4E7F band, column gap 48, padding 96 104.
 *  - Statement (820, gap 16): Be Vietnam Pro Medium 28/38 −1% white + Regular 18/28 white 80%
 *  - Lifecycle track: three translucent state cards, chevron connectors (36), the "Mở cho lớp"
 *    gate (76) and the white "Đã xuất bản" card. Card: padding 24, gap 12, radius 20.
 * State dots use the case-status colours (draft #909198, reviewed #00A5F5, approved #F58A00,
 * published #00B343).
 */
interface StateCopy {
  name: string;
  desc: string;
  actor: string;
}

const STATES: { icon: LucideIcon; iconStroke: number; dot: string; actorIcon: LucideIcon; actorStroke: number }[] = [
  { icon: SquarePen, iconStroke: 1.51, dot: "bg-ink-muted", actorIcon: Cpu, actorStroke: 0.8 },
  { icon: PenLine, iconStroke: 1.33, dot: "bg-accent", actorIcon: User, actorStroke: 1.7 },
  { icon: FileCheck2, iconStroke: 1.7, dot: "bg-warning", actorIcon: User, actorStroke: 1.7 },
  { icon: Eye, iconStroke: 1.7, dot: "bg-success", actorIcon: GraduationCap, actorStroke: 1.36 },
];

export function LifecycleSection() {
  const { t } = useTranslation();
  const states = t("g1.landing.lifecycle.states", { returnObjects: true }) as StateCopy[];
  return (
    <section className="w-full bg-primary py-24 border-y border-transparent transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 sm:px-8 lg:px-12">
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 className={cx(DISPLAY_FONT, "text-[28px] leading-[38px] font-medium tracking-[-0.01em] whitespace-pre-line text-ink-inverse")}>
            {t("g1.landing.lifecycle.title")}
          </h2>
          <p className="text-[18px] leading-7 font-normal text-white/80">{t("g1.landing.lifecycle.subtitle")}</p>
        </div>
        <ol className="flex w-full items-center">
          {states.map((state, i) => {
            const last = i === states.length - 1;
            return (
              <li key={state.name} className="contents">
                {i > 0 && !last && <Chevron />}
                {last && <Gate label={t("g1.landing.lifecycle.gate")} />}
                <StateCard index={i} copy={state} total={states.length} published={last} />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Chevron() {
  return (
    <span aria-hidden="true" className="flex w-9 shrink-0 justify-center px-2">
      <ChevronRight size={20} absoluteStrokeWidth strokeWidth={1.33} className="text-ink-inverse" />
    </span>
  );
}

function Gate({ label }: { label: string }) {
  return (
    <span className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 px-2">
      <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-accent">
        <LockOpen size={16} absoluteStrokeWidth strokeWidth={1.94} className="text-ink-inverse" />
      </span>
      <span className="text-[12px] leading-4 whitespace-nowrap text-white/80">{label}</span>
    </span>
  );
}

function StateCard({ index, copy, total, published }: { index: number; copy: StateCopy; total: number; published: boolean }) {
  const { icon: Icon, iconStroke, dot, actorIcon: ActorIcon, actorStroke } = STATES[index];
  return (
    <div
      className={cx(
        "flex h-[214px] min-w-0 flex-1 flex-col gap-3 rounded-[20px] p-6 transition-all duration-300",
        published
          ? "bg-surface shadow-xl"
          : "border border-white/16 bg-white/8",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cx(
            "flex size-10 items-center justify-center rounded-eb-lg",
            published ? "bg-primary-subtle" : "bg-white/12",
          )}
        >
          <Icon
            aria-hidden="true"
            size={20}
            absoluteStrokeWidth
            strokeWidth={iconStroke}
            className={published ? "text-primary" : "text-ink-inverse"}
          />
        </span>
        <span className={cx("text-[12px] leading-4", published ? "text-ink-secondary" : "text-white/60")}>
          {index + 1}/{total}
        </span>
      </div>
      <p className="flex items-center gap-2">
        <span aria-hidden="true" className={cx("size-2.5 rounded-full", dot)} />
        <span className={cx("text-[16px] leading-6 font-medium", published ? "text-ink" : "text-ink-inverse")}>
          {copy.name}
        </span>
      </p>
      <p className={cx("text-[14px] leading-5", published ? "text-ink-secondary" : "text-white/75")}>
        {copy.desc}
      </p>
      <span
        className={cx(
          "flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[12px] leading-4",
          published
            ? "bg-primary-subtle text-primary"
            : "bg-white/12 text-ink-inverse",
        )}
      >
        <ActorIcon aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={actorStroke} />
        {copy.actor}
      </span>
    </div>
  );
}
