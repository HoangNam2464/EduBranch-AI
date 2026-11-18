/**
 * Admin · Cài đặt hệ thống — Figma page 08, frame 10.10 (536:8783).
 *
 * Real data only: there is no settings endpoint, so the platform fields, the sign-in
 * notice, the support email, the limits list and the save / publish bar are not rendered
 * (nothing could be loaded or saved). The "Dịch vụ AI" card is fixed policy copy
 * (OPD-013), not data. Layout: left column 678 + right column 478, gap 20.
 */
import { useTranslation } from "react-i18next";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { AdminNoData, AdminPanel } from "@/pages/admin/components/AdminPanel";

/** Figma "Resource file" row: height 36, padding-top 8, bottom stroke 1 #E8EDF6, Regular 14/20 #202124. */
function InfoRow({ children }: { children: string }) {
  return <li className="h-9 border-b border-line-soft pt-2 text-[14px] leading-5 text-ink">{children}</li>;
}

export function AdminSettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-start gap-5">
      <AdminPanel className="w-[678px] shrink-0" gap="gap-6" title={t("g6.settings.platform")}>
        <AdminNoData
          className="py-10"
          icon={Settings2}
          description={t("g6.settings.platformEmpty")}
        />
      </AdminPanel>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <AdminPanel gap="gap-[23px]" title={t("g6.settings.limits")}>
          <AdminNoData className="py-4" icon={SlidersHorizontal} description={false} />
        </AdminPanel>
        <AdminPanel gap="gap-[23px]" title={t("g6.settings.ai.title")}>
          <ul className="flex flex-col gap-2">
            <InfoRow>{t("g6.settings.ai.provider")}</InfoRow>
            <InfoRow>{t("g6.settings.ai.monitor")}</InfoRow>
          </ul>
          <p className="text-[12px] leading-4 text-ink-secondary">{t("g6.settings.ai.note")}</p>
        </AdminPanel>
      </div>
    </div>
  );
}
