import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type AppLanguage } from "@/lib/i18n";
import { cx, FOCUS_RING } from "@/components/ds/shared";

export function LanguageSwitcher({ className }: { className?: string } = {}) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage ?? "vi") as AppLanguage;

  return (
    <div
      role="group"
      aria-label={t("shell.language")}
      className={cx(
        "flex h-10 items-center gap-0.5 rounded-[10px] border border-line bg-surface-muted p-[3px]",
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = lang === currentLang;
        return (
          <button
            key={lang}
            type="button"
            lang={lang}
            aria-pressed={active}
            onClick={() => void i18n.changeLanguage(lang)}
            className={cx(
              "flex h-8 w-[34px] items-center justify-center rounded-eb-md text-xs leading-4 font-medium transition-colors",
              FOCUS_RING,
              active ? "bg-primary text-ink-inverse" : "text-ink-secondary hover:text-ink",
            )}
          >
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
