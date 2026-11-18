import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Compass, GitBranch, Sparkles, ShieldCheck, GraduationCap } from "lucide-react";
import { PublicButton, cx, publicButtonClassName } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { DISPLAY_FONT, LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * 00.2 Hero Section — High-Engagement Interactive Academic Case Preview.
 * Aligned with Figma Page 08 visual system and modern template UX.
 */
export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto flex min-h-[760px] max-w-7xl flex-col items-center justify-between gap-12 px-6 pt-16 pb-20 lg:flex-row lg:px-12">
        {/* Left Column: Hero Copy & Value Props */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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

        {/* Right Column: Interactive Branching Case Preview */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full shrink-0 lg:w-[580px]"
        >
          <InteractiveCaseCard />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Interactive Live Simulation Card demonstrating Branching Study flow
 * (Decision -> Consequence -> Retrospective Review).
 */
function InteractiveCaseCard() {
  const [selectedOption, setSelectedOption] = useState<"A" | "B">("B");

  const optionDetails = {
    A: {
      title: "Chấm dứt hợp đồng ngay lập tức",
      tag: "Biện pháp mạnh",
      consequence:
        "Hệ quả Journey Review: Nhà máy đóng cửa đột ngột khiến hàng trăm công nhân mất việc. Làn sóng chỉ trích từ các tổ chức lao động bùng phát, đặt ra thử thách khủng hoảng truyền thông.",
    },
    B: {
      title: "Cử đoàn kiểm toán độc lập & khắc phục tại chỗ",
      tag: "Hợp tác minh bạch (Được khuyến nghị)",
      consequence:
        "Hệ quả Journey Review: Doanh nghiệp giữ quyền chủ động điều tra và minh bạch thông tin với báo chí, bảo vệ uy tín lâu dài nhưng chịu áp lực chi phí giám sát ngắn hạn.",
    },
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-primary p-6 text-white shadow-2xl sm:p-7">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-white/12 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 items-center rounded-full bg-white/15 px-3 text-[12px] font-medium tracking-wide text-white">
            BUS402 · Quản trị Chiến lược
          </span>
          <span className="flex h-7 items-center gap-1.5 rounded-full bg-[#E1F7E9] px-2.5 text-[11px] font-medium text-[#007A2D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00B343]" />
            PUBLISHED
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-medium text-white/70">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Interactive Demo
        </span>
      </div>

      {/* Case Situation */}
      <div className="mt-4.5 flex flex-col gap-1.5">
        <span className="text-[11px] font-medium tracking-wider uppercase text-white/60">
          Tình huống Quyết định (Node 0)
        </span>
        <h3 className="text-[17px] font-semibold text-white sm:text-[18px]">
          Khủng hoảng đạo đức chuỗi cung ứng quốc tế
        </h3>
        <p className="mt-1 text-[13.5px] leading-5.5 text-white/80">
          Một báo cáo độc lập vừa phát hiện nhà cung ứng cấp 2 tại nước ngoài có dấu hiệu vi phạm điều kiện lao động. Phóng viên chuẩn bị đăng bài điều tra vào sáng mai. Bạn sẽ quyết định ra sao?
        </p>
      </div>

      {/* Interactive Options */}
      <div className="mt-5 flex flex-col gap-2.5">
        <span className="text-[11px] font-medium uppercase text-white/60">
          Chọn phương án xử lý (Click để trải nghiệm rẽ nhánh):
        </span>

        {/* Option A */}
        <button
          type="button"
          onClick={() => setSelectedOption("A")}
          className={cx(
            "group relative flex flex-col items-start rounded-[14px] border p-3.5 text-left transition-all",
            selectedOption === "A"
              ? "border-accent bg-surface text-ink shadow-lg ring-2 ring-accent/30"
              : "border-white/14 bg-white/6 text-white hover:border-white/25 hover:bg-white/10",
          )}
        >
          <div className="flex w-full items-center justify-between">
            <span
              className={cx(
                "text-[12px] font-semibold tracking-wide uppercase",
                selectedOption === "A" ? "text-accent" : "text-white/60",
              )}
            >
              Phương án A · {optionDetails.A.tag}
            </span>
            {selectedOption === "A" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <p
            className={cx(
              "mt-1 text-[14px] font-medium leading-5",
              selectedOption === "A" ? "text-ink" : "text-white/90",
            )}
          >
            {optionDetails.A.title}
          </p>
        </button>

        {/* Option B */}
        <button
          type="button"
          onClick={() => setSelectedOption("B")}
          className={cx(
            "group relative flex flex-col items-start rounded-[14px] border p-3.5 text-left transition-all",
            selectedOption === "B"
              ? "border-accent bg-surface text-ink shadow-lg ring-2 ring-accent/30"
              : "border-white/14 bg-white/6 text-white hover:border-white/25 hover:bg-white/10",
          )}
        >
          <div className="flex w-full items-center justify-between">
            <span
              className={cx(
                "text-[12px] font-semibold tracking-wide uppercase",
                selectedOption === "B" ? "text-accent" : "text-white/60",
              )}
            >
              Phương án B · {optionDetails.B.tag}
            </span>
            {selectedOption === "B" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <p
            className={cx(
              "mt-1 text-[14px] font-medium leading-5",
              selectedOption === "B" ? "text-ink" : "text-white/90",
            )}
          >
            {optionDetails.B.title}
          </p>
        </button>
      </div>

      {/* Dynamic Consequence Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedOption}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 rounded-[14px] border border-accent/40 bg-accent/15 p-3.5 text-white/90"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-accent">
            <Compass className="h-3.5 w-3.5" />
            <span>Hồi cứu Hệ quả (Giai đoạn Journey Review)</span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-white">
            {optionDetails[selectedOption].consequence}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Footer Flow Indicator */}
      <div className="mt-4.5 flex items-center justify-between border-t border-white/12 pt-3 text-[11px] text-white/60">
        <span className="flex items-center gap-1">
          <GitBranch className="h-3.5 w-3.5 text-accent" />
          Tiến vào Node 1 theo nhánh bạn đã chọn
        </span>
        <span className="font-medium text-white/80">3 Nhánh Kết Thúc (Terminal Nodes)</span>
      </div>
    </div>
  );
}
