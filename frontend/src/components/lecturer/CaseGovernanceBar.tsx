/**
 * CaseGovernanceBar & PublishModal
 * Figma Specs:
 * - 03.6: Thanh duyệt Case Study (4 trạng thái: Bản nháp -> Đã rà soát -> Đã phê duyệt -> Đã xuất bản)
 * - 03.7: Hộp thoại phê duyệt và xuất bản (Direct link, deadline, in-app/email notice)
 */
import React, { useState } from "react";

export type GovernanceStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

interface CaseGovernanceBarProps {
  status: GovernanceStatus;
  mode?: "BRANCHING_STUDY" | "REVIEW_STUDY";
  version?: string;
  directLink?: string;
  saving?: boolean;
  onSaveReviewed: () => void;
  onSaveDraft: () => void;
  onApprove: () => void;
  onConfirmPublish: (deadline?: string) => void;
  onRevertToDraft: () => void;
}

export function CaseGovernanceBar({
  status,
  mode = "BRANCHING_STUDY",
  version = "1",
  directLink = "edubranch.duytan.edu.vn/student/cases/c8f9a2/branching-play",
  saving = false,
  onSaveReviewed,
  onSaveDraft,
  onApprove,
  onConfirmPublish,
  onRevertToDraft,
}: CaseGovernanceBarProps) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(directLink);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  }

  const modeLabel = mode === "BRANCHING_STUDY" ? "Branching Study" : "Review Study";

  return (
    <>
      {/* ── Copied Toast Notification ── */}
      {copiedToast && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-xl flex items-center gap-2">
          <span>✓</span>
          <span>Đã sao chép đường dẫn bài làm của sinh viên!</span>
        </div>
      )}

      {/* ── Fixed Bottom Bar (Figma 03.6) ── */}
      <div className="fixed bottom-0 left-[230px] right-0 z-40 bg-white border-t border-slate-200 px-8 py-3.5 shadow-lg flex items-center justify-between">
        {/* Left Action Button */}
        <div>
          {status === "DRAFT" && (
            <button
              onClick={onSaveReviewed}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-2xs"
            >
              {saving ? "Đang lưu..." : "Lưu & đánh dấu đã rà soát"}
            </button>
          )}

          {status === "REVIEWED" && (
            <button
              onClick={onSaveDraft}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-2xs"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          )}

          {status === "APPROVED" && (
            <button
              onClick={onRevertToDraft}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition shadow-2xs"
            >
              Trả về bản nháp
            </button>
          )}

          {status === "PUBLISHED" && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Đang mở cho sinh viên tham gia</span>
            </div>
          )}
        </div>

        {/* Center: Stepper 4 bước (Bản nháp -> Đã rà soát -> Đã phê duyệt -> Đã xuất bản) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 text-xs font-bold">
            {/* Step 1: Bản nháp */}
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A8A] text-white text-[10px]">
                {status === "DRAFT" ? "1" : "✓"}
              </span>
              <span className="text-[#1E3A8A]">Bản nháp</span>
            </div>
            <span className={`h-0.5 w-6 ${status !== "DRAFT" ? "bg-[#1E3A8A]" : "bg-slate-200"}`} />

            {/* Step 2: Đã rà soát */}
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  status === "DRAFT"
                    ? "bg-slate-200 text-slate-500"
                    : status === "REVIEWED"
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-[#1E3A8A] text-white"
                }`}
              >
                {status === "DRAFT" ? "2" : status === "REVIEWED" ? "2" : "✓"}
              </span>
              <span className={status !== "DRAFT" ? "text-[#1E3A8A]" : "text-slate-400"}>
                Đã rà soát
              </span>
            </div>
            <span className={`h-0.5 w-6 ${status === "APPROVED" || status === "PUBLISHED" ? "bg-[#1E3A8A]" : "bg-slate-200"}`} />

            {/* Step 3: Đã phê duyệt */}
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  status === "APPROVED"
                    ? "bg-[#1E3A8A] text-white"
                    : status === "PUBLISHED"
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {status === "PUBLISHED" ? "✓" : "3"}
              </span>
              <span
                className={
                  status === "APPROVED" || status === "PUBLISHED"
                    ? "text-[#1E3A8A]"
                    : "text-slate-400"
                }
              >
                Đã phê duyệt
              </span>
            </div>
            <span className={`h-0.5 w-6 ${status === "PUBLISHED" ? "bg-emerald-600" : "bg-slate-200"}`} />

            {/* Step 4: Đã xuất bản */}
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  status === "PUBLISHED"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {status === "PUBLISHED" ? "✓" : "4"}
              </span>
              <span className={status === "PUBLISHED" ? "text-emerald-700" : "text-slate-400"}>
                Đã xuất bản
              </span>
            </div>
          </div>

          {/* Subtitle based on state (Figma 03.6) */}
          <span className="text-[10px] text-slate-400 mt-1">
            {status === "DRAFT" && `${modeLabel} · Phiên bản ${version} · Đã lưu nháp tự động`}
            {status === "REVIEWED" && `${modeLabel} · Phiên bản ${version} · Chờ phê duyệt`}
            {status === "APPROVED" && `${modeLabel} · Phiên bản ${version} · Sẵn sàng xuất bản`}
            {status === "PUBLISHED" && `${modeLabel} · Phiên bản ${version} · Sinh viên đã truy cập được`}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {status === "DRAFT" && (
            <>
              <button
                disabled
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-300 cursor-not-allowed"
              >
                Phê duyệt
              </button>
              <button
                disabled
                className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
              >
                Xuất bản
              </button>
            </>
          )}

          {status === "REVIEWED" && (
            <>
              <button
                onClick={onApprove}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#1E3A8A] hover:bg-slate-50 cursor-pointer transition shadow-2xs"
              >
                Phê duyệt
              </button>
              <button
                disabled
                className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
              >
                Xuất bản
              </button>
            </>
          )}

          {status === "APPROVED" && (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white hover:bg-[#172554] cursor-pointer transition shadow-xs"
            >
              Xuất bản cho sinh viên
            </button>
          )}

          {status === "PUBLISHED" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white hover:bg-[#172554] cursor-pointer transition shadow-xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Sao chép đường dẫn</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 03.7 Modal Xuất bản Case Study ── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Xuất bản Case Study</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Sau khi xuất bản, sinh viên mở được tình huống này qua đường dẫn bên dưới. Gửi đường dẫn cho lớp qua LMS, email hoặc trên lớp.
                </p>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                ✕
              </button>
            </div>

            {/* Field 1: Đường dẫn cho sinh viên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đường dẫn cho sinh viên
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700">
                <span className="truncate flex-1">{directLink}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer flex-shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Sao chép</span>
                </button>
              </div>
            </div>

            {/* Field 2: Hạn hoàn thành */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hạn hoàn thành (không bắt buộc)
              </label>
              <input
                type="text"
                defaultValue="30/11/2026, 23:59"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
              />
            </div>

            {/* Checkbox: Gửi thông báo */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="notice-checkbox"
                defaultChecked
                className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
              <label htmlFor="notice-checkbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                Gửi thông báo in-app và email cho sinh viên trong lớp
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmPublish("30/11/2026, 23:59");
                  setIsPublishModalOpen(false);
                }}
                className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172554] cursor-pointer transition shadow-xs"
              >
                Xác nhận xuất bản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

