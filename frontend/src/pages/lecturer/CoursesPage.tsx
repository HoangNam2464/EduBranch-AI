/**
 * CoursesPage — Giảng viên · Quản lý khóa học
 * Figma Specs: 02.1 (List + Detail Drawer), 02.2 (Create Modal), 02.3 (Delete Modal)
 * Exact Figma Color System: Deep Navy #1E3A8A, Soft Mint #E6F4EA, Dark Banner #1E293B
 * Route: /lecturer/courses
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { Course } from "../../types";
import { LoadingSkeletonPage, EmptyStatePage, ErrorStatePage } from "../../components/ui";

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

// ── Icons ─────────────────────────────────────────────────────────────────────
function ShieldIcon({ className = "w-6 h-6 text-[#03543F]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function NodesIcon({ className = "w-6 h-6 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function DatabaseIcon({ className = "w-6 h-6 text-[#0284C7]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

// ── Course Card in List (Figma 02.1) ──────────────────────────────────────────
function CourseCard({
  course,
  info,
  isSelected,
  onSelect,
}: {
  course: Course;
  info: CourseUIInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? "border-[#1E3A8A] bg-white shadow-xs ring-1 ring-[#1E3A8A]"
          : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Left Badge + Icon Block */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
            Đang dạy
          </span>
          <div
            className={`flex h-12 w-14 items-center justify-center rounded-xl border ${
              info.iconType === "nodes"
                ? "bg-[#1E3A8A] border-[#1E3A8A]"
                : info.iconType === "database"
                ? "bg-[#E0F2FE] border-[#BAE6FD]"
                : "bg-[#E6F4EA] border-[#DEF7EC]"
            }`}
          >
            {info.iconType === "nodes" && <NodesIcon />}
            {info.iconType === "database" && <DatabaseIcon />}
            {info.iconType === "shield" && <ShieldIcon />}
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {course.name}
            </h3>
            {course.courseCode && (
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-600">
                {course.courseCode}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-[#1E3A8A]">
                NA
              </span>
              <span className="font-medium text-slate-700">{info.lecturerName}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Mã mời: {info.inviteCode}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              </svg>
              <span>{info.docCount} tài liệu</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              <span>{info.caseCount} case</span>
            </div>

            <div className="flex items-center gap-1 text-slate-600 font-semibold ml-auto">
              <span className="flex -space-x-1">
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-blue-500 ring-1 ring-white" />
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-amber-500 ring-1 ring-white" />
              </span>
              <span>{info.studentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Right Drawer: Chi tiết khóa học (Figma 02.1) ──────────────────────────────
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
    <div className="w-[340px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Chi tiết khóa học
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`/lecturer/courses/${course.id}/materials`)}
            className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
          >
            Mở khóa học
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Dark Navy Hero Banner with Shield Outline (#1E293B) */}
      <div className="relative flex h-32 w-full items-center justify-center rounded-xl bg-[#1E293B] overflow-hidden">
        {course.courseCode && (
          <span className="absolute top-2.5 left-2.5 rounded bg-blue-900/80 border border-blue-700/50 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-200">
            {course.courseCode}
          </span>
        )}
        <div className="flex items-center justify-center text-slate-200">
          <svg className="w-16 h-16 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Title & Instructor */}
      <div>
        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {course.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-[#1E3A8A]">
            NA
          </span>
          <span>{info.lecturerName}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
            Đang dạy
          </span>
          <span className="rounded-full bg-[#1E293B] text-white px-2 py-0.5 text-[10px] font-medium">
            {info.semester}
          </span>
          <div className="ml-auto flex items-center gap-1 text-xs text-slate-600 font-semibold">
            <span className="flex -space-x-1">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-blue-500 ring-1 ring-white" />
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-amber-500 ring-1 ring-white" />
            </span>
            <span>{info.studentCount}</span>
          </div>
        </div>
      </div>

      {/* 3 Metrics Row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 border border-slate-100 py-2.5 text-center">
        <div>
          <p className="text-[11px] text-slate-400">Sinh viên</p>
          <p className="mt-0.5 text-base font-bold text-slate-900">{info.studentCount}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Tài liệu</p>
          <p className="mt-0.5 text-base font-bold text-slate-900">{info.docCount}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Case Study</p>
          <p className="mt-0.5 text-base font-bold text-slate-900">{info.caseCount}</p>
        </div>
      </div>

      {/* Về khóa học */}
      <div>
        <h5 className="text-xs font-bold text-slate-900 mb-1">Về khóa học</h5>
        <p className="text-xs text-slate-500 leading-relaxed">
          {course.description ||
            "Phân tích các mối đe dọa an ninh mạng, xây dựng phương án ứng cứu và quản trị rủi ro trong hệ thống ngân hàng số."}
        </p>
      </div>

      {/* Thông tin lớp học */}
      <div>
        <h5 className="text-xs font-bold text-slate-900 mb-1.5">Thông tin lớp học</h5>
        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Mã mời lớp: <strong className="text-slate-800 font-mono">{info.inviteCode}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>{info.semester}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>{info.studentCount} sinh viên đã tham gia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Giảng viên phụ trách: {info.lecturerName}</span>
          </div>
        </div>
      </div>

      {/* Đi tới buttons */}
      <div className="mt-auto space-y-2 pt-2 border-t border-slate-100">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Đi tới</h5>
        <button
          onClick={() => onNavigate(`/lecturer/courses/${course.id}/materials`)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-blue-400 hover:bg-blue-50/20 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Tài liệu môn học</p>
              <p className="text-[11px] text-slate-400">{info.docCount} tệp · PDF, DOCX</p>
            </div>
          </div>
          <span className="text-slate-300">›</span>
        </button>

        <button
          onClick={() => onNavigate(`/lecturer/courses/${course.id}/cases`)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-blue-400 hover:bg-blue-50/20 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Case Study</p>
              <p className="text-[11px] text-slate-400">{info.caseCount} case · Branching & Review</p>
            </div>
          </div>
          <span className="text-slate-300">›</span>
        </button>
      </div>
    </div>
  );
}

// ── Figma 02.2: Modal Khởi tạo khóa học mới ──────────────────────────────────
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

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.courseCode.trim()) return;

    try {
      setLoading(true);
      const res = await courseService.createCourse({
        name: form.name.trim(),
        courseCode: form.courseCode.trim(),
        description: form.description.trim() || undefined,
      });
      onCreated(res);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Khởi tạo khóa học mới</h3>
            <p className="mt-1 text-xs text-slate-500">
              Hệ thống sẽ tự động cấp một mã lớp ngẫu nhiên để sinh viên tham gia.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên khóa học / Học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: CS301 - Kỹ thuật phần mềm & Kiến trúc hệ thống"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã môn học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="CS301"
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Học kỳ
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] bg-white cursor-pointer"
              >
                <option>Học kỳ 1 (2026 - 2027)</option>
                <option>Học kỳ 2 (2026 - 2027)</option>
                <option>Học kỳ hè (2026 - 2027)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mô tả khóa học
            </label>
            <textarea
              rows={3}
              placeholder="Mục tiêu môn học, yêu cầu kiến thức nền tảng..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172554] disabled:opacity-50 cursor-pointer transition"
            >
              {loading ? "Đang tạo..." : "Tạo khóa học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Figma 02.3: Modal Xác nhận xóa khóa học ──────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900">Xóa khóa học này?</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Khóa học, tài liệu môn học và các case study thuộc khóa học sẽ bị xóa. Thao tác này không thể hoàn tác.
        </p>

        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700">
          <strong className="font-semibold text-slate-900">{course.courseCode}</strong> - {course.name} · 4 tài liệu · 5 case
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
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
          >
            {loading ? "Đang xóa..." : "Xóa khóa học"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page (Figma 02.1) ────────────────────────────────────────────────────
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
      // Fallback to demo mock data when Backend is offline
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
    <div className="flex flex-col gap-5">
      {/* ── Subheader Controls (Figma 02.1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-6">
          <button className="text-sm font-bold text-slate-900 border-b-2 border-[#1E3A8A] pb-4 -mb-4 cursor-pointer">
            Tất cả khóa học
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-44">
            <input
              type="text"
              placeholder="Tên khóa học"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-slate-400"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Semester dropdown */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none cursor-pointer"
          >
            <option>Học kỳ 1 (2026 - 2027)</option>
            <option>Học kỳ 2 (2026 - 2027)</option>
            <option>Học kỳ 1 (2025 - 2026)</option>
          </select>

          {/* Primary Navy Button (Figma 02.1) */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#172554] transition cursor-pointer shadow-xs"
          >
            <span>+</span>
            <span>Tạo khóa học mới</span>
          </button>
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
          {/* Left: Course Card List */}
          <div className="flex-1 space-y-3">
            {filteredCourses.map((c, idx) => (
              <CourseCard
                key={c.id}
                course={c}
                info={getCourseUIInfo(c, idx)}
                isSelected={c.id === selectedCourse?.id}
                onSelect={() => setSelectedCourseId(c.id)}
              />
            ))}

            {/* Pagination footer */}
            <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
              <span>Hiển thị 10 v trên {courses.length} khóa học</span>
              <div className="flex items-center gap-1">
                <button className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50">
                  ‹
                </button>
                <button className="flex h-6 w-6 items-center justify-center rounded bg-[#1E3A8A] text-white font-bold">
                  1
                </button>
                <button className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50">
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Right: Drawer Detail Panel (Figma 02.1) */}
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
