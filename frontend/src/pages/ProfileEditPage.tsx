import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const EDUCATION_LEVELS = [
  "Trung học phổ thông",
  "Đại học",
  "Sau đại học",
  "Sau đại học chuyên sâu",
  "Tự học",
  "Chuyên nghiệp",
];

const PRESET_SUBJECTS = [
  "Toán học",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Khoa học máy tính",
  "Lịch sử",
  "Tiếng Anh",
  "Kinh tế",
  "Tâm lý học",
  "Kỹ thuật",
  "Y học",
  "Luật",
  "Kinh doanh",
  "Nghệ thuật & Thiết kế",
  "Thống kê",
  "Triết học",
];

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  // Initial values from user or sensible mock defaults matching design screenshot
  const initialName = user?.fullName || "Hoàng Nam";
  const initialEmail = user?.email || "hoangnam01012005@gmail.com";

  const [displayName, setDisplayName] = useState(initialName);
  const [educationLevel, setEducationLevel] = useState("Chuyên nghiệp");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Toán",
    "Vật Lý",
  ]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );

  // Sync state if user changes in authStore
  useEffect(() => {
    if (user?.fullName) {
      setDisplayName(user.fullName);
    }
    if (user?.avatarUrl) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [user?.fullName, user?.avatarUrl]);

  // Extract avatar initial
  const initialLetter = (displayName.trim()[0] || "N").toUpperCase();

  function handleAddPresetSubject(subj: string) {
    if (!selectedSubjects.includes(subj)) {
      setSelectedSubjects([...selectedSubjects, subj]);
      setIsSaved(false);
    }
  }

  function handleRemoveSubject(subj: string) {
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
    setIsSaved(false);
  }

  function handleAddCustomSubject(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects([...selectedSubjects, trimmed]);
      setCustomSubjectInput("");
      setIsSaved(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize to max 256x256 for fast storage in localStorage
          const canvas = document.createElement("canvas");
          const maxDim = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
            setAvatarPreview(dataUrl);
            setIsSaved(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      const finalName = displayName.trim() || initialName;
      const finalAvatar = avatarPreview || user?.avatarUrl;

      if (user) {
        setUser({
          ...user,
          fullName: finalName,
          avatarUrl: finalAvatar,
        });
      } else {
        // Fallback demo user
        setUser({
          id: "demo-user-id",
          fullName: finalName,
          email: initialEmail,
          role: "LECTURER",
          avatarUrl: finalAvatar,
        });
      }

      setIsSaving(false);
      setIsSaved(true);

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsSaved(false);
      }, 4000);
      return () => clearTimeout(timer);
    }, 350);
  }

  return (
    <div className="relative max-w-2xl mx-auto py-4 px-4 sm:px-6 space-y-6">
      {/* ── Fixed Floating Toast: Đã thay đổi thành công ── */}
      {isSaved && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-emerald-300 text-slate-800 shadow-xl shadow-emerald-900/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#059669] shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="pr-2">
            <p className="text-xs font-bold text-emerald-950">Thông báo</p>
            <p className="text-xs text-slate-600 font-medium">
              Đã thay đổi thông tin hồ sơ thành công!
            </p>
          </div>
          <button
            onClick={() => setIsSaved(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer text-xs"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Header Bar with Back Button ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Quay lại</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Chỉnh sửa Hồ sơ
        </h1>
      </div>

      {/* ── Avatar Circle with Camera Badge ── */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1">
        <div className="relative group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl font-bold shadow-md select-none">
              {initialLetter}
            </div>
          )}

          {/* Camera Badge Icon Button */}
          <label
            htmlFor="avatar-upload-input"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-105"
            title="Đổi ảnh đại diện"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </label>
          <input
            id="avatar-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* ── Profile Edit Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Tên hiển thị */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-2">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800">
            Tên hiển thị
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Tên của bạn"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#059669] transition"
          />
        </div>

        {/* 2. Email (Disabled) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-1.5">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800">
            Email
          </label>
          <input
            type="email"
            value={initialEmail}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 text-xs sm:text-sm cursor-not-allowed select-none"
          />
          <p className="text-[11px] text-slate-400">Email không thể thay đổi</p>
        </div>

        {/* 3. Trình độ học vấn */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800">
            Trình độ học vấn
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {EDUCATION_LEVELS.map((level) => {
              const isSelected = educationLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setEducationLevel(level);
                    setIsSaved(false);
                  }}
                  className={`
                    py-2.5 px-3 rounded-xl text-xs font-medium transition cursor-pointer text-center
                    ${
                      isSelected
                        ? "border border-[#10B981] bg-emerald-50/60 text-[#059669] font-semibold shadow-2xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }
                  `}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Các môn học quan tâm */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3.5">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800">
            Các môn học quan tâm
          </label>

          {/* Preset Cloud */}
          <div className="flex flex-wrap gap-2">
            {PRESET_SUBJECTS.map((subj) => {
              const isPicked = selectedSubjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => handleAddPresetSubject(subj)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer
                    ${
                      isPicked
                        ? "border border-emerald-300 bg-emerald-50/40 text-[#059669]"
                        : "border border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }
                  `}
                >
                  {subj}
                </button>
              );
            })}
          </div>

          {/* Selected Tags list */}
          {selectedSubjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {selectedSubjects.map((subj) => (
                <span
                  key={subj}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-[#059669] border border-emerald-200"
                >
                  <span>{subj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subj)}
                    className="hover:text-rose-600 cursor-pointer text-slate-400 hover:bg-emerald-100/50 rounded-full p-0.5"
                    title="Xóa môn học"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Custom Subject Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customSubjectInput}
              onChange={(e) => setCustomSubjectInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSubject();
                }
              }}
              placeholder="Thêm môn học tùy chỉnh..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-[#059669] transition"
            />
            <button
              type="button"
              onClick={() => handleAddCustomSubject()}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#059669] hover:text-[#059669] text-xs font-semibold text-slate-600 transition cursor-pointer"
            >
              Thêm
            </button>
          </div>
        </div>

        {/* ── Inline Feedback Notification (vị trí ngay trên nút Lưu) ── */}
        {isSaved && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-[#059669] shrink-0"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Đã thay đổi thông tin hồ sơ thành công!</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSaved(false)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        )}

        {/* 5. Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className={`
              w-full py-3.5 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2
              ${
                isSaved
                  ? "bg-[#059669] hover:bg-[#047857]"
                  : "bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857]"
              }
              ${isSaving ? "opacity-80 cursor-wait" : ""}
            `}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Đang lưu thay đổi...</span>
              </>
            ) : isSaved ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Đã thay đổi thành công!</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
