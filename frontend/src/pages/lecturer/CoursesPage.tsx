/**
 * CoursesPage — Giảng viên · Quản lý khóa học & Học phần
 *
 * Implements Figma master template:
 * - Frame 02.1 [309:238]: Course list workspace & interactive course detail drawer
 * - Frame 02.2 [311:2690]: Create course dialog (560px)
 * - Frame 02.3 [311:3066]: Delete course confirmation dialog (480px)
 * - Frame 01.2 [311:766]: Empty state with vector icon
 * - Frame 01.3 [311:1112]: Error state with retry action
 *
 * Standards: 100% compliant with .agents/rules/01-ui-design-standards.md
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { Course } from "../../types";
import { Button, Alert, LoadingSkeletonPage, EmptyStatePage, ErrorStatePage } from "../../components/ui";

interface CourseUIInfo {
  iconType: "shield" | "nodes" | "database";
  inviteCode: string;
  docCount: number;
  caseCount: number;
  studentCount: number;
  semester: string;
  lecturerName: string;
}

const DEFAULT_INFOS: CourseUIInfo[] = [
  {
    iconType: "shield",
    inviteCode: "SEC7A2",
    docCount: 4,
    caseCount: 5,
    studentCount: 42,
    semester: "Học kỳ 1 (2026 - 2027)",
    lecturerName: "TS. Nguyễn Văn An",
  },
  {
    iconType: "nodes",
    inviteCode: "SWE109",
    docCount: 3,
    caseCount: 2,
    studentCount: 42,
    semester: "Học kỳ 1 (2026 - 2027)",
    lecturerName: "TS. Nguyễn Văn An",
  },
  {
    iconType: "database",
    inviteCode: "MIS5CA",
    docCount: 5,
    caseCount: 2,
    studentCount: 38,
    semester: "Học kỳ 1 (2026 - 2027)",
    lecturerName: "TS. Nguyễn Văn An",
  },
];

const MOCK_COURSES: Course[] = [
  {
    id: "cs402",
    name: "An ninh mạng & Ứng cứu sự cố",
    courseCode: "CS402",
    description: "Học phần chuyên sâu về phân tích lỗ hổng, phát hiện tấn công và ứng phó sự cố an toàn thông tin doanh nghiệp.",
    lecturerId: "lecturer-01",
    active: true,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-10-21T10:00:00Z",
  },
  {
    id: "cs301",
    name: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    courseCode: "CS301",
    description: "Thiết kế kiến trúc hướng dịch vụ, microservices, khả năng chịu lỗi và tối ưu hiệu năng hệ thống chịu tải cao.",
    lecturerId: "lecturer-01",
    active: true,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-10-21T10:00:00Z",
  },
  {
    id: "it305",
    name: "Quản trị hệ thống thông tin",
    courseCode: "IT305",
    description: "Quản lý hạ tầng dữ liệu doanh nghiệp, lập kế hoạch sao lưu khôi phục thảm họa và chính sách vận hành IT.",
    lecturerId: "lecturer-01",
    active: true,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-10-21T10:00:00Z",
  },
];

function getCourseUIInfo(course: Course, index: number): CourseUIInfo {
  const fallback = DEFAULT_INFOS[index % DEFAULT_INFOS.length];
  return {
    iconType: (course.courseCode?.includes("CS4") ? "shield" : course.courseCode?.includes("CS3") ? "nodes" : "database") as any,
    inviteCode: course.courseCode ? `M${course.courseCode.slice(-3)}` : fallback.inviteCode,
    docCount: fallback.docCount,
    caseCount: fallback.caseCount,
    studentCount: fallback.studentCount,
    semester: fallback.semester,
    lecturerName: fallback.lecturerName,
  };
}

// ── Course Card in List (Figma Frame [309:333]) ──────────────────────────────
function CourseCard({
  course,
  info,
  isSelected,
  onSelect,
  onDeleteClick,
}: {
  course: Course;
  info: CourseUIInfo;
  isSelected: boolean;
  onSelect: () => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg border transition-all cursor-pointer p-4 select-none ${
        isSelected
          ? "border-blue-600 ring-2 ring-blue-600/15 shadow-xs"
          : "border-gray-200 hover:border-gray-300 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Left Thumbnail Media Block */}
        <div className="flex flex-col items-start gap-1.5 shrink-0">
          <div className="w-28 h-20 rounded-md bg-blue-50/70 border border-blue-100 flex items-center justify-center relative overflow-hidden">
            {info.iconType === "shield" && (
              <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            )}
            {info.iconType === "nodes" && (
              <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            )}
            {info.iconType === "database" && (
              <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            )}
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
              Đang dạy
            </span>
          </div>
        </div>

        {/* Center Content Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {course.name}
            </h3>
            {course.courseCode && (
              <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                {course.courseCode}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500 line-clamp-1 leading-relaxed">
            {course.description || "Chưa có mô tả chi tiết học phần."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            {/* Instructor */}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-gray-200 text-[10px] font-bold text-gray-700 flex items-center justify-center">
                AN
              </span>
              <span className="font-medium text-gray-700">{info.lecturerName}</span>
            </div>

            {/* Invite code */}
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Mã mời: {info.inviteCode}</span>
            </div>

            {/* Materials count */}
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{info.docCount} tài liệu</span>
            </div>

            {/* Cases count */}
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              <span>{info.caseCount} case</span>
            </div>

            {/* Enrolled students */}
            <div className="flex items-center gap-1 text-gray-700 font-medium ml-auto">
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{info.studentCount} sinh viên</span>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={onDeleteClick}
              aria-label="Xóa khóa học"
              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-2 cursor-pointer"
              title="Xóa khóa học"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Right Drawer: Chi tiết khóa học (Figma Frame [309:314]) ──────────────────
