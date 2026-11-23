import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Compass,
  GitBranch,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { PublicButton, cx, publicButtonClassName } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { DISPLAY_FONT, LANDING_ANCHORS } from "@/pages/landing/landingConstants";
import { usePrefersReducedMotion } from "@/pages/landing/usePrefersReducedMotion";

/**
 * 00.2 Hero Section — High-Engagement Automated Branching Scenario Simulation.
 * Styled as a modern, high-polish App Studio Mockup Window:
 * - Hands-free cinematic auto-play with Hover-to-Pause and Click-to-Jump controls
 * - Full pedagogical story arc: Situation -> Option B Chosen -> Consequence -> Next Decision & Terminal Outcome on Attempt 2
 * - Smooth Bezier paths and clean layered design system styling
 */
export function HeroSection() {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F3F6FD] to-[#F1F5FB] pt-10 pb-20 transition-colors duration-300">
      {/* Soft Ambient Light behind Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/40 via-blue-100/20 to-transparent blur-3xl -z-10"
      />

      <div className="mx-auto flex min-h-[720px] max-w-7xl flex-col items-center justify-between gap-12 px-6 lg:flex-row lg:px-12">
        {/* Left Column: Hero Copy & Value Props */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-surface-muted/95 border border-line px-3.5 py-1.5 text-[13px] font-medium text-primary shadow-xs backdrop-blur-sm">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>{t("g1.landing.hero.category")}</span>
          </div>

          {/* Heading */}
          <h1
            className={cx(
              "text-[38px] leading-[46px] sm:text-[44px] sm:leading-[52px] lg:text-[48px] lg:leading-[56px] font-semibold text-ink tracking-tight",
              DISPLAY_FONT,
            )}
          >
            {t("g1.landing.hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="max-w-[560px] text-[16px] leading-7 font-normal text-ink-secondary">
            {t("g1.landing.hero.lead")}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <PublicButton variant="primary" size="md" to={PATHS.AUTH.REGISTER}>
              <span className="flex items-center gap-2">
                <span>{t("g1.landing.hero.register")}</span>
                <ArrowRight size={16} />
              </span>
            </PublicButton>
            <a
              href={`#${LANDING_ANCHORS.how}`}
              className={publicButtonClassName("secondary", "md")}
            >
              {t("g1.landing.hero.howItWorks")}
            </a>
          </div>

          {/* Trust Proof Badges */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-[13px] text-ink-secondary border-t border-line">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>{t("g1.landing.hero.badges.grounded")}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <span>{t("g1.landing.hero.badges.pedagogical")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{t("g1.landing.hero.badges.approved")}</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Studio Mockup Window with Automated Simulation */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <StudioMockupWindow />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Modern App Studio Mockup Window displaying the Branching Decision Tree.
 * Styled with macOS-style titlebar, glassmorphic dark-navy canvas,
 * smooth Bezier curves, and interactive phase navigation.
 */
function StudioMockupWindow() {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  // Phase 0: Tình huống; Phase 1: Lựa chọn B; Phase 2: Hệ quả; Phase 3: Kết cục lượt 2
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(() => (reducedMotion ? 3 : 1));
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const k = (key: string) => t(`g1.landing.hero.diagram.${key}`);

  // Automated cinematic loop with pause support (stops when reduced motion is preferred)
  useEffect(() => {
    if (reducedMotion || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setPhase((p) => ((p + 1) % 4) as 0 | 1 | 2 | 3);
    }, 4200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, isPaused]);

  return (
    <figure
      aria-label={k("ariaLabel")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-[620px] w-[620px] overflow-hidden rounded-[24px] bg-[#162947] border border-white/20 shadow-2xl shadow-primary/30 flex flex-col text-white transition-colors duration-300"
    >
      {/* ─── Studio Window Titlebar ─── */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4 backdrop-blur-md">
        {/* Left: Window Dots */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block" />
            <span className="size-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block" />
            <span className="size-3 rounded-full bg-[#27C93F] border border-black/10 inline-block" />
          </div>
          <span className="ml-2 flex items-center gap-1.5 text-[12px] font-medium text-white/80">
            <GitBranch size={13} className="text-accent" />
            <span>EduBranch · Decision Studio</span>
          </span>
        </div>

        {/* Right: Clean Live Simulator Badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/75 font-medium bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          <span>{k("simulationBadge")}</span>
        </div>
      </div>

      {/* ─── Studio Canvas Interior ─── */}
      <div className="relative flex-1 p-5 overflow-hidden">
        {/* Subtle dot-grid canvas background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"
        />

        {/* Dynamic Curved Flow Connectors */}
        <svg
          aria-hidden="true"
          width="580"
          height="510"
          viewBox="0 0 580 510"
          fill="none"
          className="absolute inset-0 pointer-events-none"
        >
          <defs>
            <linearGradient id="active-branch" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00A5F5" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="outcome-branch" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00A5F5" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Smooth Bezier path to Option A (Left) */}
          <path
            d="M 290 82 C 290 110 100 110 100 134"
            stroke="#FFFFFF"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeDasharray="4 6"
          />

          {/* Smooth Path to Option B (Center - Active) */}
          <path
            d="M 290 82 L 290 134"
            stroke={phase >= 1 ? "url(#active-branch)" : "#FFFFFF"}
            strokeOpacity={phase >= 1 ? 1 : 0.25}
            strokeWidth={phase >= 1 ? 3 : 2}
            strokeDasharray={phase >= 1 ? undefined : "4 6"}
            className="transition-all duration-500"
          />

          {/* Smooth Bezier path to Option C (Right) */}
          <path
            d="M 290 82 C 290 110 480 110 480 134"
            stroke="#FFFFFF"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeDasharray="4 6"
          />

          {/* Path from Option B down to Consequence */}
          <path
            d="M 290 252 L 290 278"
            stroke={phase >= 2 ? "url(#active-branch)" : "#FFFFFF"}
            strokeOpacity={phase >= 2 ? 1 : 0.2}
            strokeWidth={phase >= 2 ? 3 : 2}
            strokeDasharray={phase >= 2 ? undefined : "4 6"}
            className="transition-all duration-500"
          />

          {/* Path from Consequence down to Outcome Node (Attempt 2) */}
          <path
            d="M 290 376 L 290 402"
            stroke={phase >= 3 ? "url(#outcome-branch)" : "#FFFFFF"}
            strokeOpacity={phase >= 3 ? 1 : 0.2}
            strokeWidth={phase >= 3 ? 3 : 2}
            strokeDasharray={phase >= 3 ? undefined : "4 6"}
            className="transition-all duration-500"
          />

          {/* Nodes */}
          <circle cx="290" cy="82" r="5" fill="#00A5F5" />
          {phase >= 1 && <circle cx="290" cy="134" r="4.5" fill="#00A5F5" />}
          {phase >= 2 && <circle cx="290" cy="278" r="4.5" fill="#00A5F5" />}
          {phase >= 3 && <circle cx="290" cy="402" r="5.5" fill="#10B981" />}
        </svg>

        {/* 1. TOP NODE: Tình huống nghiệp vụ (Situation) */}
        <div
          className={cx(
            "absolute top-2 left-[50px] w-[480px] rounded-[16px] border p-3.5 backdrop-blur-md shadow-lg transition-all duration-500",
            phase === 0 ? "border-accent bg-white/20 scale-[1.01]" : "border-white/15 bg-white/10",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent" />
              {k("situationLabel")} · {k("decisionPoint1")}
            </span>
            {phase === 0 && !reducedMotion && (
              <span className="flex size-2 rounded-full bg-accent animate-ping" />
            )}
          </div>
          <p className="mt-1 text-[14px] leading-5 font-medium text-white">{k("situation")}</p>
        </div>

        {/* 2. MIDDLE ROW: 3 Option Cards */}
        {/* Option A (Left) */}
        <div className="absolute top-[134px] left-[16px] min-h-[114px] w-[172px] rounded-[14px] border border-white/12 bg-white/6 p-3 text-left opacity-55">
          <p className="text-[11px] leading-4 font-medium text-white/50">{k("optionA")}</p>
          <p className="mt-1 text-[12px] leading-4.5 text-white/75">{k("optionAText")}</p>
        </div>

        {/* Option B (Center - Selected & Highlighted) */}
        <div
          className={cx(
            "absolute top-[134px] left-[204px] min-h-[114px] w-[172px] rounded-[14px] p-3 text-left transition-all duration-500 shadow-xl",
            phase >= 1
              ? "border-2 border-accent bg-white text-slate-900 scale-[1.04] z-10 shadow-accent/20"
              : "border border-white/20 bg-white/10 text-white",
          )}
        >
          <div className="flex items-center justify-between">
            <p className={cx("text-[11px] leading-4 font-semibold", phase >= 1 ? "text-[#00699E]" : "text-white/60")}>
              {k("chosen")}
            </p>
            {phase >= 1 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
                <Check size={11} strokeWidth={2.5} />
              </span>
            )}
          </div>
          <p className={cx("mt-1 text-[12px] leading-4.5 font-medium", phase >= 1 ? "text-slate-900" : "text-white/85")}>
            {k("optionBText")}
          </p>
        </div>

        {/* Option C (Right) */}
        <div className="absolute top-[134px] left-[392px] min-h-[114px] w-[172px] rounded-[14px] border border-white/12 bg-white/6 p-3 text-left opacity-55">
          <p className="text-[11px] leading-4 font-medium text-white/50">{k("optionC")}</p>
          <p className="mt-1 text-[12px] leading-4.5 text-white/75">{k("optionCText")}</p>
        </div>

        {/* 3. CONSEQUENCE NODE: Hồi cứu hành trình */}
        <div
          className={cx(
            "absolute top-[278px] left-[50px] w-[480px] rounded-[16px] border p-3.5 backdrop-blur-md transition-all duration-500 shadow-lg",
            phase >= 2
              ? "border-accent/60 bg-sky-950/50 scale-[1.01]"
              : "border-white/12 bg-white/6 opacity-40",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[11.5px] leading-4 font-semibold text-sky-300">
              <Compass size={13} className="text-accent" />
              <span>{k("consequenceLabel")}</span>
            </p>
            <span className="text-[10.5px] font-medium text-sky-400/90">
              {k("journeyReview")}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-white/90">
            {k("consequence")}
          </p>
        </div>

        {/* 4. ATTEMPT 2 TERMINAL OUTCOME NODE */}
        <div
          className={cx(
            "absolute top-[402px] left-[50px] w-[480px] rounded-[16px] border p-3.5 backdrop-blur-md transition-all duration-500 shadow-xl",
            phase >= 3
              ? "border-emerald-400/60 bg-emerald-950/60 scale-[1.01]"
              : "border-white/12 bg-white/6 opacity-35",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <p className="text-[11.5px] leading-4 font-semibold text-emerald-300">
                {k("attempt2Title")}
              </p>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              {k("retrospective")}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-4.5 text-white/95">
            {k("attempt2Text")}
          </p>
        </div>
      </div>

      {/* ─── Bottom Status Footer ─── */}
      <figcaption className="h-10 shrink-0 border-t border-white/10 bg-black/20 px-5 flex items-center justify-between text-[11.5px] text-white/70">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          <span>
            {isPaused || reducedMotion
              ? k("statusPaused")
              : k("statusPlaying")}
          </span>
        </span>
        <span className="text-white/50 text-[10.5px]">
          {t("g1.landing.hero.diagram.phaseProgress", { current: phase + 1, total: 4 })}
        </span>
      </figcaption>
    </figure>
  );
}
