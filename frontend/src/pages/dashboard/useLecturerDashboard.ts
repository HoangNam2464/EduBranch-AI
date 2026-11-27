import { useCallback, useEffect, useState } from "react";
import { lecturerDashboardService } from "@/services/lecturerDashboardService";
import type { LecturerDashboard } from "@/services/mappers/lecturerDashboard";
import { httpStatusOf, type LoadState } from "@/pages/statistics/useLecturerCourseCases";

/** 07.1 aggregate counts and the pending-review list from `GET /lecturer/dashboard` (BE-030). */
export function useLecturerDashboard() {
  const [state, setState] = useState<LoadState<LecturerDashboard>>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    lecturerDashboardService
      .getDashboard()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", code: httpStatusOf(error), at: new Date() });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setReloadToken((k) => k + 1);
  }, []);

  return { state, retry };
}
