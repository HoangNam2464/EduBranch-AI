import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ShellTitleState {
  override: string | null;
  setOverride: (title: string | null) => void;
}

const ShellTitleContext = createContext<ShellTitleState | null>(null);

export function ShellTitleProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<string | null>(null);
  return <ShellTitleContext.Provider value={{ override, setOverride }}>{children}</ShellTitleContext.Provider>;
}

export function useShellTitleOverride(): string | null {
  return useContext(ShellTitleContext)?.override ?? null;
}

/**
 * Lets a screen replace the default header title with a record name
 * (e.g. the course or case title in Figma 02.4 / 03.4). Pass null to keep the default.
 */
export function useShellTitle(title: string | null | undefined) {
  const ctx = useContext(ShellTitleContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setOverride(title ?? null);
    return () => ctx.setOverride(null);
  }, [ctx?.setOverride, title]); // eslint-disable-line react-hooks/exhaustive-deps
}
