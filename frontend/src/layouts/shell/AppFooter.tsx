import { useTranslation } from "react-i18next";

/** Figma: `EB/App Footer` (h 61, px 20) — always at the bottom of the content area. */
export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="flex h-[61px] shrink-0 items-center justify-between px-5 text-xs leading-4">
      <div className="flex items-center gap-[22px]">
        <span className="font-medium text-ink-secondary">{t("shell.footer.copyright")}</span>
        <span className="font-normal text-ink-muted">{t("shell.footer.privacy")}</span>
        <span className="font-normal text-ink-muted">{t("shell.footer.terms")}</span>
        <a
          href={`mailto:${t("shell.footer.supportEmail")}`}
          className="font-normal text-ink-muted hover:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("shell.footer.supportEmail")}
        </a>
      </div>
      <span className="font-normal text-ink-muted">{t("shell.footer.project")}</span>
    </footer>
  );
}
