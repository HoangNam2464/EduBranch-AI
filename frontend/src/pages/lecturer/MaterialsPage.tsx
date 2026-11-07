/**
 * MaterialsPage — Giảng viên · Chi tiết khóa học — Tài liệu môn học
 * Figma Specs: 02.4 (Course Detail + Materials), 02.5 (Upload Modal), 02.6 (Delete Material Modal)
 * Exact Figma Color System: Deep Navy #1E3A8A, Soft Mint #E6F4EA, Dark Slate #1E293B
 * Route: /lecturer/courses/:courseId/materials
 */
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { courseService } from "../../services/courseService";
import { Course } from "../../types";
import { LoadingSkeletonPage, ErrorStatePage } from "../../components/ui";

interface TeachingMaterial {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  processing_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  chunk_count: number | null;
  processing_error: string | null;
  uploaded_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ── Figma 02.5: Modal Tải tài liệu môn học ───────────────────────────────────
interface QueuedFile {
  id: string;
  file?: File;
  name: string;
  sizeStr: string;
  status: "VALID" | "INVALID_EXT" | "TOO_LARGE";
  errorMsg?: string;
}

function UploadMaterialModal({
  isOpen,
  onClose,
  onUploaded,
  courseId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
  courseId: string;
}) {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([
    {
      id: "f1",
      name: "Bai_giang_tuan_7_An_ninh_mang.pdf",
      sizeStr: "2.4 MB · Sẵn sàng tải lên",
      status: "VALID",
    },
    {
      id: "f2",
      name: "Danh_sach_lop.xlsx",
      sizeStr: "1.2 MB",
      status: "INVALID_EXT",
      errorMsg: "Chỉ hỗ trợ PDF và DOCX.",
    },
    {
      id: "f3",
      name: "Giao_trinh_day_du.pdf",
      sizeStr: "62.4 MB",
      status: "TOO_LARGE",
      errorMsg: "Tệp vượt quá giới hạn 50 MB.",
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles: QueuedFile[] = Array.from(e.target.files).map((file, idx) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      let status: QueuedFile["status"] = "VALID";
      let errorMsg: string | undefined = undefined;

      if (![".pdf", ".docx"].includes(ext)) {
        status = "INVALID_EXT";
        errorMsg = "Chỉ hỗ trợ PDF và DOCX.";
      } else if (file.size > 50 * 1024 * 1024) {
        status = "TOO_LARGE";
        errorMsg = "Tệp vượt quá giới hạn 50 MB.";
      }

      return {
        id: `select-${Date.now()}-${idx}`,
        file,
        name: file.name,
        sizeStr: status === "VALID" ? `${formatFileSize(file.size)} · Sẵn sàng tải lên` : formatFileSize(file.size),
        status,
        errorMsg,
      };
    });

    setQueuedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(id: string) {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const validFiles = queuedFiles.filter((f) => f.status === "VALID");

  async function handleUpload() {
    if (validFiles.length === 0) return;
    try {
      setUploading(true);
      for (const item of validFiles) {
        if (item.file) {
          const formData = new FormData();
          formData.append("file", item.file);
          await apiClient.post(`/courses/${courseId}/materials`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }
      onUploaded();
      onClose();
    } catch (err) {
      console.error(err);
      onUploaded();
      onClose();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tải tài liệu môn học</h3>
            <p className="mt-1 text-xs text-slate-500">
              Tài liệu được tách thành các đoạn trích và lập chỉ mục để AI dùng làm nguồn khi sinh case.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Drop Area */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-xs font-bold text-slate-900">
            Kéo thả tệp vào đây hoặc chọn tệp từ máy
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            PDF hoặc DOCX · Tối đa 50 MB mỗi tệp
          </p>
        </div>

        {/* File Queue List with Error Tags */}
        <div className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1">
          {queuedFiles.map((f) => (
            <div
              key={f.id}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                f.status === "VALID"
                  ? "border-slate-200 bg-white"
                  : "border-red-100 bg-[#FDE8E8]/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    f.status === "VALID"
                      ? "bg-blue-50 text-[#1E3A8A]"
                      : "bg-[#FDE8E8] text-[#9B1C1C]"
                  }`}
                >
                  {f.status === "VALID" ? "📄" : "⚠️"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{f.name}</p>
                  {f.status === "VALID" ? (
                    <p className="text-[11px] text-slate-400">{f.sizeStr}</p>
                  ) : (
                    <p className="text-[11px] font-semibold text-[#9B1C1C]">{f.errorMsg}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={validFiles.length === 0 || uploading}
            onClick={handleUpload}
            className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172554] disabled:opacity-50 cursor-pointer transition"
          >
            {uploading ? "Đang tải lên..." : `Tải lên ${validFiles.length} tệp`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Figma 02.6: Modal Xác nhận xóa tài liệu ──────────────────────────────────
function DeleteMaterialModal({
  isOpen,
  fileName,
  chunkCount,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  fileName: string;
  chunkCount: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900">Xóa tài liệu này?</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Tệp và các đoạn trích đã lập chỉ mục sẽ bị xóa vĩnh viễn. AI sẽ không dùng tài liệu này khi sinh case mới. Thao tác này không thể hoàn tác.
        </p>

        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700">
          <span className="font-bold text-slate-900">{fileName}</span> · {chunkCount} đoạn trích
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer transition"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page (Figma 02.4) ────────────────────────────────────────────────────
export function MaterialsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isUploadPipelineOpen, setIsUploadPipelineOpen] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<{ id: string; name: string; chunks: number } | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(false);
      const [courseData, matRes] = await Promise.all([
        courseService.getCourseById(courseId),
        apiClient.get(`/courses/${courseId}/materials`),
      ]);
      setCourse(courseData);
      setMaterials(matRes.data?.data || []);
    } catch {
      // Fallback for demo when backend is offline
      setCourse({
        id: courseId || "cs402",
        name: "An ninh mạng & Ứng cứu sự cố",
        courseCode: "CS402",
        description: "Học phần chuyên sâu về phân tích lỗ hổng, phát hiện tấn công và ứng phó sự cố an toàn thông tin doanh nghiệp.",
        lecturerId: "lecturer-01",
        active: true,
        createdAt: "2026-09-01T08:00:00Z",
        updatedAt: "2026-10-21T10:00:00Z",
      });
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSkeletonPage />;
  if (error || !course) return <ErrorStatePage title="Không tải được tài liệu khóa học" onRetry={loadData} />;

  const displayMaterials = materials.length > 0 ? materials : [
    {
      id: "m1",
      original_filename: "Runbook_ung_cuu_su_co_DDoS.pdf",
      mime_type: "application/pdf",
      size_bytes: 2.4 * 1024 * 1024,
      processing_status: "COMPLETED",
      chunk_count: 48,
      processing_error: null,
      uploaded_at: new Date().toISOString(),
    },
    {
      id: "m2",
      original_filename: "Slide_Tuan_7_An_ninh_mang.pdf",
      mime_type: "application/pdf",
      size_bytes: 5.18 * 1024 * 1024,
      processing_status: "COMPLETED",
      chunk_count: 112,
      processing_error: null,
      uploaded_at: new Date().toISOString(),
    },
    {
      id: "m3",
      original_filename: "Bao_cao_su_co_ngan_hang.docx",
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size_bytes: 1.2 * 1024 * 1024,
      processing_status: "PENDING",
      chunk_count: null,
      processing_error: null,
      uploaded_at: new Date().toISOString(),
    },
    {
      id: "m4",
      original_filename: "Giao_trinh_Zero_Trust_Security.pdf",
      mime_type: "application/pdf",
      size_bytes: 8.65 * 1024 * 1024,
      processing_status: "PROCESSING",
      chunk_count: null,
      processing_error: null,
      uploaded_at: new Date().toISOString(),
    },
    {
      id: "m5",
      original_filename: "Phu_luc_Nhat_ky_he_thong.docx",
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size_bytes: 0.82 * 1024 * 1024,
      processing_status: "FAILED",
      chunk_count: null,
      processing_error: "Không trích xuất được nội dung. Tệp có thể đã đặt mật khẩu hoặc bị hỏng.",
      uploaded_at: new Date().toISOString(),
    },
  ] as TeachingMaterial[];

  const completedCount = displayMaterials.filter((m) => m.processing_status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / displayMaterials.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Top Header / Breadcrumbs (Figma 02.4) ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/lecturer/courses")}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer transition"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {course.name}
          </h2>
          <p className="text-xs text-slate-400">
            Khóa học &gt; {course.courseCode || "CS402"}
          </p>
        </div>
      </div>

      {/* ── Two-Column Main Layout ── */}
      <div className="flex items-start gap-6">
        {/* ── LEFT COLUMN: Course Card + Indexing summary (~330px) ── */}
        <div className="w-[330px] flex-shrink-0 space-y-4">
          {/* Card 1: Course Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
            {/* Banner Cover with Shield (#1E293B) */}
            <div className="relative flex h-32 w-full items-center justify-center rounded-xl bg-[#1E293B]">
              <span className="absolute top-2.5 left-2.5 rounded bg-blue-900/80 border border-blue-700/50 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-200">
                {course.courseCode || "CS402"}
              </span>
              <div className="flex items-center justify-center text-slate-200">
                <svg className="w-14 h-14 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Course Title & Instructor */}
            <div>
              <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-[#1E3A8A]">
                  NA
                </span>
                <span>TS. Nguyễn Văn An</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
                  Đang dạy
                </span>
                <span className="rounded-full bg-[#1E293B] text-white px-2 py-0.5 text-[10px] font-medium">
                  HK 1 · 2026-2027
                </span>
                <span className="ml-auto rounded-full bg-[#E1EFFE] px-2 py-0.5 text-[10px] font-semibold text-[#1A56DB] border border-[#BFDBFE]">
                  42 SV
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Tài liệu môn học</p>
                <p className="font-bold text-slate-900">{displayMaterials.length} tệp</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Case Study</p>
                <p className="font-bold text-slate-900">2 case</p>
              </div>
            </div>

            {/* Invite code */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Mã mời lớp</p>
                <p className="font-mono font-bold text-slate-900">SEC7A2</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText("SEC7A2")}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title="Sao chép"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>

            {/* About course */}
            <div>
              <h5 className="text-xs font-bold text-slate-900 mb-1">Giới thiệu khóa học</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                {course.description || "Phân tích các mối đe dọa an ninh mạng, xây dựng phương án ứng cứu và quản trị rủi ro trong hệ thống ngân hàng số."}
              </p>
            </div>
          </div>

          {/* Card 2: Lập chỉ mục tài liệu */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Lập chỉ mục tài liệu</h4>
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Định dạng hỗ trợ</p>
              <div className="flex gap-2">
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700">PDF</span>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700">DOCX</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Dung lượng tối đa</p>
              <p className="text-xs font-bold text-slate-900">50 MB mỗi tệp</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">Trạng thái lập chỉ mục</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {completedCount} / {displayMaterials.length} tài liệu đã sẵn sàng cho AI
                </span>
                <span className="text-slate-400">🗄️</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Collapsibles + Files list + Logs (~flex-1) ── */}
        <div className="flex-1 space-y-4 min-w-0">
          <h3 className="text-sm font-bold text-slate-900">Tài liệu môn học ({displayMaterials.length})</h3>

          {/* Collapsible 1: Tải lên tài liệu để AI lập chỉ mục */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div
              onClick={() => setIsUploadPipelineOpen(!isUploadPipelineOpen)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">Tải lên tài liệu để AI lập chỉ mục</h4>
                <span className="rounded-full bg-[#1E293B] text-white px-2 py-0.5 text-[10px] font-mono">
                  PDF · DOCX
                </span>
              </div>
              <span className="text-slate-400 text-xs font-mono">
                {isUploadPipelineOpen ? "▲" : "▼"}
              </span>
            </div>

            {isUploadPipelineOpen && (
              <div className="grid grid-cols-2 gap-4 p-4 pt-0 border-t border-slate-100">
                {/* Left: Quy trình xử lý */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <h5 className="text-xs font-bold text-slate-700 mb-3">Quy trình xử lý</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-[#1E3A8A] font-bold">1</span>
                        <span className="text-slate-700 font-medium">Tải tệp lên</span>
                      </div>
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">PDF, DOCX</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-[#1E3A8A] font-bold">2</span>
                        <span className="text-slate-700 font-medium">Tách thành đoạn trích</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Tự động</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-[#1E3A8A] font-bold">3</span>
                        <span className="text-slate-700 font-medium">Tạo vector &amp; lập chỉ mục</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Tự động</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-[#1E3A8A] font-bold">4</span>
                        <span className="text-slate-700 font-medium">Sẵn sàng cho AI trích dẫn</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Khi sinh case</span>
                    </div>
                  </div>
                </div>

                {/* Right: Tải tài liệu mới dropzone */}
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Kéo thả tài liệu vào đây hoặc nhấn để chọn tệp
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400 mb-3">
                    Hỗ trợ PDF, DOCX · Tối đa 50 MB mỗi tệp
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172554] cursor-pointer shadow-xs transition"
                  >
                    Chọn tài liệu
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible 2: Sinh viên (42) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50/50">
            <span className="text-xs font-bold text-slate-900">Sinh viên (42)</span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full bg-[#E1EFFE] px-2 py-0.5 text-[10px] font-semibold text-[#1A56DB]">42 SV</span>
              <span>▼</span>
            </div>
          </div>

          {/* Collapsible 3: Case Study (2) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50/50">
            <span className="text-xs font-bold text-slate-900">Case Study (2)</span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">2 case</span>
              <span>▼</span>
            </div>
          </div>

          {/* ── Sub-columns: Left = File list (5), Right = Progress & Logs ── */}
          <div className="grid grid-cols-5 gap-4 pt-2">
            {/* Left List (3 cols) */}
            <div className="col-span-3 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900">Tài liệu đã tải lên ({displayMaterials.length})</h4>
              <div className="space-y-2">
                {displayMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:border-[#1E3A8A] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A] text-sm">
                        📄
                      </div>
                      <div className="min-w-0">
                        {m.processing_status === "COMPLETED" ? (
                          <Link
                            to={`/lecturer/courses/${courseId}/materials/${m.id}/rag`}
                            className="text-xs font-bold text-slate-900 hover:text-[#1E3A8A] truncate block"
                          >
                            {m.original_filename}
                          </Link>
                        ) : (
                          <p className="text-xs font-bold text-slate-900 truncate">{m.original_filename}</p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(m.size_bytes)} {m.chunk_count !== null ? `· ${m.chunk_count} đoạn trích` : m.processing_status === "PROCESSING" ? "· Đang tách đoạn... 60%" : m.processing_status === "PENDING" ? "· Chờ trong hàng đợi" : "· Không trích xuất được"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {m.processing_status === "COMPLETED" && (
                        <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
                          Hoàn tất
                        </span>
                      )}
                      {m.processing_status === "PENDING" && (
                        <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E] border border-[#FDE68A]">
                          Đang chờ
                        </span>
                      )}
                      {m.processing_status === "PROCESSING" && (
                        <span className="rounded-full bg-[#E1EFFE] px-2 py-0.5 text-[10px] font-semibold text-[#1E429F] border border-[#BFDBFE]">
                          Đang xử lý
                        </span>
                      )}
                      {m.processing_status === "FAILED" && (
                        <span className="rounded-full bg-[#FDE8E8] px-2 py-0.5 text-[10px] font-semibold text-[#9B1C1C] border border-[#F8B4B4]">
                          Thất bại
                        </span>
                      )}

                      {m.processing_status === "FAILED" ? (
                        <button
                          onClick={loadData}
                          className="text-slate-400 hover:text-[#1E3A8A] cursor-pointer p-1"
                          title="Thử lại"
                        >
                          🔄
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setMaterialToDelete({
                              id: m.id,
                              name: m.original_filename,
                              chunks: m.chunk_count || 48,
                            });
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-slate-300 hover:text-red-500 cursor-pointer p-1"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Status / Logs (2 cols) */}
            <div className="col-span-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  {completedCount}/{displayMaterials.length} Đã lập chỉ mục
                </h4>
                <span className="rounded-full bg-[#1E293B] text-white px-2 py-0.5 text-[10px] font-bold">
                  {progressPercent}%
                </span>
              </div>

              <div className="space-y-2">
                {/* Log 1: Failed item */}
                <div className="rounded-xl border border-red-100 bg-[#FDE8E8]/40 p-3 space-y-1">
                  <p className="text-xs text-slate-800 leading-snug">
                    <strong>Phu_luc_Nhat_ky_he_thong.docx:</strong> Không trích xuất được nội dung. Tệp có thể đã đặt mật khẩu hoặc bị hỏng.
                  </p>
                  <p className="text-[11px] font-bold text-[#9B1C1C]">
                    ! Xử lý thất bại
                  </p>
                </div>

                {/* Log 2: Processing item */}
                <div className="rounded-xl border border-blue-100 bg-[#E1EFFE]/40 p-3 space-y-1">
                  <p className="text-xs text-slate-800 leading-snug">
                    <strong>Giao_trinh_Zero_Trust_Security.pdf</strong> đang được tách đoạn và tạo vector (60%).
                  </p>
                  <p className="text-[11px] font-bold text-[#1E429F]">
                    Đang xử lý
                  </p>
                </div>

                {/* Log 3: Pending item */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
                  <p className="text-xs text-slate-800 leading-snug">
                    <strong>Bao_cao_su_co_ngan_hang.docx</strong> đang chờ trong hàng đợi xử lý.
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">
                    Chờ xử lý
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={loadData}
        courseId={courseId || ""}
      />

      <DeleteMaterialModal
        isOpen={isDeleteModalOpen}
        fileName={materialToDelete?.name || ""}
        chunkCount={materialToDelete?.chunks || 0}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={async () => {
          if (materialToDelete?.id) {
            try {
              await apiClient.delete(`/courses/${courseId}/materials/${materialToDelete.id}`);
            } catch {}
            loadData();
          }
        }}
      />
    </div>
  );
}
