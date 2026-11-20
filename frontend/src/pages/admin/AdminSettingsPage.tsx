/**
 * Admin · Cài đặt hệ thống — Figma page EduBranch AI – Screens, frame 10.10 (536:8783).
 *
 * Real data integration with BE-032 (`adminService.getSystemSettings`, `adminService.updateSystemSettings`).
 * Platform metadata, login banner notice, support email, system limit configurations,
 * and confirmation dialog upon saving changes.
 */

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button, Dialog, Field, Toast, ToastRegion } from "@/components/ds";
import { AdminPanel } from "@/pages/admin/components/AdminPanel";
import { ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminSystemSettings } from "@/services/adminService";
import { mapAdminHttpErrorToKey } from "@/pages/admin/adminErrorHelper";

export function AdminSettingsPage() {
  const { t } = useTranslation();

  const [settings, setSettings] = useState<AdminSystemSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<AdminSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Form State
  const [platformName, setPlatformName] = useState("");
  const [operatorUnit, setOperatorUnit] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  // Confirmation Dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setReloadToken((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getSystemSettings()
      .then((data) => {
        if (cancelled) return;
        setSettings(data);
        setInitialSettings(data);
        setPlatformName(data.platformName);
        setOperatorUnit(data.operatorUnit);
        setLoginNotice(data.loginNotice);
        setSupportEmail(data.supportEmail);
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

  const handleReset = () => {
    if (!initialSettings) return;
    setPlatformName(initialSettings.platformName);
    setOperatorUnit(initialSettings.operatorUnit);
    setLoginNotice(initialSettings.loginNotice);
    setSupportEmail(initialSettings.supportEmail);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const updated = await adminService.updateSystemSettings({
        platformName,
        operatorUnit,
        loginNotice,
        supportEmail,
      });
      setSettings(updated);
      setInitialSettings(updated);
      setToastMessage(t("g6.settings.toast.saveSuccess"));
    } catch {
      setToastMessage(t("g6.settings.toast.saveError"));
    } finally {
      setSaving(false);
      setIsConfirmDialogOpen(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-1 flex-col gap-5 pb-6">
        <SkeletonRegion label={t("g6.settings.loading")} className="flex flex-col gap-5">
          <div className="h-64 rounded-eb-xl bg-surface shadow-eb-card" />
        </SkeletonRegion>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <div className="rounded-eb-xl bg-surface p-6 shadow-eb-card">
        <ErrorState
          title={t("g6.settings.loadErrorTitle")}
          description={t(loadError || "g6.noData.apiUnavailable")}
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Toast Region */}
      {toastMessage && (
        <ToastRegion>
          <Toast
            type="success"
            title={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        </ToastRegion>
      )}

      {/* Breadcrumb / Title */}
      <div className="flex items-center justify-between rounded-eb-xl bg-surface p-4 shadow-eb-card">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[16px] leading-6 font-semibold text-ink">{t("g6.settings.header")}</h2>
          <span className="text-[12px] text-ink-secondary">{t("g6.settings.breadcrumb")}</span>
        </div>
      </div>

      {/* Main Layout: 678px Left Column + 478px Right Column */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left Column: Form Fields */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5 lg:w-[678px]">
          {/* Card 1: Thông tin nền tảng */}
          <AdminPanel title={t("g6.settings.platform")}>
            <div className="flex flex-col gap-4">
              <Field
                label={t("g6.settings.form.platformName")}
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
              <Field
                label={t("g6.settings.form.operatorUnit")}
                value={operatorUnit}
                onChange={(e) => setOperatorUnit(e.target.value)}
              />
            </div>
          </AdminPanel>

          {/* Card 2: Thông báo trên trang đăng nhập */}
          <AdminPanel title={t("g6.settings.form.loginNoticeTitle")}>
            <Field
              multiline
              label={t("g6.settings.form.loginNoticeLabel")}
              value={loginNotice}
              onChange={(e) => setLoginNotice(e.target.value)}
              helper={t("g6.settings.form.loginNoticeHelper")}
            />
          </AdminPanel>

          {/* Card 3: Email hỗ trợ */}
          <AdminPanel title={t("g6.settings.form.supportEmailTitle")}>
            <Field
              label={t("g6.settings.form.supportEmailLabel")}
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </AdminPanel>
        </div>

        {/* Right Column: Limits & AI Policy */}
        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[478px]">
          {/* Card 1: Giới hạn & đăng ký */}
          <AdminPanel title={t("g6.settings.limits")}>
            <ul className="flex flex-col divide-y divide-line text-[13px]">
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">{t("g6.settings.limitLabels.fileFormats")}</span>
                <span className="font-semibold text-ink">{settings.limits.fileFormats}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">{t("g6.settings.limitLabels.maxFileSize")}</span>
                <span className="font-semibold text-ink">{settings.limits.maxFileSize}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">{t("g6.settings.limitLabels.registration")}</span>
                <span className="font-semibold text-success-text">{settings.limits.registration}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">{t("g6.settings.limitLabels.version")}</span>
                <span className="font-semibold text-ink">{settings.limits.version}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">{t("g6.settings.limitLabels.timezone")}</span>
                <span className="font-semibold text-ink">{settings.limits.timezone}</span>
              </li>
            </ul>
          </AdminPanel>

          {/* Card 2: Dịch vụ AI */}
          <AdminPanel title={t("g6.settings.ai.title")}>
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex flex-col gap-1">
                <span className="text-ink-secondary">{t("g6.settings.ai.provider")}</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/60 pt-2.5">
                <span className="font-medium text-primary">{t("g6.settings.ai.monitor")}</span>
              </div>
              <p className="border-t border-line/60 pt-2.5 text-[12px] leading-4 text-ink-muted">
                {settings.aiPolicyNote || t("g6.settings.ai.note")}
              </p>
            </div>
          </AdminPanel>
        </div>
      </div>

      {/* Bottom Sticky Action Bar (Figma 10.10) */}
      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-toast border border-line">
        <Button variant="secondary" onClick={handleReset} disabled={saving}>
          {t("g6.settings.actions.cancel")}
        </Button>

        <span className="text-[13px] text-ink-secondary">
          {t("g6.settings.actions.note")}
        </span>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsConfirmDialogOpen(true)}
            disabled={saving}
          >
            {t("g6.settings.actions.save")}
          </Button>
          <Button
            variant="primary"
            leadingIcon={Check}
            onClick={() => setIsConfirmDialogOpen(true)}
            disabled={saving}
          >
            {t("g6.settings.actions.publish")}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        type="confirm"
        title={t("g6.settings.dialog.title")}
        description={t("g6.settings.dialog.description")}
        confirmLabel={t("g6.settings.dialog.confirm")}
        cancelLabel={t("g6.settings.dialog.cancel")}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}
