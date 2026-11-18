import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PublicFooter, PublicNav } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { LANDING_ANCHORS } from "@/pages/landing/landingConstants";
import { HeroSection } from "@/pages/landing/sections/HeroSection";
import { HowItWorksSection } from "@/pages/landing/sections/HowItWorksSection";
import { LearningModesSection } from "@/pages/landing/sections/LearningModesSection";
import { LifecycleSection } from "@/pages/landing/sections/LifecycleSection";
import { RolesSection } from "@/pages/landing/sections/RolesSection";
import { FaqSection } from "@/pages/landing/sections/FaqSection";
import { CtaSection } from "@/pages/landing/sections/CtaSection";

/**
 * 00.2 · Chung · Trang giới thiệu (Figma page 08, node 496:4734) — the one-page public site.
 * Column on bg/canvas: EB/Public Nav (sticky, scroll-spy) · Hero · Cách hoạt động · Hai chế độ học
 * · lifecycle band · Theo vai trò · Câu hỏi thường gặp · Kêu gọi · EB/Public Footer (1440x5366).
 */
type AnchorKey = keyof typeof LANDING_ANCHORS;

/** Highlights the nav link of the section under the sticky nav (UX notes 00.2). */
function useActiveSection(): AnchorKey | null {
  const [active, setActive] = useState<AnchorKey | null>(null);
  useEffect(() => {
    const entries = Object.entries(LANDING_ANCHORS) as [AnchorKey, string][];
    const update = () => {
      const line = 72 + 1;
      let found: AnchorKey | null = null;
      for (const [key, id] of entries) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= line && bottom > line) found = key;
      }
      setActive(found);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return active;
}

/** Smooth in-page anchor scrolling while the landing page is mounted (skipped for reduced motion). */
function useSmoothAnchorScroll() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);
}

export function LandingPage() {
  const { t } = useTranslation();
  const active = useActiveSection();
  useSmoothAnchorScroll();
  const anchor = (key: AnchorKey) => `#${LANDING_ANCHORS[key]}`;

  return (
    <div className="min-h-screen w-full bg-canvas">
      <PublicNav
        className="sticky top-0 z-40"
        ariaLabel={t("g1.landing.nav.ariaLabel")}
        brandName={t("g1.brand")}
        homeTo={PATHS.HOME}
        links={[
          { label: t("g1.landing.nav.how"), to: anchor("how"), active: active === "how" },
          { label: t("g1.landing.nav.modes"), to: anchor("modes"), active: active === "modes" },
          { label: t("g1.landing.nav.faq"), to: anchor("faq"), active: active === "faq" },
        ]}
        secondaryAction={{ label: t("g1.landing.nav.login"), to: PATHS.AUTH.LOGIN }}
        primaryAction={{ label: t("g1.landing.nav.register"), to: PATHS.AUTH.REGISTER }}
      />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <LearningModesSection />
        <LifecycleSection />
        <RolesSection />
        <FaqSection />
        <CtaSection />
      </main>
      <PublicFooter
        brandName={t("g1.brand")}
        homeTo={PATHS.HOME}
        description={t("g1.landing.footer.description")}
        columns={[
          {
            title: t("g1.landing.footer.product"),
            links: [
              { label: t("g1.landing.nav.how"), to: anchor("how") },
              { label: t("g1.landing.nav.modes"), to: anchor("modes") },
              { label: t("g1.landing.nav.faq"), to: anchor("faq") },
            ],
          },
          {
            title: t("g1.landing.footer.account"),
            links: [
              { label: t("g1.landing.nav.login"), to: PATHS.AUTH.LOGIN },
              { label: t("g1.landing.nav.register"), to: PATHS.AUTH.REGISTER },
            ],
          },
          {
            // No legal pages exist yet (reported as a gap); the links stay on this page.
            title: t("g1.landing.footer.legal"),
            links: [
              { label: t("g1.landing.footer.privacy"), to: "#" },
              { label: t("g1.landing.footer.terms"), to: "#" },
            ],
          },
        ]}
        copyright={t("g1.landing.footer.copyright")}
        contactEmail="support@edubranch.ai"
      />
    </div>
  );
}
