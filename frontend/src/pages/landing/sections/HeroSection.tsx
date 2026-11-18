import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, Compass, GitBranch, Sparkles, ShieldCheck, GraduationCap, ArrowDown } from "lucide-react";
import { PublicButton, cx, publicButtonClassName } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { DISPLAY_FONT, LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * 00.2 Hero Section — High-Engagement Automated Branching Scenario Simulation.
 * Features:
 * - Hands-free cinematic auto-play demonstrating the full pedagogical arc:
 *   Situation -> Option B Chosen -> Consequence -> Next Decision & Terminal Outcome on Attempt 2!
 * - Soft airy ambient glow background to make the page and card pop out elegantly.
 */
export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F3F6FD] to-[#F1F5FB] pt-12 pb-20">
      {/* Soft Ambient Light Glow behind Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/35 via-blue-100/15 to-transparent blur-3xl -z-10"
      />

      <div className="mx-auto flex min-h-[720px] max-w-7xl flex-col items-center justify-between gap-12 px-6 lg:flex-row lg:px-12">
        {/* Left Column: Hero Copy & Value Props */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/90 border border-line-soft px-3.5 py-1.5 text-[13px] font-medium text-primary shadow-xs">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Nền tảng Tình huống Thực nghiệm & Tư duy Bậc Đại học</span>
          </div>

          <h1
            className={cx(
              DISPLAY_FONT,
              "text-[44px] leading-[52px] font-semibold tracking-[-0.02em] text-ink sm:text-[54px] sm:leading-[62px] lg:text-[60px] lg:leading-[70px]",
            )}
          >
            {t("g1.landing.hero.title")}
          </h1>

          <p className="max-w-2xl text-[17px] leading-7 font-normal text-ink-secondary sm:text-[18px]">
            {t("g1.landing.hero.lead")}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <PublicButton variant="primary" to={PATHS.AUTH.REGISTER} size="md">
              {t("g1.landing.hero.register")}
            </PublicButton>
            <a href={`#${LANDING_ANCHORS.how}`} className={publicButtonClassName("secondary", "md")}>
              {t("g1.landing.hero.howItWorks")}
            </a>
          </div>

          {/* Value Prop Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-line-soft pt-5 text-[13px] text-ink-secondary">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00B343]" />
              <span>RAG Grounding từ giáo trình</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <span>Cây quyết định đa nhánh thực tế</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Giảng viên phê duyệt toàn quyền</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Automated Branching Simulation (Full Story Arc) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <AutomatedBranchingDiagram />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Hands-free Cinematic Branching Scenario Diagram.
 * Automatically progresses through the full pedagogical story:
 * 1. Tình huống (Situation)
 * 2. Lựa chọn B (Option B Chosen)
 * 3. Hệ quả hồi cứu (Journey Consequence)
 * 4. Điểm quyết định & Kết cục trên Lượt làm 2 (Attempt 2 Outcome & Solution)
 */
function AutomatedBranchingDiagram() {
  const { t } = useTranslation();
  // Phase 0: Tình huống; Phase 1: Lựa chọn B; Phase 2: Hệ quả; Phase 3: Kết cục lượt 2
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(1);

  const k = (key: string) => t(`g1.landing.hero.diagram.${key}`);

  // Automated cinematic loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => ((p + 1) % 4) as 0 | 1 | 2 | 3);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <figure
      aria-label={k("ariaLabel")}
      className="relative h-[612px] w-[616px] overflow-hidden rounded-[28px] bg-primary shadow-2xl shadow-primary/25 border border-white/15"
    >
      {/* Background Flow Connectors */}
      <svg
        aria-hidden="true"
        width="616"
        height="612"
        viewBox="0 0 616 612"
        fill="none"
        className="absolute inset-0 pointer-events-none"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Path to Option A (Left) */}
        <path
          d="M 308 96 C 308 126 112 126 112 152"
          stroke="#FFFFFF"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeDasharray="4 6"
        />

        {/* Path to Option B (Center - Active Branch) */}
        <path
          d="M 308 96 L 308 152"
          stroke={phase >= 1 ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={phase >= 1 ? 1 : 0.3}
          strokeWidth={phase >= 1 ? 3 : 2}
          strokeDasharray={phase >= 1 ? undefined : "4 6"}
          className="transition-all duration-500"
        />

        {/* Path to Option C (Right) */}
        <path
          d="M 308 96 C 308 126 504 126 504 152"
          stroke="#FFFFFF"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeDasharray="4 6"
        />

        {/* Path from Option B down to Consequence */}
        <path
          d="M 308 268 L 308 296"
          stroke={phase >= 2 ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={phase >= 2 ? 1 : 0.2}
          strokeWidth={phase >= 2 ? 3 : 2}
          strokeDasharray={phase >= 2 ? undefined : "4 6"}
          className="transition-all duration-500"
        />

        {/* Path from Consequence down to Outcome Node (Attempt 2) */}
        <path
          d="M 308 396 L 308 424"
          stroke={phase >= 3 ? "#10B981" : "#FFFFFF"}
          strokeOpacity={phase >= 3 ? 1 : 0.2}
          strokeWidth={phase >= 3 ? 3 : 2}
          strokeDasharray={phase >= 3 ? undefined : "4 6"}
          className="transition-all duration-500"
        />

        {/* Pulsing Nodes */}
        <circle cx="308" cy="96" r="5" fill="var(--color-accent)" filter="url(#glow)" />
        {phase >= 1 && <circle cx="308" cy="152" r="4" fill="var(--color-accent)" />}
        {phase >= 2 && <circle cx="308" cy="296" r="4" fill="var(--color-accent)" />}
        {phase >= 3 && <circle cx="308" cy="424" r="5" fill="#10B981" filter="url(#glow)" />}
      </svg>

      {/* 1. TOP BOX: Tình huống (Situation) */}
      <div
        className={cx(
          "absolute top-5 left-[78px] w-[460px] rounded-[16px] border p-3.5 backdrop-blur-sm shadow-md transition-all duration-500",
          phase === 0 ? "border-accent bg-white/18 scale-[1.01]" : "border-white/20 bg-white/10",
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] leading-4 font-semibold text-white/70 uppercase tracking-wide">
            {k("situationLabel")} · Điểm quyết định 1
          </p>
          {phase === 0 && (
            <span className="flex size-2 rounded-full bg-accent animate-ping" />
          )}
        </div>
        <p className="mt-1 text-[14.5px] leading-5.5 font-medium text-ink-inverse">{k("situation")}</p>
      </div>

      {/* 2. MIDDLE ROW: 3 Option Cards */}
      {/* Option A (Left) */}
      <div className="absolute top-[152px] left-6 min-h-[116px] w-[176px] rounded-[15px] border border-white/14 bg-white/7 p-3 text-left opacity-65">
        <p className="text-[11px] leading-4 font-medium text-white/60">{k("optionA")}</p>
        <p className="mt-1 text-[12.5px] leading-4.5 text-white/80">{k("optionAText")}</p>
      </div>

      {/* Option B (Center - Chosen & Active) */}
      <div
        className={cx(
          "absolute top-[152px] left-[220px] min-h-[116px] w-[176px] rounded-[15px] p-3 text-left transition-all duration-500 shadow-xl",
          phase >= 1
            ? "border-[3px] border-accent bg-surface scale-[1.03] z-10"
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
        <p className={cx("mt-1 text-[12.5px] leading-4.5 font-medium", phase >= 1 ? "text-ink" : "text-white/85")}>
          {k("optionBText")}
        </p>
      </div>

      {/* Option C (Right) */}
      <div className="absolute top-[152px] left-[416px] min-h-[116px] w-[176px] rounded-[15px] border border-white/14 bg-white/7 p-3 text-left opacity-65">
        <p className="text-[11px] leading-4 font-medium text-white/60">{k("optionC")}</p>
        <p className="mt-1 text-[12.5px] leading-4.5 text-white/80">{k("optionCText")}</p>
      </div>

      {/* 3. CONSEQUENCE BOX */}
      <div
        className={cx(
          "absolute top-[296px] left-[78px] w-[460px] rounded-[16px] border p-3.5 backdrop-blur-sm transition-all duration-500 shadow-lg",
          phase >= 2
            ? "border-accent/70 bg-accent/20 scale-[1.01]"
            : "border-white/14 bg-white/6 opacity-50",
        )}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] leading-4 font-semibold text-white/90">
            <Compass size={13} className="text-accent" />
            <span>{k("consequenceLabel")}</span>
          </p>
          <span className="text-[10.5px] font-medium text-accent">Hồi cứu hành trình</span>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-ink-inverse">
          {k("consequence")}
        </p>
      </div>

      {/* 4. NEXT STEP ON ATTEMPT 2: TERMINAL OUTCOME NODE */}
      <div
        className={cx(
          "absolute top-[424px] left-[78px] w-[460px] rounded-[16px] border p-3.5 backdrop-blur-sm transition-all duration-500 shadow-xl",
          phase >= 3
            ? "border-emerald-400/60 bg-emerald-950/45 scale-[1.01]"
            : "border-white/14 bg-white/6 opacity-40",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <p className="text-[11.5px] leading-4 font-semibold text-emerald-300">
              Lượt làm 2 · Hành động tiếp theo & Kết cục
            </p>
          </div>
          <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            Học từ trải nghiệm
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-white/95">
          Tự động gửi voucher xin lỗi 15% cho khách hàng phải chờ ➔ Giữ chân thành công 85% khách hàng, biến sự cố thành cơ hội củng cố lòng trung thành.
        </p>
      </div>

      {/* FOOTER CAPTION & LIVE STATUS */}
      <figcaption className="absolute top-[566px] left-8 right-8 flex items-center justify-between text-[11.5px] leading-4 text-white/70">
        <span>{k("caption")} ➔ Kết cục trọn vẹn</span>
        <span className="inline-flex items-center gap-1.5 text-accent font-medium">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          Đang tự động trình diễn luồng rẽ nhánh
        </span>
      </figcaption>
    </figure>
  );
}
