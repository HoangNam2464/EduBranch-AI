import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface CourseCard {
  id: string;
  code: string;
  title: string;
  lecturerName: string;
  lecturerAvatar: string;
  semester: string;
  casesCount: number;
  bgGradient: string;
  icon: string;
}

const ENROLLED_COURSES: CourseCard[] = [
  {
    id: "se2024",
    code: "SE2024",
    title: "Hệ thống phân tán",
    lecturerName: "TS. Nguyễn Văn An",
    lecturerAvatar: "NA",
    semester: "HK1 · 2026–2027",
    casesCount: 2,
    bgGradient: "bg-[#1E3A8A]",
    icon: "🖥",
  },
  {
    id: "mkt2024",
    code: "MKT2024",
    title: "Marketing số",
    lecturerName: "ThS. Trần Thu Hà",
    lecturerAvatar: "TH",
    semester: "HK1 · 2026–2027",
    casesCount: 1,
    bgGradient: "bg-[#0284C7]",
    icon: "📊",
  },
];

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSemester, setSelectedSemester] = useState("HK1_2026_2027");

  // Join Class Modal (HOLD · OPD-001)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(
    location.search.includes("join=true")
  );
  const [classCode, setClassCode] = useState("SEC7A2");
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setIsJoinModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Khóa học của tôi</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            HOLD · OPD-001
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Danh sách các học phần bạn đã ghi danh, tiến độ trải nghiệm Case Study và thông tin giảng viên phụ trách.
        </p>
      </div>

      {/* Top 2 Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Case Study theo khóa học (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 mb-2">Case Study theo khóa học</h3>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">3</span>
              <span className="text-xs text-slate-500 font-medium">Case Study</span>
            </div>

            {/* Split Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex my-3">
              <div className="h-full bg-[#1E3A8A] w-[67%]" title="SE2024: 67%"></div>
              <div className="h-full bg-[#0284C7] w-[33%]" title="MKT2024: 33%"></div>
            </div>

            <div className="flex items-center gap-6 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#1E3A8A]"></span>
                <span className="text-slate-700 font-medium">SE2024: </span>
                <span className="font-bold text-slate-900">67% (2)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#0284C7]"></span>
                <span className="text-slate-700 font-medium">MKT2024: </span>
                <span className="font-bold text-slate-900">33% (1)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Giảng viên phụ trách (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
            Giảng viên phụ trách
          </h3>
          <div className="text-[11px] text-slate-500 mb-2">Lớp học phần đã ghi danh</div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A8A]"></span>
                <div>
                  <div className="text-xs font-bold text-slate-900">TS. Nguyễn Văn An</div>
                  <div className="text-[11px] text-slate-500">SE2024 · Hệ thống phân tán · 2 case</div>
                </div>
              </div>
              <span className="w-7 h-7 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-xs">
                A
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7]"></span>
                <div>
                  <div className="text-xs font-bold text-slate-900">ThS. Trần Thu Hà</div>
                  <div className="text-[11px] text-slate-500">MKT2024 · Marketing số · 1 case</div>
                </div>
              </div>
              <span className="w-7 h-7 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-xs">
                H
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Danh sách lớp học phần */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Danh sách lớp học phần</h2>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="HK1_2026_2027">HK1 · 2026–2027</option>
              <option value="HK2_2025_2026">HK2 · 2025–2026</option>
            </select>

            <button
              type="button"
              onClick={() => setIsJoinModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>Tham gia lớp học</span>
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ENROLLED_COURSES.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Colored Card Banner */}
              <div className={`${course.bgGradient} p-6 text-white relative flex flex-col items-center justify-center h-44`}>
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  ● Đang học
                </span>
                <div className="text-white/80 scale-125 text-3xl">
                  {course.icon}
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {course.code}
                  </span>
                  <span className="font-bold text-slate-600">
                    {course.casesCount} case
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[10px]">
                      {course.lecturerAvatar}
                    </span>
                    <span>{course.lecturerName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">{course.semester}</span>
                  <button
                    onClick={() => navigate("/student/cases/cs301/branching-play")}
                    className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    Vào lớp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none">
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
            <span>trên 2 lớp học phần</span>
          </div>

          <div className="flex items-center gap-1">
            <button disabled className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded bg-[#1E3A8A] text-white font-bold">
              1
            </button>
            <button disabled className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* [HOLD · OPD-001] MODAL THAM GIA LỚP HỌC MỚI                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tham gia lớp học mới</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Nhập mã lớp do giảng viên cung cấp để truy cập các case study của môn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinClass} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900">
                  Mã lớp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">🔑</span>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: SEC7A2"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all shadow-2xs tracking-wider"
                  />
                </div>
              </div>

              {joinSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs text-center font-bold">
                  ✓ Ghi danh lớp học thành công!
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Tham gia lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

