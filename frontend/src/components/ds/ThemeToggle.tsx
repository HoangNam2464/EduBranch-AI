import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cx, FOCUS_RING } from "@/components/ds/shared";
import { useThemeStore } from "@/stores/themeStore";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isDark = theme === "dark";
  const label = isDark ? t("shell.themeLight") : t("shell.themeDark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cx(
        "relative flex shrink-0 items-center justify-center rounded-eb-sm transition-colors",
        size === "sm" ? "size-8" : "size-10",
        "text-ink-secondary hover:text-ink hover:bg-surface-muted",
        FOCUS_RING,
        className,
      )}
    >
      {isDark ? (
        <Sun size={size === "sm" ? 16 : 18} strokeWidth={2} className="text-warning-text" aria-hidden="true" />
      ) : (
        <Moon size={size === "sm" ? 16 : 18} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
