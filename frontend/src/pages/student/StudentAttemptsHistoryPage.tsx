import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

interface AttemptRecord {
  id: string;
  attemptNumber: number;
  completedAt: string;
  startedAt: string;
  subTitle: string;
  caseTitle: string;
  mode: string;
  stepsCount: number;
  status: "SUBMITTED" | "IN_PROGRESS";
}

const ATTEMPTS_DATA: AttemptRecord[] = [
  {
    id: "att-01",
    attemptNumber: 1,
    completedAt: "17/11/2026, 20:35",
    startedAt: "17/11/2026, 20:00",
    subTitle: "Đã nộp suy ngẫm",
    caseTitle: "Khủng hoảng sập hệ thống thanh toán Black Friday",
    mode: "Branching Study",
    stepsCount: 3,
    status: "SUBMITTED",
  },
  {
    id: "att-02",
    attemptNumber: 2,
    completedAt: "—",
    startedAt: "18/11/2026, 09:15",
    subTitle: "Đang thực hiện",
    caseTitle: "Khủng hoảng sập hệ thống thanh toán Black Friday",
    mode: "Branching Study",
    stepsCount: 1,
    status: "IN_PROGRESS",
  },
];

export function StudentAttemptsHistoryPage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [searchTerm, setSearchTerm] = useState("Black Friday");
  const [isNewAttemptModalOpen, setIsNewAttemptModalOpen] = useState(false);

  // Metrics
  const totalAttempts = ATTEMPTS_DATA.length;
  const submittedCount = ATTEMPTS_DATA.filter((a) => a.status === "SUBMITTED").length;
  const inProgressCount = ATTEMPTS_DATA.filter((a) => a.status === "IN_PROGRESS").length;
  const totalStepsWalked = ATTEMPTS_DATA.reduce((acc, cur) => acc + cur.stepsCount, 0);

  const handleStartNewAttempt = () => {
    setIsNewAttemptModalOpen(false);
    navigate(`/student/cases/${caseId || "cs301"}/branching-play`);
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lịch sử lần làm bài</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi hành trình ra quyết định, so sánh các lần làm và bài học đúc kết qua từng lượt trải nghiệm.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewAttemptModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <span>+</span>
          <span>Bắt đầu lượt làm mới</span>
        </button>
      </div>

      {/* Top Section: 4 KPI Cards + Chart Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 4 KPI Cards in 2x2 Grid (6 cols) */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {/* KPI 1 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                </span>
                <span>Số lần làm bài</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{totalAttempts}</div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </span>
                <span>Đã nộp</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{submittedCount}</div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </span>
                <span>Đang thực hiện</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{inProgressCount}</div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                </span>
                <span>Bước quyết định đã đi qua</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{totalStepsWalked}</div>
            </div>
          </div>
        </div>

        {/* Right: Steps per Attempt Bar Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 mb-2">Số bước đã đi qua theo lần làm</h3>

          <div className="flex items-end justify-between px-6 pt-2 pb-1 border-b border-slate-100 h-32">
            {/* Axis Y */}
            <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 font-medium pr-2">
              <span>5</span>
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div className="flex items-end justify-around flex-1 h-full px-6">
              {/* Attempt 1 */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#1E3A8A]">3</span>
                <div className="w-14 bg-[#1E3A8A] rounded-t-lg h-20 shadow-xs"></div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">Lần làm #1</span>
              </div>

              {/* Attempt 2 */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#0284C7]">1</span>
                <div className="w-14 bg-[#0284C7] rounded-t-lg h-8 shadow-xs"></div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">Lần làm #2</span>
              </div>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-around pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#1E3A8A]"></span>
              <span className="text-slate-700 font-medium">Lần làm #1 · Đã nộp: </span>
              <span className="font-bold text-slate-900">3 bước</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#0284C7]"></span>
              <span className="text-slate-700 font-medium">Lần làm #2 · Đang thực hiện: </span>
              <span className="font-bold text-slate-900">1 bước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Attempt List Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Danh sách lần làm</h2>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm kiếm lần làm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
            />
            <svg
              className="absolute left-3 top-2 text-slate-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold text-[11px]">
                <th className="py-3 px-4">Hoàn thành</th>
                <th className="py-3 px-4">Lần làm</th>
                <th className="py-3 px-4">Bắt đầu</th>
                <th className="py-3 px-4">Tình huống</th>
                <th className="py-3 px-4 text-center">Chế độ</th>
                <th className="py-3 px-4 text-center">Số bước</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ATTEMPTS_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Hoàn thành */}
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {row.completedAt}
                  </td>

                  {/* Lần làm */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-[#1E3A8A] font-bold text-xs">
                        #{row.attemptNumber}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">Lần làm #{row.attemptNumber}</div>
                        <div className="text-[11px] text-slate-400">{row.subTitle}</div>
                      </div>
                    </div>
                  </td>

                  {/* Bắt đầu */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.startedAt}
                  </td>

                  {/* Tình huống */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.caseTitle}
                  </td>

                  {/* Chế độ */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-100">
                      {row.mode}
                    </span>
                  </td>

                  {/* Số bước */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {row.stepsCount} bước
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    {row.status === "SUBMITTED" ? (
                      <Link
                        to={`/student/cases/${caseId || "cs301"}/attempt/attempt-1/reflect`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-emerald-800 border border-emerald-300 hover:brightness-95 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Đã nộp
                      </Link>
                    ) : (
                      <Link
                        to={`/student/cases/${caseId || "cs301"}/branching-play`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-amber-800 border border-amber-300 hover:brightness-95 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Đang xử lý
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none">
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
            <span>trên {ATTEMPTS_DATA.length} lần làm</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            >
              &lt;
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded bg-[#1E3A8A] text-white font-bold">
              1
            </button>
            <button
              disabled
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.10 · MODAL BẮT ĐẦU LƯỢT LÀM MỚI                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isNewAttemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900">Bắt đầu lượt làm mới?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lượt làm mới bắt đầu lại từ tình huống đầu tiên để bạn thử một hướng đi khác. Lượt trước được giữ nguyên trong lịch sử, kèm lập luận và phần suy ngẫm của bạn.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="font-bold text-slate-800 block mb-0.5">Lượt 1:</span>
              Đã hoàn thành · 3 bước quyết định · Đã nộp suy ngẫm
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewAttemptModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleStartNewAttempt}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Bắt đầu lượt 2
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

