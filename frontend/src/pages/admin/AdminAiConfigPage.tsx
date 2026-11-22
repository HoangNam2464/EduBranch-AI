/**
 * Admin · Dịch vụ AI (chỉ xem) — Figma page EduBranch AI – Screens, frame 10.7 (536:7648).
 *
 * Read-only by decision OPD-013: provider and model are fixed in server environment.
 * Real data integration with BE-032 (`adminService.getAiServiceData`).
 * Displays top 3 metric cards, recent generation logs, document indexing status,
 * and current system configuration panel.
 */

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  Sparkles,
} from "lucide-react";
import { MetricCard } from "@/components/ds";
import { AdminPanel } from "@/pages/admin/components/AdminPanel";
import { ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminAiServiceData } from "@/services/adminService";
import { mapAdminHttpErrorToKey } from "@/pages/admin/adminErrorHelper";

export function AdminAiConfigPage() {
  const { t } = useTranslation();

  const [aiData, setAiData] = useState<AdminAiServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setReloadToken((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getAiServiceData()
      .then((data) => {
        if (cancelled) return;
        setAiData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(mapAdminHttpErrorToKey(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  if (loading && !aiData) {
    return (
      <div className="flex flex-1 flex-col gap-5 pb-6">
        <SkeletonRegion label={t("g6.aiService.loading")} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-eb-xl bg-surface shadow-eb-card" />
            <div className="h-24 rounded-eb-xl bg-surface shadow-eb-card" />
            <div className="h-24 rounded-eb-xl bg-surface shadow-eb-card" />
          </div>
          <div className="h-96 rounded-eb-xl bg-surface shadow-eb-card" />
        </SkeletonRegion>
      </div>
    );
  }

  if (loadError || !aiData) {
    return (
      <div className="rounded-eb-xl bg-surface p-6 shadow-eb-card">
        <ErrorState
          title={t("g6.aiService.loadErrorTitle")}
          description={t(loadError || "g6.noData.apiUnavailable")}
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Top 3 Metric Cards (Figma 10.7) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Cpu}
          label={t("g6.aiService.kpi.totalGenerated")}
          value={
            <span className="flex flex-col">
              <span>{aiData.metrics.totalGenerated}</span>
              <span className="mt-1 text-[12px] font-normal leading-4 text-ink-muted">
                {t("g6.aiService.kpi.totalGeneratedDesc")}
              </span>
            </span>
          }
        />
        <MetricCard
          icon={Clock}
          label={t("g6.aiService.kpi.avgDuration")}
          value={
            <span className="flex flex-col">
              <span>{t("g6.aiService.kpi.avgDurationValue", { seconds: aiData.metrics.avgDurationSeconds })}</span>
              <span className="mt-1 text-[12px] font-normal leading-4 text-ink-muted">
                {t("g6.aiService.kpi.avgDurationDesc")}
              </span>
            </span>
          }
        />
        <MetricCard
          icon={FileCheck2}
          label={t("g6.aiService.kpi.readyMaterials")}
          value={
            <span className="flex flex-col">
              <span>{aiData.metrics.readyMaterials}</span>
              <span className="mt-1 text-[12px] font-normal leading-4 text-ink-muted">
                {t("g6.aiService.kpi.readyMaterialsDesc")}
              </span>
            </span>
          }
        />
      </div>

      {/* Main Layout: 777px Left Column + 379px Right Column */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left Column: Recent Generations + Indexing Status */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5 lg:w-[777px]">
          {/* Panel 1: Lần sinh case gần đây */}
          <AdminPanel
            title={t("g6.aiService.recent.title")}
            subtitle={t("g6.aiService.recent.subtitle")}
          >
            <div className="flex flex-col gap-3">
              {aiData.recentGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center justify-between gap-3 rounded-eb-lg bg-canvas p-3.5 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-eb-md bg-selected text-primary">
                      <Sparkles size={18} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[14px] font-semibold text-ink" title={gen.caseTitle}>
                        {gen.caseTitle}
                      </span>
                      <p className="text-[12px] text-ink-secondary truncate">
                        {gen.courseCode} · {gen.lecturerName} · {gen.createdAt}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        {t("g6.aiService.gen.duration", { seconds: gen.durationSeconds })}
                        {gen.decisionsCount ? t("g6.aiService.gen.decisions", { count: gen.decisionsCount }) : ""}
                        {gen.materialsCitedCount ? t("g6.aiService.gen.materialsCited", { count: gen.materialsCitedCount }) : ""}
                        {gen.note ? ` · ${gen.note}` : ""}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] font-medium text-success-text">
                    <span className="size-1.5 rounded-full bg-success" />
                    {t("g6.aiService.status.completed")}
                  </span>
                </div>
              ))}
            </div>
          </AdminPanel>

          {/* Panel 2: Trạng thái lập chỉ mục tài liệu */}
          <AdminPanel
            title={t("g6.aiService.indexing.title")}
            subtitle={t("g6.aiService.indexing.subtitle")}
          >
            <div className="flex flex-col gap-3">
              {aiData.indexingStatuses.map((idxItem) => {
                const isCompleted = idxItem.status === "COMPLETED";
                const isPending = idxItem.status === "PENDING";
                const isProcessing = idxItem.status === "PROCESSING";

                return (
                  <div
                    key={idxItem.id}
                    className="flex items-center justify-between gap-3 rounded-eb-lg bg-canvas p-3.5 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-eb-md bg-surface text-ink-secondary border border-line">
                        <FileText size={18} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[14px] font-semibold text-ink" title={idxItem.filename}>
                          {idxItem.filename}
                        </span>
                        <p className="text-[12px] text-ink-secondary">
                          {idxItem.courseCode} · {isCompleted
                            ? t("g6.aiService.idx.completed", { count: idxItem.chunksCount ?? 112 })
                            : isPending
                            ? t("g6.aiService.idx.pending")
                            : isProcessing
                            ? t("g6.aiService.idx.processing", { percent: idxItem.progressPercent ?? 50 })
                            : idxItem.errorMessage || t("g6.aiService.idx.failedFallback")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                        isCompleted
                          ? "bg-success-bg text-success-text"
                          : isPending
                          ? "bg-warning-bg text-warning-text"
                          : isProcessing
                          ? "bg-primary-subtle text-primary"
                          : "bg-error-bg text-error-text"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isCompleted
                            ? "bg-success"
                            : isPending
                            ? "bg-warning"
                            : isProcessing
                            ? "bg-primary"
                            : "bg-error"
                        }`}
                      />
                      {isCompleted
                        ? t("g6.aiService.status.completed")
                        : isPending
                        ? t("g6.aiService.status.pending")
                        : isProcessing
                        ? t("g6.aiService.status.processing")
                        : t("g6.aiService.status.failed")}
                    </span>
                  </div>
                );
              })}
            </div>
          </AdminPanel>
        </div>

        {/* Right Column: Configuration Info & Notice */}
        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[379px]">
          {/* Card 1: Cấu hình hiện tại */}
          <AdminPanel title={t("g6.aiService.config.title")}>
            <div className="flex flex-col gap-4 text-[13px]">
              <div className="flex flex-col gap-1">
                <span className="text-ink-secondary">{t("g6.aiService.config.providerLabel")}</span>
                <span className="font-semibold text-ink">{t("g6.aiService.config.providerValue")}</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/60 pt-3">
                <span className="text-ink-secondary">{t("g6.aiService.config.modelLabel")}</span>
                <span className="font-semibold text-ink">{t("g6.aiService.config.modelValue")}</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/60 pt-3">
                <span className="text-ink-secondary">{t("g6.aiService.config.lastUpdatedLabel")}</span>
                <span className="font-medium text-ink">{aiData.config.lastUpdated}</span>
              </div>
              <div className="border-t border-line/60 pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] font-medium text-success-text">
                  <span className="size-1.5 rounded-full bg-success" />
                  {t("g6.aiService.status.active")}
                </span>
              </div>
            </div>
          </AdminPanel>

          {/* Card 2: Thay đổi cấu hình (OPD-013) */}
          <AdminPanel title={t("g6.aiService.change.title")}>
            <p className="text-[13px] leading-5 text-ink-secondary">
              {t("g6.aiService.change.body")}
            </p>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