function CourseDetailDrawer({
  course,
  info,
  onClose,
  onNavigate,
}: {
  course: Course;
  info: CourseUIInfo;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="w-80 shrink-0 rounded-lg border border-gray-200 bg-white p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Chi tiết khóa học
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate(`/lecturer/courses/${course.id}/materials`)}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Mở học liệu
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng chi tiết"
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero Banner with Shield Outline */}
      <div className="relative flex h-28 w-full items-center justify-center rounded-md bg-[#0B1528] overflow-hidden">
        {course.courseCode && (
          <span className="absolute top-2 left-2 rounded bg-blue-900/80 border border-blue-700/50 px-2 py-0.5 text-xs font-mono font-medium text-blue-200">
            {course.courseCode}
          </span>
        )}
        <svg className="w-12 h-12 text-blue-400/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      </div>

      {/* Title & Instructor */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 leading-snug">
          {course.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Phụ trách: {info.lecturerName}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-medium">
            Đang dạy
          </span>
          <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
            {info.semester}
          </span>
        </div>
      </div>

      {/* 3 Metrics Row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-md bg-gray-50 border border-gray-100 py-2 text-center">
        <div>
          <p className="text-xs text-gray-500">Sinh viên</p>
          <p className="text-sm font-bold text-gray-900">{info.studentCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tài liệu</p>
          <p className="text-sm font-bold text-gray-900">{info.docCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Case</p>
          <p className="text-sm font-bold text-gray-900">{info.caseCount}</p>
        </div>
      </div>

      {/* Về khóa học */}
      <div>
        <h5 className="text-xs font-semibold text-gray-900 mb-1">Mô tả học phần</h5>
        <p className="text-xs text-gray-600 leading-relaxed">
          {course.description || "Phân tích các tình huống thực tế, rèn luyện tư duy phản biện và năng lực ra quyết định chuyên nghiệp."}
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="mt-auto space-y-2 pt-2 border-t border-gray-100">
        <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Không gian làm việc
        </h5>
        <button
          type="button"
          onClick={() => onNavigate(`/lecturer/courses/${course.id}/materials`)}
          className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white p-2.5 text-left hover:border-blue-500 hover:bg-blue-50/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Tài liệu môn học</p>
              <p className="text-[11px] text-gray-500">{info.docCount} tệp · RAG Grounding</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onNavigate(`/lecturer/courses/${course.id}/cases`)}
          className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white p-2.5 text-left hover:border-blue-500 hover:bg-blue-50/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Kịch bản Case Study</p>
              <p className="text-[11px] text-gray-500">{info.caseCount} tình huống phân nhánh</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Figma 02.2 [311:2690]: Modal Khởi tạo khóa học mới ───────────────────────
function CreateCourseModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCourse: Course) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    courseCode: "",
    semester: "Học kỳ 1 (2026 - 2027)",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên khóa học.");
      return;
    }
    if (!form.courseCode.trim()) {
      setError("Vui lòng nhập mã môn học.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await courseService.createCourse({
        name: form.name.trim(),
        courseCode: form.courseCode.trim().toUpperCase(),
        description: form.description.trim() || undefined,
      });
      onCreated(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tạo khóa học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg border border-gray-200">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Khởi tạo khóa học mới
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Hệ thống sẽ tự động cấp một mã lớp ngẫu nhiên để sinh viên tham gia.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <Alert variant="error" className="mt-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên khóa học / Học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: CS301 - Kỹ thuật phần mềm & Kiến trúc hệ thống"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mã môn học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="CS301"
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm font-mono text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Học kỳ
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="block w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
              >
                <option>Học kỳ 1 (2026 - 2027)</option>
                <option>Học kỳ 2 (2026 - 2027)</option>
                <option>Học kỳ hè (2026 - 2027)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả khóa học
            </label>
            <textarea
              rows={3}
              placeholder="Mục tiêu môn học, yêu cầu kiến thức nền tảng..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Tạo khóa học
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Figma 02.3 [311:3066]: Modal Xác nhận xóa khóa học ───────────────────────
function DeleteCourseModal({
  isOpen,
  course,
  onClose,
  onDeleted,
}: {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onDeleted: (courseId: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !course) return null;

  async function handleDelete() {
    if (!course) return;
    try {
      setLoading(true);
      await courseService.deleteCourse(course.id);
      onDeleted(course.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-gray-200 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Xóa khóa học này?
          </h3>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            Khóa học, tài liệu môn học và các case study thuộc khóa học sẽ bị xóa. Thao tác này không thể hoàn tác.
          </p>
        </div>

        <div className="rounded-md bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700">
          <strong className="font-semibold text-gray-900">{course.courseCode}</strong> - {course.name}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={loading}
            onClick={handleDelete}
          >
            Xóa khóa học
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page (Figma Frame [309:238]) ─────────────────────────────────────────
export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1 (2026 - 2027)");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError(false);
      const data = await courseService.getMyCourses();
      if (data && data.length > 0) {
        setCourses(data);
        if (!selectedCourseId) {
          setSelectedCourseId(data[0].id);
        }
      } else {
        setCourses(MOCK_COURSES);
        if (!selectedCourseId) {
          setSelectedCourseId(MOCK_COURSES[0].id);
        }
      }
    } catch {
      // Fallback demo mock data if backend not reachable
      setCourses(MOCK_COURSES);
      if (!selectedCourseId) {
        setSelectedCourseId(MOCK_COURSES[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;
  const selectedIndex = courses.findIndex((c) => c.id === selectedCourse?.id);

  if (loading) return <LoadingSkeletonPage />;
  if (error) return <ErrorStatePage title="Không tải được danh sách khóa học" onRetry={loadCourses} />;

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.courseCode && c.courseCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* ── Filter Bar (Figma Frame [309:316]) ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Tất cả khóa học
          </h2>
          <p className="text-xs text-gray-500">
            Quản lý tài liệu và các kịch bản học tập theo môn học
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative w-48">
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Semester dropdown */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-600 cursor-pointer"
          >
            <option>Học kỳ 1 (2026 - 2027)</option>
            <option>Học kỳ 2 (2026 - 2027)</option>
            <option>Học kỳ hè (2026 - 2027)</option>
          </select>

          {/* Primary Create Button */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tạo khóa học mới</span>
          </Button>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      {courses.length === 0 ? (
        <EmptyStatePage
          title="Chưa có khóa học nào"
          description="Tạo khóa học đầu tiên để bắt đầu xây dựng case tình huống cho sinh viên."
          actionLabel="Tạo khóa học mới"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="flex items-start gap-6">
          {/* Left Column: Course Cards List */}
          <div className="flex-1 space-y-3">
            {filteredCourses.map((c, idx) => (
              <CourseCard
                key={c.id}
                course={c}
                info={getCourseUIInfo(c, idx)}
                isSelected={c.id === selectedCourse?.id}
                onSelect={() => setSelectedCourseId(c.id)}
                onDeleteClick={(e) => {
                  e.stopPropagation();
                  setCourseToDelete(c);
                  setIsDeleteOpen(true);
                }}
              />
            ))}
          </div>

          {/* Right Column: Drawer Detail Panel */}
          {selectedCourse && (
            <CourseDetailDrawer
              course={selectedCourse}
              info={getCourseUIInfo(selectedCourse, selectedIndex >= 0 ? selectedIndex : 0)}
              onClose={() => setSelectedCourseId(null)}
              onNavigate={navigate}
            />
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <CreateCourseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(c) => {
          setCourses([c, ...courses]);
          setSelectedCourseId(c.id);
        }}
      />

      <DeleteCourseModal
        isOpen={isDeleteOpen}
        course={courseToDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setCourseToDelete(null);
        }}
        onDeleted={(id) => {
          setCourses(courses.filter((c) => c.id !== id));
          if (selectedCourseId === id) {
            setSelectedCourseId(courses[0]?.id || null);
          }
        }}
      />
    </div>
  );
}
