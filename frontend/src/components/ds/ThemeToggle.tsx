import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Moon } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("vite-ui-theme");
    return stored === "dark";
  });

  useEffect(() => {
    // Initial sync
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const handleThemeChange = () => {
      const stored = localStorage.getItem("vite-ui-theme");
      const dark = stored === "dark";
      setIsDark(dark);
      root.classList.toggle("dark", dark);
    };

    window.addEventListener("storage", handleThemeChange);
    window.addEventListener("theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    const nextTheme = nextDark ? "dark" : "light";
    setIsDark(nextDark);

    const root = document.documentElement;
    root.classList.toggle("dark", nextDark);
    localStorage.setItem("vite-ui-theme", nextTheme);
    window.dispatchEvent(new Event("theme-change"));
  };

  const label = isDark
    ? t("shell.themeLight", "Chuyển sang giao diện Sáng")
    : t("shell.themeDark", "Chuyển sang giao diện Tối");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cx(
        "relative flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-line bg-surface-muted text-ink-secondary hover:bg-surface-hover hover:text-ink transition-colors",
        FOCUS_RING,
        className,
      )}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun size={18} strokeWidth={2.2} className="text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={18} strokeWidth={2.2} className="text-ink-secondary transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
