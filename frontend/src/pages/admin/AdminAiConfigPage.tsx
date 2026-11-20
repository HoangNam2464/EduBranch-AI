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

export function AdminAiConfigPage() {
  const { t } = useTranslation();

  const [aiData, setAiData] = useState<AdminAiServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await adminService.getAiServiceData();
      setAiData(data);
    } catch {
      setLoadError("Không tải được dữ liệu dịch vụ AI.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading || !aiData) {
    return (
      <div className="flex flex-1 flex-col gap-5 pb-6">
        <SkeletonRegion label="Đang tải thông tin dịch vụ AI..." className="flex flex-col gap-5">
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

  if (loadError) {
    return (
      <div className="rounded-eb-xl bg-surface p-6 shadow-eb-card">
        <ErrorState title="Lỗi dịch vụ AI" description={loadError} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Top 3 Metric Cards (Figma 10.7) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Cpu}
          label="Lượt sinh case"
          value={
            <span className="flex flex-col">
              <span>{aiData.metrics.totalGenerated}</span>
              <span className="mt-1 text-[12px] font-normal leading-4 text-ink-muted">
                Tổng số bản nháp AI đã sinh
              </span>
            </span>
          }
        />
        <MetricCard
          icon={Clock}
          label="Thời gian sinh TB"
          value={
            <span className="flex flex-col">
              <span>{`${aiData.metrics.avgDurationSeconds} giây`}</span>
              <span className="mt-1 text-[12px] font-normal leading-4 text-ink-muted">
                Từ lúc gửi yêu cầu đến khi có bản nháp
              </span>
            </span>
          }
        />
        <MetricCard
          icon={FileCheck2}
          label="Tài liệu sẵn sàng"
          value={
            <span className="flex flex-col">
              <span>{aiData.metrics.readyMaterials}</span>
              <span className="mt-1 text-[12px] font-normal leading-4 text-ink-muted">
                Đã lập chỉ mục, AI có thể trích dẫn
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
            title="Lần sinh case gần đây"
            subtitle="Mỗi lần sinh tạo một bản nháp cho giảng viên rà soát"
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
                        Hoàn tất sau {gen.durationSeconds} giây
                        {gen.decisionsCount ? ` · ${gen.decisionsCount} điểm quyết định` : ""}
                        {gen.materialsCitedCount ? ` · trích từ ${gen.materialsCitedCount} tài liệu` : ""}
                        {gen.note ? ` · ${gen.note}` : ""}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] font-medium text-success-text">
                    <span className="size-1.5 rounded-full bg-success" />
                    Hoàn tất
                  </span>
                </div>
              ))}
            </div>
          </AdminPanel>

          {/* Panel 2: Trạng thái lập chỉ mục tài liệu */}
          <AdminPanel
            title="Trạng thái lập chỉ mục tài liệu"
            subtitle="Tài liệu được tách đoạn và lập chỉ mục để AI trích dẫn khi sinh case"
          >
            <div className="flex flex-col gap-3">
              {aiData.indexingStatuses.map((idxItem) => {
                const isCompleted = idxItem.status === "COMPLETED";
                const isPending = idxItem.status === "PENDING";
                const isProcessing = idxItem.status === "PROCESSING";
                const isFailed = idxItem.status === "FAILED";

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
                          {idxItem.courseCode} · {isCompleted ? `${idxItem.chunksCount ?? 112} đoạn trích, sẵn sàng cho AI trích dẫn` : isPending ? "Đang chờ trong hàng đợi xử lý" : isProcessing ? `Đang tách đoạn và tạo vector (${idxItem.progressPercent ?? 50}%)` : idxItem.errorMessage || "Không đọc được nội dung tệp"}
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
                      {isCompleted ? "Hoàn tất" : isPending ? "Đang chờ" : isProcessing ? "Đang xử lý" : "Thất bại"}
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
          <AdminPanel title="Cấu hình hiện tại">
            <div className="flex flex-col gap-4 text-[13px]">
              <div className="flex flex-col gap-1">
                <span className="text-ink-secondary">Nhà cung cấp AI</span>
                <span className="font-semibold text-ink">Cố định trong cấu hình máy chủ</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/60 pt-3">
                <span className="text-ink-secondary">Mô hình</span>
                <span className="font-semibold text-ink">Do nhóm kỹ thuật thiết lập</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/60 pt-3">
                <span className="text-ink-secondary">Cập nhật lần cuối</span>
                <span className="font-medium text-ink">01/09/2026</span>
              </div>
              <div className="border-t border-line/60 pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] font-medium text-success-text">
                  <span className="size-1.5 rounded-full bg-success" />
                  Hoạt động
                </span>
              </div>
            </div>
          </AdminPanel>

          {/* Card 2: Thay đổi cấu hình (OPD-013) */}
          <AdminPanel title="Thay đổi cấu hình">
            <p className="text-[13px] leading-5 text-ink-secondary">
              Nhà cung cấp và mô hình AI được cố định trong tệp môi trường của máy chủ (OPD-013). Màn này chỉ để theo dõi, không có thao tác đổi cấu hình.
            </p>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
