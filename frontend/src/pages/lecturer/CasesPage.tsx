/**
 * CasesPage — Giảng viên · Quản lý Case Study
 * Figma Specs:
 * - 03.1: Quản lý Case Study (Stats Dashboard + Kho Case Study Grid)
 * - 03.2: Hộp thoại đang sinh case nháp (3-step AI Generation Progress Modal)
 * - 03.3: Thông báo sinh case thất bại (Failure Notification Toast)
 * Route: /lecturer/cases & /lecturer/courses/:courseId/cases
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

interface CaseItem {
  id: string;
  title: string;
  courseName: string;
  learningMode: "BRANCHING_STUDY" | "REVIEW_STUDY";
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";
  nodeCount?: number;
  deadline?: string;
  updatedAt: string;
}

const MOCK_CASES: CaseItem[] = [
  {
    id: "c1",
    title: "Khủng hoảng sập mạng lưới trung tâm dữ liệu và tấn công...",
    courseName: "An ninh mạng & Ứng cứu sự cố",
    learningMode: "BRANCHING_STUDY",
    status: "DRAFT",
    nodeCount: 6,
    deadline: "30/11/2026",
    updatedAt: "2026-11-06T10:00:00Z",
  },
  {
    id: "c2",
    title: "Khủng hoảng quá tải hệ thống thanh toán trực tuyến...",
    courseName: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    learningMode: "BRANCHING_STUDY",
    status: "PUBLISHED",
    nodeCount: 7,
    deadline: "30/11/2026",
    updatedAt: "2026-11-05T14:30:00Z",
  },
  {
    id: "c3",
    title: "Rò rỉ dữ liệu khách hàng",
    courseName: "An ninh mạng & Ứng cứu sự cố",
    learningMode: "REVIEW_STUDY",
    status: "PUBLISHED",
    deadline: "25/11/2026",
    updatedAt: "2026-11-04T09:15:00Z",
  },
  {
    id: "c4",
    title: "Sự cố triển khai phiên bản mới",
    courseName: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    learningMode: "BRANCHING_STUDY",
    status: "PUBLISHED",
    nodeCount: 8,
    deadline: "28/11/2026",
    updatedAt: "2026-11-03T16:45:00Z",
  },
  {
    id: "c5",
    title: "Thiết kế kiến trúc chịu lỗi",
    courseName: "Quản trị hệ thống thông tin",
    learningMode: "REVIEW_STUDY",
    status: "DRAFT",
    deadline: "Chưa đặt",
    updatedAt: "2026-11-02T11:20:00Z",
  },
  {
    id: "c6",
    title: "Khôi phục dữ liệu sau sự cố",
    courseName: "Quản trị hệ thống thông tin",
    learningMode: "BRANCHING_STUDY",
    status: "PUBLISHED",
    nodeCount: 6,
    deadline: "27/11/2026",
    updatedAt: "2026-11-01T08:00:00Z",
  },
];

export function CasesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [cases, setCases] = useState<CaseItem[]>(MOCK_CASES);
  const [activeTab, setActiveTab] = useState<"ALL" | "DRAFT" | "REVIEWED" | "PUBLISHED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");

  // AI Generation Progress Modal (03.2)
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [generationStep, setGenerationStep] = useState<1 | 2 | 3>(2);

  // Failure Notification Toast (03.3)
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    fetchLiveCases();
  }, [courseId]);

  async function fetchLiveCases() {
    if (!courseId) return;
    try {
      const res = await apiClient.get(`/courses/${courseId}/cases`);
      if (res.data?.data && res.data.data.length > 0) {
        const liveItems: CaseItem[] = res.data.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          courseName: "An ninh mạng & Ứng cứu sự cố",
          learningMode: c.learning_mode || "BRANCHING_STUDY",
          status: c.status || "DRAFT",
          nodeCount: 6,
          deadline: "30/11/2026",
          updatedAt: c.updated_at || new Date().toISOString(),
        }));
        setCases(liveItems);
      }
    } catch {
      // Keep mock cases for realistic rendering
    }
  }

  // Trigger AI Case Generation Simulation
  function handleStartGeneration() {
    setShowErrorToast(false);
    setIsGeneratingModalOpen(true);
    setGenerationStep(1);

    setTimeout(() => {
      setGenerationStep(2);
    }, 1500);

    setTimeout(() => {
      setGenerationStep(3);
    }, 3200);

    setTimeout(() => {
      setIsGeneratingModalOpen(false);
      // Navigate to review editor for new case
      navigate(`/lecturer/cases/c1/review`);
    }, 4500);
  }

  function handleTriggerFailureDemo() {
    setIsGeneratingModalOpen(false);
    setShowErrorToast(true);
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.courseName.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "DRAFT" && c.status === "DRAFT") ||
      (activeTab === "REVIEWED" && (c.status === "REVIEWED" || c.status === "APPROVED")) ||
      (activeTab === "PUBLISHED" && c.status === "PUBLISHED");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col gap-6 relative">
      {/* ── 03.3 Failure Notification Toast (Floats at top-right if triggered) ── */}
      {showErrorToast && (
        <div className="absolute top-0 right-0 z-50 w-96 rounded-2xl border border-red-100 bg-white p-4 shadow-xl flex items-start gap-3 animate-fade-in">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold">
            ⚠️
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-slate-900">Sinh case thất bại</h5>
            <p className="mt-1 text-xs text-slate-500 leading-snug">
              AI chưa tạo được cây quyết định hợp lệ sau 2 lần thử. Hãy thử lại hoặc nêu chủ đề cụ thể hơn.
            </p>
          </div>
          <button
            onClick={() => setShowErrorToast(false)}
            className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Dashboard Stats Row (Figma 03.1) ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Card Left: Case Study theo trạng thái */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700">Case Study theo trạng thái</h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">6</span>
              <span className="text-xs text-slate-400">Case Study</span>
            </div>
          </div>

          {/* Horizontal Stacked Bar */}
          <div className="h-4 w-full rounded-md bg-slate-100 overflow-hidden flex">
            <div style={{ width: "33%" }} className="bg-slate-400 h-full" title="Bản nháp 33%" />
            <div style={{ width: "67%" }} className="bg-[#1E3A8A] h-full" title="Đã xuất bản 67%" />
          </div>

          {/* Status Breakdown Legend */}
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-400" />
              <span className="text-slate-600">Bản nháp</span>
              <span className="text-slate-400">33%</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">2</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#1E3A8A]" />
              <span className="text-slate-600">Đã xuất bản</span>
              <span className="text-slate-400">67%</span>
              <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-[#1E3A8A]">4</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-blue-400" />
              <span className="text-slate-600">Đã rà soát</span>
              <span className="text-slate-400">0%</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">0</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" />
              <span className="text-slate-600">Đã phê duyệt</span>
              <span className="text-slate-400">0%</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">0</span>
            </div>
          </div>
        </div>

        {/* Card Right: Chế độ học & hạn nộp */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700">Chế độ học &amp; hạn nộp</h3>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 outline-none cursor-pointer"
            >
              <option value="ALL">Mọi khóa học</option>
              <option value="CS402">An ninh mạng &amp; Ứng cứu sự cố</option>
              <option value="CS301">Kỹ thuật phần mềm &amp; Kiến trúc hệ thống</option>
            </select>
          </div>

          <div className="flex items-start gap-6 pt-1">
            {/* Mini Stacked Bars (Branching vs Review) */}
            <div className="space-y-1.5 w-32 flex-shrink-0">
              <div className="flex items-end gap-3 h-24 pb-1 border-b border-slate-100">
                {/* Branching Bar */}
                <div className="flex flex-col gap-0.5 items-center w-10">
                  <div className="w-full h-3 rounded-xs bg-[#1E3A8A]" />
                  <div className="w-full h-3 rounded-xs bg-[#1E3A8A]" />
                  <div className="w-full h-3 rounded-xs bg-[#1E3A8A]" />
                  <div className="w-full h-3 rounded-xs bg-[#1E3A8A]" />
                  <div className="w-full h-3 rounded-xs bg-[#1E3A8A]" />
                </div>
                {/* Review Bar */}
                <div className="flex flex-col gap-0.5 items-center w-10">
                  <div className="w-full h-3 rounded-xs bg-cyan-500" />
                  <div className="w-full h-3 rounded-xs bg-cyan-500" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Branching</span>
                <span>Review</span>
              </div>
            </div>

            {/* Hạn nộp gần nhất */}
            <div className="flex-1 space-y-2 border-l border-slate-100 pl-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hạn nộp gần nhất</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">Rò rỉ dữ liệu khách hàng</p>
                    <p className="text-[10px] text-slate-400">25/11/2026 · Review Study</p>
                  </div>
                  <button className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-400 text-blue-600 text-xs">
                    ›
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">Khôi phục dữ liệu sau sự cố</p>
                    <p className="text-[10px] text-slate-400">27/11/2026 · Branching Study</p>
                  </div>
                  <button className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-400 text-blue-600 text-xs">
                    ›
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">Sự cố triển khai phiên bản mới</p>
                    <p className="text-[10px] text-slate-400">28/11/2026 · Branching Study</p>
                  </div>
                  <button className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-400 text-blue-600 text-xs">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lower Section: Kho Case Study (Figma 03.1) ── */}
      <div className="space-y-4">
        {/* Controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900">Kho Case Study</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search box */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-52">
              <input
                type="text"
                placeholder="Tìm theo tiêu đề hoặc môn học"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none placeholder-slate-400"
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Filter buttons */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  activeTab === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab("DRAFT")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  activeTab === "DRAFT" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Bản nháp
              </button>
              <button
                onClick={() => setActiveTab("REVIEWED")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  activeTab === "REVIEWED" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Đã rà soát
              </button>
              <button
                onClick={() => setActiveTab("PUBLISHED")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  activeTab === "PUBLISHED" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Đã xuất bản
              </button>
            </div>

            {/* Course Filter Dropdown */}
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none cursor-pointer">
              <option>Mọi khóa học</option>
              <option>An ninh mạng &amp; Ứng cứu sự cố</option>
              <option>Kỹ thuật phần mềm &amp; Kiến trúc hệ thống</option>
            </select>

            {/* Primary Action Button */}
            <button
              onClick={handleStartGeneration}
              className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#172554] transition cursor-pointer shadow-xs"
            >
              <span>+</span>
              <span>Tạo Case mới bằng AI</span>
            </button>
          </div>
        </div>

        {/* ── Case Study Cards Grid ── */}
        <div className="grid grid-cols-4 gap-4">
          {filteredCases.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-[#1E3A8A] transition flex flex-col justify-between"
            >
              <div>
                {/* Top status badge */}
                <div className="flex items-center justify-between mb-3">
                  {item.status === "DRAFT" ? (
                    <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
                      · Bản nháp
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
                      · Đã xuất bản
                    </span>
                  )}
                </div>

                {/* Center Visual Box */}
                <div className="flex h-28 w-full items-center justify-center rounded-xl bg-slate-50 border border-slate-100 mb-3 text-slate-400">
                  {item.learningMode === "BRANCHING_STUDY" ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  )}
                </div>

                {/* Tags row: Learning mode + Node count */}
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-[#1E3A8A]">
                    {item.learningMode === "BRANCHING_STUDY" ? "Branching Study" : "Review Study"}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {item.nodeCount ? `${item.nodeCount} nút` : "Không dùng cây"}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-2">
                  {item.title}
                </h4>

                {/* Course tag */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-3">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-100 text-[8px] font-bold text-[#1E3A8A]">
                    NA
                  </span>
                  <span className="truncate">{item.courseName}</span>
                </div>
              </div>

              {/* Footer row: Deadline + Edit button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400">
                  Hạn nộp {item.deadline}
                </span>
                <button
                  onClick={() => navigate(`/lecturer/cases/${item.id}/review`)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>Hiển thị 10 v trên 6 Case Study</span>
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

      {/* ── 03.2 Modal Đang sinh case nháp (Figma Spec) ── */}
      {isGeneratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#1E3A8A]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Đang sinh case nháp</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  AI đang dựng tình huống từ tài liệu bạn chọn. Quá trình thường mất 5–15 giây.
                </p>
              </div>
            </div>

            {/* Step rows */}
            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
                  <span>Truy xuất đoạn trích liên quan từ 2 tài liệu đã chọn</span>
                </div>
                <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F]">
                  Hoàn tất
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                    <div className="h-2.5 w-2.5 animate-spin rounded-full border border-blue-300 border-t-blue-700" />
                  </span>
                  <span>Tổng hợp tình huống và các điểm quyết định</span>
                </div>
                <span className="rounded-full bg-[#E1EFFE] px-2 py-0.5 text-[10px] font-semibold text-[#1E429F]">
                  Đang thực hiện
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px]">⏱</span>
                  <span className="text-slate-500">Kiểm tra cấu trúc cây quyết định (không có vòng lặp, không có tình huống mù cõi)</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Đang chờ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
