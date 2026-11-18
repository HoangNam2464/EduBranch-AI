import { useCallback, useState } from "react";

const STORAGE_KEY = "edubranch-sidebar-collapsed";

function readInitial(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Sidebar collapsed state, remembered for the browser session (FE-025 AC). */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(readInitial);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable (private mode): keep in-memory state only */
      }
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
