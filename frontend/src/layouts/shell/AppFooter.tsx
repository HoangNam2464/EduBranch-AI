import { useTranslation } from "react-i18next";

/**
 * Figma: `EB/App Footer` (h 61, px 20) — always at the bottom of the content area.
 * Every item stays on one line (R01). When the row does not fit (e.g. 1024 px) the project line moves
 * to a second row instead of squeezing each item into two lines; from 1280 it is the single 61 px row.
 */
export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="flex min-h-[61px] shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-5 py-3 text-xs leading-4 xl:py-0">
      <div className="flex flex-wrap items-center gap-x-[22px] gap-y-1.5 whitespace-nowrap">
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
      <span className="font-normal whitespace-nowrap text-ink-muted">{t("shell.footer.project")}</span>
    </footer>
  );
}
