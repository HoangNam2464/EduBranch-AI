/**
 * Admin · Cài đặt hệ thống — Figma page EduBranch AI – Screens, frame 10.10 (536:8783).
 *
 * Real data integration with BE-032 (`adminService.getSystemSettings`, `adminService.updateSystemSettings`).
 * Platform metadata, login banner notice, support email, system limit configurations,
 * and confirmation dialog upon saving changes.
 */

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Settings, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button, Dialog, Field, Toast, ToastRegion } from "@/components/ds";
import { AdminPanel } from "@/pages/admin/components/AdminPanel";
import { ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminSystemSettings } from "@/services/adminService";

export function AdminSettingsPage() {
  const { t } = useTranslation();

  const [settings, setSettings] = useState<AdminSystemSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<AdminSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [platformName, setPlatformName] = useState("EduBranch AI");
  const [operatorUnit, setOperatorUnit] = useState("Trường Đại học Duy Tân - Đồ án C1SE.65");
  const [loginNotice, setLoginNotice] = useState("Hệ thống bảo trì định kỳ từ 22:00 đến 23:00 thứ Bảy hàng tuần.");
  const [supportEmail, setSupportEmail] = useState("support@edubranch.ai");

  // Confirmation Dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
      setInitialSettings(data);
      setPlatformName(data.platformName);
      setOperatorUnit(data.operatorUnit);
      setLoginNotice(data.loginNotice);
      setSupportEmail(data.supportEmail);
    } catch {
      setLoadError("Không tải được cài đặt hệ thống.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      setToastMessage("Đã lưu và áp dụng cài đặt hệ thống thành công.");
    } catch {
      setToastMessage("Lỗi khi lưu cài đặt hệ thống.");
    } finally {
      setSaving(false);
      setIsConfirmDialogOpen(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-1 flex-col gap-5 pb-6">
        <SkeletonRegion label="Đang tải cài đặt hệ thống..." className="flex flex-col gap-5">
          <div className="h-64 rounded-eb-xl bg-surface shadow-eb-card" />
        </SkeletonRegion>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-eb-xl bg-surface p-6 shadow-eb-card">
        <ErrorState title="Lỗi cài đặt hệ thống" description={loadError} onRetry={loadData} />
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
          <h2 className="text-[16px] leading-6 font-semibold text-ink">Cài đặt hệ thống</h2>
          <span className="text-[12px] text-ink-secondary">Quản trị hệ thống &gt; Cài đặt</span>
        </div>
      </div>

      {/* Main Layout: 678px Left Column + 478px Right Column */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left Column: Form Fields */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5 lg:w-[678px]">
          {/* Card 1: Thông tin nền tảng */}
          <AdminPanel title="Thông tin nền tảng">
            <div className="flex flex-col gap-4">
              <Field
                label="Tên nền tảng *"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
              <Field
                label="Đơn vị vận hành"
                value={operatorUnit}
                onChange={(e) => setOperatorUnit(e.target.value)}
              />
            </div>
          </AdminPanel>

          {/* Card 2: Thông báo trên trang đăng nhập */}
          <AdminPanel title="Thông báo trên trang đăng nhập">
            <Field
              multiline
              label="Nội dung thông báo (hiển thị công khai)"
              value={loginNotice}
              onChange={(e) => setLoginNotice(e.target.value)}
              helper="Thông báo sẽ hiển thị nổi bật tại trang đăng nhập cho mọi người dùng."
            />
          </AdminPanel>

          {/* Card 3: Email hỗ trợ */}
          <AdminPanel title="Email hỗ trợ *">
            <Field
              label="Địa chỉ email liên hệ hỗ trợ kỹ thuật"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </AdminPanel>
        </div>

        {/* Right Column: Limits & AI Policy */}
        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[478px]">
          {/* Card 1: Giới hạn & đăng ký */}
          <AdminPanel title="Giới hạn & đăng ký">
            <ul className="flex flex-col divide-y divide-line text-[13px]">
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">Định dạng tài liệu:</span>
                <span className="font-semibold text-ink">{settings.limits.fileFormats}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">Dung lượng tối đa:</span>
                <span className="font-semibold text-ink">{settings.limits.maxFileSize}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">Đăng ký tài khoản:</span>
                <span className="font-semibold text-success-text">{settings.limits.registration}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">Phiên bản:</span>
                <span className="font-semibold text-ink">{settings.limits.version}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-ink-secondary">Múi giờ:</span>
                <span className="font-semibold text-ink">{settings.limits.timezone}</span>
              </li>
            </ul>
          </AdminPanel>

          {/* Card 2: Dịch vụ AI */}
          <AdminPanel title="Dịch vụ AI">
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex flex-col gap-1">
                <span className="text-ink-secondary">Nhà cung cấp:</span>
                <span className="font-semibold text-ink">cố định trong cấu hình máy chủ</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/60 pt-2.5">
                <span className="text-ink-secondary">Theo dõi trạng thái:</span>
                <span className="font-medium text-primary">Xem tại mục Dịch vụ AI</span>
              </div>
              <p className="border-t border-line/60 pt-2.5 text-[12px] leading-4 text-ink-muted">
                {settings.aiPolicyNote}
              </p>
            </div>
          </AdminPanel>
        </div>
      </div>

      {/* Bottom Sticky Action Bar (Figma 10.10) */}
      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-toast border border-line">
        <Button variant="secondary" onClick={handleReset} disabled={saving}>
          Hủy thay đổi
        </Button>

        <span className="text-[13px] text-ink-secondary">
          Thay đổi áp dụng cho toàn hệ thống sau khi lưu.
        </span>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsConfirmDialogOpen(true)}
            disabled={saving}
          >
            Lưu cài đặt
          </Button>
          <Button
            variant="primary"
            leadingIcon={Check}
            onClick={() => setIsConfirmDialogOpen(true)}
            disabled={saving}
          >
            Xuất bản
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        type="confirm"
        title="Lưu thay đổi cài đặt hệ thống?"
        description="Các thông tin cập nhật sẽ được lưu và áp dụng cho toàn bộ người dùng trong nền tảng EduBranch AI."
        confirmLabel="Lưu & Áp dụng"
        cancelLabel="Hủy bỏ"
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}
