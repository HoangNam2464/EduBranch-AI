import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CardTitle, CheckList, SectionTitle } from "@/pages/landing/landingShared";
import { LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * "Hai chế độ học · #hai-che-do" (499:4734): column gap 48, padding 104.
 *  - Heading (820): H2 + Regular 18/28 #696A70, gap 16
 *  - Modes row gap 64: two columns (gap 20) — 180px white visual (radius 20), H3, Regular 15/24
 *    description, points with Icon/check #00A5F5.
 */
interface ModeCopy {
  title: string;
  desc: string;
  points: string[];
}

export function LearningModesSection() {
  const { t } = useTranslation();
  const branching = t("g1.landing.modes.branching", { returnObjects: true }) as ModeCopy;
  const review = t("g1.landing.modes.review", { returnObjects: true }) as ModeCopy;
  return (
    <section id={LANDING_ANCHORS.modes} className="w-full scroll-mt-[72px] py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 sm:px-8 lg:px-12">
        <div className="flex max-w-3xl flex-col gap-4">
          <SectionTitle>{t("g1.landing.modes.title")}</SectionTitle>
          <p className="text-[18px] leading-7 font-normal text-ink-secondary">{t("g1.landing.modes.subtitle")}</p>
        </div>
        <div className="flex gap-16">
          <Mode copy={branching} visual={<DecisionPathVisual />} />
          <Mode copy={review} visual={<SubmissionVisual />} />
        </div>
      </div>
    </section>
  );
}

function Mode({ copy, visual }: { copy: ModeCopy; visual: ReactNode }) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-5">
      {visual}
      <CardTitle>{copy.title}</CardTitle>
      <p className="text-[15px] leading-6 font-normal text-ink-secondary">{copy.desc}</p>
      <CheckList items={copy.points} iconClassName="text-accent" />
    </article>
  );
}

/** "Path visual": white 180px card; the 520x180 "Decision path" drawing sits 32px in. */
function DecisionPathVisual() {
  return (
    <div aria-hidden="true" className="relative h-[180px] w-full rounded-[20px] bg-surface shadow-eb-card">
      <svg width="520" height="180" viewBox="0 0 520 180" fill="none" className="absolute top-0 left-8">
        <path d="M 60 90 L 180 90" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 180 90 C 220 90 220 40 260 40" stroke="#B8C6DA" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
        <path d="M 180 90 L 300 90" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 180 90 C 220 90 220 140 260 140" stroke="#B8C6DA" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
        <path d="M 300 90 C 340 90 340 50 380 50" stroke="#B8C6DA" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
        <path d="M 300 90 L 440 90" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="90" r="12" fill="var(--color-primary)" />
        <circle cx="180" cy="90" r="12" fill="var(--color-primary)" />
        <circle cx="300" cy="90" r="12" fill="var(--color-primary)" />
        <circle cx="440" cy="90" r="14" fill="var(--color-accent)" />
        <circle cx="440" cy="90" r="22" stroke="var(--color-accent)" strokeWidth="2" />
        <circle cx="260" cy="40" r="7" fill="#D6DFEC" />
        <circle cx="260" cy="140" r="7" fill="#D6DFEC" />
        <circle cx="380" cy="50" r="7" fill="#D6DFEC" />
      </svg>
    </div>
  );
}

/** "Submission visual": white 180px card, padding 24, gap 12 — answer lines + sent meta. */
function SubmissionVisual() {
  const { t } = useTranslation();
  return (
    <div aria-hidden="true" className="flex h-[180px] w-full flex-col gap-3 rounded-[20px] bg-surface p-6 shadow-eb-card">
      <div className="flex flex-col gap-2 rounded-eb-lg bg-surface p-4">
        <p className="text-[12px] leading-4 font-medium text-ink-secondary">{t("g1.landing.modes.review.answerLabel")}</p>
        <span className="h-2 w-[380px] rounded-[4px] bg-line" />
        <span className="h-2 w-[327px] rounded-[4px] bg-line" />
        <span className="h-2 w-[228px] rounded-[4px] bg-line" />
      </div>
      <p className="flex items-center gap-2 text-[12px] leading-4 text-ink-secondary">
        <span className="size-2 rounded-full bg-accent" />
        {t("g1.landing.modes.review.sent")}
      </p>
    </div>
  );
}
