import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Compass, GitBranch, Sparkles, ShieldCheck, GraduationCap } from "lucide-react";
import { PublicButton, cx, publicButtonClassName } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { DISPLAY_FONT, LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * 00.2 Hero Section — High-Engagement Interactive Branching Decision Tree Diagram.
 * Faithfully implements the exact Figma Page 08 / Image 2 diagram layout with
 * live animated paths, energy particle flow, multi-branch switching, and consequence reveal.
 */
export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto flex min-h-[760px] max-w-7xl flex-col items-center justify-between gap-12 px-6 pt-14 pb-20 lg:flex-row lg:px-12">
        {/* Left Column: Hero Copy & Value Props */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-selected px-3.5 py-1.5 text-[13px] font-medium text-primary">
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

        {/* Right Column: Live Animated Branching Diagram (Image 2) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <AnimatedBranchingDiagram />
        </motion.div>
      </div>
    </section>
  );
}

type OptionKey = "A" | "B" | "C";

interface OptionData {
  label: string;
  title: string;
  consequence: string;
}

/**
 * Animated Branching Decision Tree Diagram matching Image 2 exactly.
 * Dimension: 616x600, navy bg `#2A4E7F`, radius 28px.
 * Features:
 * - Dynamic branch line highlights based on active option
 * - Interactive option card selection (A / B / C)
 * - Auto-rotation with hover pause
 * - Smooth consequence transition with AnimatePresence
 * - Flowing particle animations along the decision tree
 */
function AnimatedBranchingDiagram() {
  const { t } = useTranslation();
  const [activeOption, setActiveOption] = useState<OptionKey>("B");
  const [isHovered, setIsHovered] = useState(false);

  const k = (key: string) => t(`g1.landing.hero.diagram.${key}`);

  const options: Record<OptionKey, OptionData> = {
    A: {
      label: k("optionA"),
      title: k("optionAText"),
      consequence:
        "Không đơn hàng nào bị hủy, nhưng chi phí máy chủ mở rộng khẩn cấp tăng vọt 300%. Vẫn còn 5% người dùng bị nghẽn ở cổng ngân hàng liên kết.",
    },
    B: {
      label: k("chosen"),
      title: k("optionBText"),
      consequence: k("consequence"),
    },
    C: {
      label: k("optionC"),
      title: k("optionCText"),
      consequence:
        "Cổng thanh toán hạ nhiệt ngay lập tức, nhưng doanh thu giờ vàng sụt giảm 35% do khách hàng hủy đơn khi thấy thông báo kết thúc ưu đãi.",
    },
  };

  // Auto-cycle through options every 4.5s unless hovered
  useEffect(() => {
    if (isHovered) return;
    const order: OptionKey[] = ["B", "A", "C"];
    const interval = setInterval(() => {
      setActiveOption((curr) => {
        const nextIdx = (order.indexOf(curr) + 1) % order.length;
        return order[nextIdx];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <figure
      aria-label={k("ariaLabel")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-[600px] w-[616px] overflow-hidden rounded-[28px] bg-primary shadow-2xl shadow-primary/20 border border-white/10"
    >
      {/* Background Subtle Grid & Flow Particle Paths */}
      <svg
        aria-hidden="true"
        width="616"
        height="600"
        viewBox="0 0 616 600"
        fill="none"
        className="absolute inset-0 pointer-events-none"
      >
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00A5F5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00A5F5" stopOpacity="1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Path to Option A (Left: 112, 236) */}
        <path
          d="M 308 148 C 308 190 112 190 112 236"
          stroke={activeOption === "A" ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={activeOption === "A" ? 1 : 0.28}
          strokeWidth={activeOption === "A" ? 3 : 2}
          strokeDasharray={activeOption === "A" ? undefined : "4 6"}
          className="transition-all duration-300"
        />

        {/* Path from Option A down to Consequence (308, 420) */}
        <path
          d="M 112 368 C 112 400 308 385 308 420"
          stroke={activeOption === "A" ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={activeOption === "A" ? 1 : 0.2}
          strokeWidth={activeOption === "A" ? 3 : 2}
          strokeDasharray={activeOption === "A" ? undefined : "4 6"}
          className="transition-all duration-300"
        />

        {/* Path to Option B (Center: 308, 236) */}
        <path
          d="M 308 148 L 308 236"
          stroke={activeOption === "B" ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={activeOption === "B" ? 1 : 0.28}
          strokeWidth={activeOption === "B" ? 3 : 2}
          strokeDasharray={activeOption === "B" ? undefined : "4 6"}
          className="transition-all duration-300"
        />

        {/* Path from Option B down to Consequence (308, 420) */}
        <path
          d="M 308 368 L 308 420"
          stroke={activeOption === "B" ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={activeOption === "B" ? 1 : 0.2}
          strokeWidth={activeOption === "B" ? 3 : 2}
          strokeDasharray={activeOption === "B" ? undefined : "4 6"}
          className="transition-all duration-300"
        />

        {/* Path to Option C (Right: 504, 236) */}
        <path
          d="M 308 148 C 308 190 504 190 504 236"
          stroke={activeOption === "C" ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={activeOption === "C" ? 1 : 0.28}
          strokeWidth={activeOption === "C" ? 3 : 2}
          strokeDasharray={activeOption === "C" ? undefined : "4 6"}
          className="transition-all duration-300"
        />

        {/* Path from Option C down to Consequence (308, 420) */}
        <path
          d="M 504 368 C 504 400 308 385 308 420"
          stroke={activeOption === "C" ? "var(--color-accent)" : "#FFFFFF"}
          strokeOpacity={activeOption === "C" ? 1 : 0.2}
          strokeWidth={activeOption === "C" ? 3 : 2}
          strokeDasharray={activeOption === "C" ? undefined : "4 6"}
          className="transition-all duration-300"
        />

        {/* Split Source Node Dot */}
        <circle cx="308" cy="148" r="6" fill="var(--color-accent)" filter="url(#glow)" />
        <circle cx="308" cy="148" r="12" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.4" className="animate-ping" style={{ transformOrigin: "308px 148px" }} />

        {/* Connection joint to Consequence box */}
        <circle cx="308" cy="420" r="5" fill="var(--color-accent)" />
      </svg>

      {/* TOP BOX: Tình huống (Situation) */}
      <div className="absolute top-9 left-[128px] w-[360px] rounded-[16px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm shadow-lg">
        <p className="text-[12px] leading-4 font-medium text-white/70">{k("situationLabel")}</p>
        <p className="mt-1 text-[15.5px] leading-6 font-medium text-ink-inverse">{k("situation")}</p>
      </div>

      {/* MIDDLE ROW: 3 Option Cards (A, B, C) */}
      {/* Option A (Left) */}
      <button
        type="button"
        onClick={() => setActiveOption("A")}
        aria-label="Chọn lựa chọn A"
        className={cx(
          "absolute top-[236px] left-6 min-h-[132px] w-[176px] cursor-pointer rounded-[16px] p-4 text-left transition-all duration-200",
          activeOption === "A"
            ? "border-[3px] border-accent bg-surface shadow-2xl scale-[1.03] z-10"
            : "border border-white/16 bg-white/8 text-white hover:bg-white/14 hover:border-white/30",
        )}
      >
        <div className="flex items-center justify-between">
          <p className={cx("text-[12px] leading-4 font-semibold", activeOption === "A" ? "text-[#00699E]" : "text-white/60")}>
            {activeOption === "A" ? k("chosen") : k("optionA")}
          </p>
          {activeOption === "A" && (
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
              <Check size={11} strokeWidth={2.5} />
            </span>
          )}
        </div>
        <p className={cx("mt-1.5 text-[13.5px] leading-5", activeOption === "A" ? "font-medium text-ink" : "text-white/80")}>
          {k("optionAText")}
        </p>
      </button>

      {/* Option B (Center) */}
      <button
        type="button"
        onClick={() => setActiveOption("B")}
        aria-label="Chọn lựa chọn B"
        className={cx(
          "absolute top-[236px] left-[220px] min-h-[132px] w-[176px] cursor-pointer rounded-[16px] p-4 text-left transition-all duration-200",
          activeOption === "B"
            ? "border-[3px] border-accent bg-surface shadow-2xl scale-[1.03] z-10"
            : "border border-white/16 bg-white/8 text-white hover:bg-white/14 hover:border-white/30",
        )}
      >
        <div className="flex items-center justify-between">
          <p className={cx("text-[12px] leading-4 font-semibold", activeOption === "B" ? "text-[#00699E]" : "text-white/60")}>
            {activeOption === "B" ? k("chosen") : "Lựa chọn B"}
          </p>
          {activeOption === "B" && (
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
              <Check size={11} strokeWidth={2.5} />
            </span>
          )}
        </div>
        <p className={cx("mt-1.5 text-[13.5px] leading-5", activeOption === "B" ? "font-medium text-ink" : "text-white/80")}>
          {k("optionBText")}
        </p>
      </button>

      {/* Option C (Right) */}
      <button
        type="button"
        onClick={() => setActiveOption("C")}
        aria-label="Chọn lựa chọn C"
        className={cx(
          "absolute top-[236px] left-[416px] min-h-[132px] w-[176px] cursor-pointer rounded-[16px] p-4 text-left transition-all duration-200",
          activeOption === "C"
            ? "border-[3px] border-accent bg-surface shadow-2xl scale-[1.03] z-10"
            : "border border-white/16 bg-white/8 text-white hover:bg-white/14 hover:border-white/30",
        )}
      >
        <div className="flex items-center justify-between">
          <p className={cx("text-[12px] leading-4 font-semibold", activeOption === "C" ? "text-[#00699E]" : "text-white/60")}>
            {activeOption === "C" ? k("chosen") : k("optionC")}
          </p>
          {activeOption === "C" && (
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
              <Check size={11} strokeWidth={2.5} />
            </span>
          )}
        </div>
        <p className={cx("mt-1.5 text-[13.5px] leading-5", activeOption === "C" ? "font-medium text-ink" : "text-white/80")}>
          {k("optionCText")}
        </p>
      </button>

      {/* BOTTOM BOX: Hệ quả (Consequence) */}
      <div className="absolute top-[420px] left-[128px] w-[360px] rounded-[16px] border border-accent/60 bg-accent/20 p-4 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[12px] leading-4 font-semibold text-white/90">
            <Compass size={13} className="text-accent" />
            <span>{k("consequenceLabel")}</span>
          </p>
          <span className="text-[11px] font-medium text-accent">Nhánh lựa chọn {activeOption}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={activeOption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-[13.5px] leading-5 text-ink-inverse"
          >
            {options[activeOption].consequence}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* CAPTION & INTERACTIVE HINT */}
      <figcaption className="absolute top-[554px] left-8 right-8 flex items-center justify-between text-[12px] leading-4 text-white/65">
        <span>{k("caption")}</span>
        <span className="inline-flex items-center gap-1 text-accent/90">
          <Sparkles size={13} />
          Nhấp vào lựa chọn để xem rẽ nhánh
        </span>
      </figcaption>
    </figure>
  );
}
