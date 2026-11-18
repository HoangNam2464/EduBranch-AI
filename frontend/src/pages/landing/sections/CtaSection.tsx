import { useTranslation } from "react-i18next";
import { PublicButton } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { SectionTitle } from "@/pages/landing/landingShared";

/**
 * "Kêu gọi" (499:4944): padding 0 104 104. CTA block #DFEDF9, radius 32, padding 56, gap 48,
 * items centred: copy (H2 + Regular 18/28, gap 12) fills, actions gap 12 (Secondary + Primary MD).
 */
export function CtaSection() {
  const { t } = useTranslation();
  return (
    <section className="w-full pb-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-12 rounded-[32px] bg-primary-subtle p-12 lg:p-14 shadow-eb-card">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <SectionTitle>{t("g1.landing.cta.title")}</SectionTitle>
            <p className="text-[18px] leading-7 font-normal text-ink-secondary">{t("g1.landing.cta.subtitle")}</p>
          </div>
          <div className="flex gap-3">
            <PublicButton variant="secondary" to={PATHS.AUTH.LOGIN}>
              {t("g1.landing.cta.login")}
            </PublicButton>
            <PublicButton variant="primary" to={PATHS.AUTH.REGISTER}>
              {t("g1.landing.cta.register")}
            </PublicButton>
          </div>
        </div>
      </div>
    </section>
  );
}
