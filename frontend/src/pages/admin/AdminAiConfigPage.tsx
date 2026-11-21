/**
 * Admin · Dịch vụ AI (chỉ xem) — Figma page EduBranch AI – Screens, frame 10.7 (536:7648).
 *
 * Read-only by decision OPD-013: the provider and model are fixed in the server
 * environment, so this screen has no write action. Real data only: the backend exposes
 * no generation history, indexing overview or AI-service status to ADMIN, so the KPI
 * cards, both lists, "Cập nhật lần cuối" and the status badge are not rendered.
 * Layout: overview column (777) + configuration column (379), gap 20.
 */
import { useTranslation } from "react-i18next";
import { FileText, Sparkles } from "lucide-react";
import { AdminNoData, AdminPanel } from "@/pages/admin/components/AdminPanel";

/** Figma "Provider" / "Model" field: column gap 2, label Regular 12/16 #696A70, value Medium 14/20 #202124. */
function ConfigField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] leading-4 text-ink-secondary">{label}</dt>
      <dd className="text-[14px] leading-5 font-medium text-ink">{value}</dd>
    </div>
  );
}

export function AdminAiConfigPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-start gap-5">
      <div className="flex w-[777px] shrink-0 flex-col gap-5">
        <AdminPanel
          gap="gap-4"
          title={t("g6.aiService.recent.title")}
          subtitle={t("g6.aiService.recent.subtitle")}
          subtitleTone="secondary"
        >
          <AdminNoData className="py-16" icon={Sparkles} />
        </AdminPanel>
        <AdminPanel
          gap="gap-4"
          title={t("g6.aiService.indexing.title")}
          subtitle={t("g6.aiService.indexing.subtitle")}
          subtitleTone="secondary"
        >
          <AdminNoData className="py-16" icon={FileText} />
        </AdminPanel>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <AdminPanel title={t("g6.aiService.config.title")}>
          <dl className="flex flex-col gap-5">
            <ConfigField label={t("g6.aiService.config.providerLabel")} value={t("g6.aiService.config.providerValue")} />
            <ConfigField label={t("g6.aiService.config.modelLabel")} value={t("g6.aiService.config.modelValue")} />
          </dl>
        </AdminPanel>
        <AdminPanel title={t("g6.aiService.change.title")}>
          <p className="text-[14px] leading-5 text-ink-secondary">{t("g6.aiService.change.body")}</p>
        </AdminPanel>
      </div>
    </div>
  );
}
