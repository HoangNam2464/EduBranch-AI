import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {}
      applyTheme(next);
      return { theme: next };
    });
  },
}));

// Cross-tab synchronization
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
      useThemeStore.getState().setTheme(e.newValue);
    }
  });
}
