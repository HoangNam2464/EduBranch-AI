import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** One breadcrumb step under the header title; the last step is the current page (no link). */
export interface ShellCrumb {
  label: string;
  to?: string;
}

/** Optional header extras a screen can declare (Figma 10.8: back button + breadcrumb under the title). */
export interface ShellHeaderExtras {
  back?: { to: string; label: string };
  crumbs?: ShellCrumb[];
}

interface ShellTitleState {
  override: string | null;
  setOverride: (title: string | null) => void;
  extras: ShellHeaderExtras | null;
  setExtras: (extras: ShellHeaderExtras | null) => void;
}

const ShellTitleContext = createContext<ShellTitleState | null>(null);

export function ShellTitleProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<string | null>(null);
  const [extras, setExtras] = useState<ShellHeaderExtras | null>(null);
  return (
    <ShellTitleContext.Provider value={{ override, setOverride, extras, setExtras }}>{children}</ShellTitleContext.Provider>
  );
}

export function useShellTitleOverride(): string | null {
  return useContext(ShellTitleContext)?.override ?? null;
}

export function useShellHeaderExtras(): ShellHeaderExtras | null {
  return useContext(ShellTitleContext)?.extras ?? null;
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

/**
 * Lets a screen show a back button and a breadcrumb in the shell header (pass null for none).
 * Compared by content, so an inline object does not loop.
 */
export function useShellHeader(extras: ShellHeaderExtras | null | undefined) {
  const ctx = useContext(ShellTitleContext);
  const key = extras ? JSON.stringify(extras) : "";
  useEffect(() => {
    if (!ctx) return;
    ctx.setExtras(key ? (JSON.parse(key) as ShellHeaderExtras) : null);
    return () => ctx.setExtras(null);
  }, [ctx?.setExtras, key]); // eslint-disable-line react-hooks/exhaustive-deps
}
