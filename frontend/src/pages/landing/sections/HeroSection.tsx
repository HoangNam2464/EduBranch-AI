import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PublicButton, cx, publicButtonClassName } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { DISPLAY_FONT, LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * "Hero" (497:4730): row, gap 48, padding 72 104 96 104, items centred, 768 tall.
 *  - Hero copy (fills, 568): column gap 24 — title Be Vietnam Pro SemiBold 60/70 −2%,
 *    lead Regular 18/28 #696A70, actions (padding-top 8, gap 12: EB/Button Primary + Secondary MD),
 *    note Regular 14/20 #909198.
 *  - "Branching diagram" 616x600, #2A4E7F, radius 28: a fixed illustration whose boxes and
 *    connectors sit at the Figma coordinates.
 */
export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="w-full">
      <div className="mx-auto flex min-h-[768px] max-w-7xl items-center gap-12 px-6 pt-[72px] pb-24 sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h1 className={cx(DISPLAY_FONT, "text-[60px] leading-[70px] font-semibold tracking-[-0.02em] text-ink")}>{t("g1.landing.hero.title")}</h1>
          <p className="text-[18px] leading-7 font-normal text-ink-secondary">{t("g1.landing.hero.lead")}</p>
          <div className="flex gap-3 pt-2">
            <PublicButton variant="primary" to={PATHS.AUTH.REGISTER}>
              {t("g1.landing.hero.register")}
            </PublicButton>
            <a href={`#${LANDING_ANCHORS.how}`} className={publicButtonClassName("secondary", "md")}>
              {t("g1.landing.hero.howItWorks")}
            </a>
          </div>
          <p className="text-[14px] leading-5 font-normal text-ink-muted">{t("g1.landing.hero.note")}</p>
        </div>
        <BranchingDiagram />
      </div>
    </section>
  );
}

function DiagramBox({ className, label, labelClassName, children }: { className: string; label: string; labelClassName: string; children: ReactNode }) {
  return (
    <div className={cx("absolute flex flex-col gap-1.5 rounded-[16px] border p-4", className)}>
      <p className={cx("text-[12px] leading-4", labelClassName)}>{label}</p>
      {children}
    </div>
  );
}

function BranchingDiagram() {
  const { t } = useTranslation();
  const k = (key: string) => t(`g1.landing.hero.diagram.${key}`);
  return (
    <figure aria-label={k("ariaLabel")} className="relative h-[600px] w-[616px] shrink-0 rounded-[28px] bg-primary">
      {/* Connectors (497:4747): two dashed curves to A and C, the solid accent path through B. */}
      <svg aria-hidden="true" width="616" height="600" viewBox="0 0 616 600" fill="none" className="absolute inset-0">
        <path d="M 308 148 C 308 190 112 190 112 236" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="4 6" />
        <path d="M 308 148 C 308 190 504 190 504 236" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="4 6" />
        <path d="M 308 148 L 308 236" stroke="var(--color-accent)" strokeWidth="3" />
        <path d="M 308 368 L 308 420" stroke="var(--color-accent)" strokeWidth="3" />
        <circle cx="308" cy="148" r="5" fill="var(--color-accent)" />
        <circle cx="308" cy="368" r="5" fill="var(--color-accent)" />
      </svg>
      <DiagramBox className="top-10 left-[128px] w-[360px] border-white/20 bg-white/10" label={k("situationLabel")} labelClassName="text-white/70">
        <p className="text-[16px] leading-6 font-medium text-ink-inverse">{k("situation")}</p>
      </DiagramBox>
      <DiagramBox className="top-[236px] left-6 min-h-[132px] w-[176px] border-white/16 bg-white/6" label={k("optionA")} labelClassName="text-white/60">
        <p className="text-[14px] leading-5 text-white/75">{k("optionAText")}</p>
      </DiagramBox>
      <DiagramBox
        className="top-[236px] left-[220px] min-h-[132px] w-[176px] border-[3px] border-accent bg-surface"
        label={k("chosen")}
        labelClassName="font-medium text-[#00699E]"
      >
        <p className="text-[14px] leading-5 font-medium text-ink">{k("optionBText")}</p>
      </DiagramBox>
      <DiagramBox className="top-[236px] left-[416px] min-h-[132px] w-[176px] border-white/16 bg-white/6" label={k("optionC")} labelClassName="text-white/60">
        <p className="text-[14px] leading-5 text-white/75">{k("optionCText")}</p>
      </DiagramBox>
      <DiagramBox className="top-[420px] left-[128px] w-[360px] border-accent/60 bg-accent/18" label={k("consequenceLabel")} labelClassName="text-white/80">
        <p className="text-[14px] leading-5 text-ink-inverse">{k("consequence")}</p>
      </DiagramBox>
      <figcaption className="absolute top-[556px] left-8 text-[12px] leading-4 text-white/60">{k("caption")}</figcaption>
    </figure>
  );
}
