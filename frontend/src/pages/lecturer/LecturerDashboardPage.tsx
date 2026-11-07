import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LecturerDashboardPage() {
  const navigate = useNavigate();
  // Tab: "OVERVIEW" (07.1 Tổng quan) or "CALENDAR" (07.2 Lịch hạn nộp)
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "CALENDAR">("OVERVIEW");

  // Filters
  const [selectedMonth, setSelectedMonth] = useState("OCTOBER");
  const [calendarFilter, setCalendarFilter] = useState("ALL");

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === "OVERVIEW" ? "Tổng quan" : "Tổng quan · Lịch hạn nộp"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              HOLD · D-05
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng điều khiển hoạt động giảng dạy, theo dõi bài nộp và lịch hạn chót của các Case Study.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs text-xs">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "OVERVIEW"
                ? "bg-[#1E3A8A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tổng quan chỉ số
          </button>
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "CALENDAR"
                ? "bg-[#1E3A8A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Lịch hạn nộp
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 07.1 · GIẢNG VIÊN · TỔNG QUAN                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "OVERVIEW" ? (
        <div className="space-y-6">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                    📖
                  </span>
                  <span>Khóa học phụ trách</span>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-900">3</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                    ✓
                  </span>
                  <span>Case đã xuất bản</span>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-900">4</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                    💬
                  </span>
                  <span>Bài chờ phản hồi</span>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-900">4</div>
              </div>
            </div>
          </div>

          {/* Main Grid: Left 6 Analytics Widgets (8 cols) & Right Widgets (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 Analytics Widgets */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Bài nộp theo Case Study */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900">Bài nộp theo Case Study</h3>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none"
                    >
                      <option value="OCTOBER">Tháng 10</option>
                      <option value="NOVEMBER">Tháng 11</option>
                    </select>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">Tổng bài nộp</div>
                  <div className="text-xl font-bold text-slate-900 mb-4">6</div>

                  {/* Bar Chart Representation */}
                  <div className="relative h-40 flex items-end justify-between px-4 pt-4 border-b border-slate-100 pb-1">
                    {/* Tooltip on Quá tải ĐKHP */}
                    <div className="absolute top-1 left-2 bg-slate-900 text-white text-[10px] rounded-md px-2 py-1 shadow-md pointer-events-none">
                      <div className="font-semibold">Quá tải ĐKHP</div>
                      <div className="text-blue-200">Chờ phản hồi: 3 | Đã phản hồi: 3</div>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 bg-[#0284C7] rounded-t-lg h-24 shadow-xs"></div>
                      <span className="text-[9px] text-slate-600 font-medium truncate w-14 text-center mt-1">Quá tải ĐKHP</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 bg-[#0284C7] rounded-t-lg h-10 shadow-xs"></div>
                      <span className="text-[9px] text-slate-600 font-medium truncate w-14 text-center mt-1">Rò rỉ dữ liệu</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 bg-[#1E3A8A] rounded-t-lg h-10 shadow-xs"></div>
                      <span className="text-[9px] text-slate-600 font-medium truncate w-14 text-center mt-1">Triển khai</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 bg-slate-300 rounded-t-lg h-10"></div>
                      <span className="text-[9px] text-slate-600 font-medium truncate w-14 text-center mt-1">Khôi phục</span>
                    </div>
                  </div>
                </div>

                {/* 2. Lượt nộp bài (Line Chart) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900">Lượt nộp bài</h3>
                    <span className="text-[11px] text-slate-500">6 ngày qua</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">Tuần này</div>
                  <div className="text-xl font-bold text-slate-900 mb-4">6 bài</div>

                  {/* SVG Spline */}
                  <div className="relative h-40 flex flex-col justify-end">
                    <svg className="w-full h-28 overflow-visible" viewBox="0 0 240 100" fill="none">
                      <line x1="0" y1="25" x2="240" y2="25" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="50" x2="240" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="75" x2="240" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="100" x2="240" y2="100" stroke="#E2E8F0" strokeWidth="1" />

                      <path
                        d="M 10 90 C 50 90, 80 85, 120 85 C 160 85, 180 30, 200 35 C 215 40, 230 50, 235 55"
                        stroke="#1E3A8A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="200" cy="35" r="4.5" fill="#1E3A8A" stroke="#ffffff" strokeWidth="2" />
                      <text x="200" y="24" fill="#1E3A8A" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
                    </svg>
                    <div className="flex items-center justify-between pt-1 text-[9px] font-medium text-slate-400">
                      <span>18/10</span>
                      <span>19/10</span>
                      <span>20/10</span>
                      <span>21/10</span>
                      <span className="font-bold text-[#1E3A8A]">23/10</span>
                    </div>
                  </div>
                </div>

                {/* 3. Case Study theo trạng thái */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900">Case Study theo trạng thái</h3>
                    <span className="text-[11px] text-slate-500">Mọi khóa</span>
                  </div>

                  {/* Semi-circle */}
                  <div className="relative flex flex-col items-center justify-center my-3">
                    <div className="relative w-44 h-22 overflow-hidden">
                      <svg viewBox="0 0 100 50" className="w-full h-full">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="14" />
                        <path d="M 10 50 A 40 40 0 0 1 63 12" fill="none" stroke="#1E3A8A" strokeWidth="14" />
                        <path d="M 65 14 A 40 40 0 0 1 90 50" fill="none" stroke="#0284C7" strokeWidth="14" />
                      </svg>
                      <div className="absolute bottom-0 inset-x-0 text-center">
                        <span className="text-lg font-bold text-slate-900 leading-none">6</span>
                        <div className="text-[10px] text-slate-400 font-medium">Case Study</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A8A]"></span>
                        <span className="text-slate-700">Đã xuất bản</span>
                      </div>
                      <div className="font-bold text-slate-900">4 <span className="text-[10px] text-slate-400 font-normal">67%</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7]"></span>
                        <span className="text-slate-700">Bản nháp</span>
                      </div>
                      <div className="font-bold text-slate-900">2 <span className="text-[10px] text-slate-400 font-normal">33%</span></div>
                    </div>
                  </div>
                </div>

                {/* 4. Hoạt động sinh viên (Heatmap) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900">Hoạt động sinh viên</h3>
                    <span className="text-[11px] text-slate-500">Tuần này</span>
                  </div>

                  <div className="space-y-1">
                    {["21h", "17h", "15h", "13h", "9h"].map((hour, idx) => (
                      <div key={hour} className="flex items-center gap-1">
                        <span className="w-5 text-[9px] text-slate-400 text-right">{hour}</span>
                        <div className="grid grid-cols-7 gap-1 flex-1">
                          <span className={`h-4 rounded ${idx === 1 ? "bg-[#0284C7]" : "bg-blue-50/60"}`}></span>
                          <span className={`h-4 rounded ${idx === 1 ? "bg-[#1E3A8A]" : "bg-blue-100"}`}></span>
                          <span className={`h-4 rounded ${idx === 1 ? "bg-[#1E3A8A]" : "bg-blue-100"}`}></span>
                          <span className={`h-4 rounded ${idx === 1 ? "bg-[#0284C7]" : "bg-blue-100"}`}></span>
                          <span className="h-4 rounded bg-blue-50/70"></span>
                          <span className="h-4 rounded bg-blue-50/40"></span>
                          <span className="h-4 rounded bg-blue-50/40"></span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="w-5"></span>
                      <div className="grid grid-cols-7 gap-1 flex-1 text-center text-[9px] font-semibold text-slate-400">
                        <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Sinh viên theo khóa học */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900">Sinh viên theo khóa học</h3>
                    <button className="text-[11px] font-medium text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-50">
                      Xuất báo cáo ⭳
                    </button>
                  </div>

                  <div className="h-32 flex items-end justify-between px-6 border-b border-slate-100 pb-1">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-800">42</span>
                      <div className="w-10 bg-[#1E3A8A] rounded-t-lg h-24"></div>
                      <span className="text-[9px] font-semibold text-slate-500 mt-1">CS402</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-800">42</span>
                      <div className="w-10 bg-[#0284C7] rounded-t-lg h-24"></div>
                      <span className="text-[9px] font-semibold text-slate-500 mt-1">CS301</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-800">38</span>
                      <div className="w-10 bg-slate-300 rounded-t-lg h-20"></div>
                      <span className="text-[9px] font-semibold text-slate-500 mt-1">IT305</span>
                    </div>
                  </div>
                </div>

                {/* 6. Case Study gần đây */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-900 mb-2">Case Study gần đây</h3>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">🌿</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-700">Bản nháp</span>
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">Ứng cứu tấn công DDoS...</span>
                          </div>
                          <span className="text-[10px] text-slate-400">2 giờ trước</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#1E3A8A]">🌿</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-[#1E3A8A]">Đã xuất bản</span>
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">Khủng hoảng quá tải ĐKHP</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Hạn 30/11 · 42 SV</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Widget (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Mini Calendar Widget */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900">Tháng 11, 2026</h3>
                  <span className="text-slate-400 text-xs">▼ ▲</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-2">
                  <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700">
                  <span className="py-1">1</span><span className="py-1">2</span><span className="py-1">3</span><span className="py-1">4</span><span className="py-1">5</span>
                  <span className="py-1 flex items-center justify-center"><span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-bold text-[11px] flex items-center justify-center">6</span></span>
                  <span className="py-1">7</span>
                  <span className="py-1">8</span><span className="py-1">9</span><span className="py-1">10</span><span className="py-1">11</span><span className="py-1">12</span><span className="py-1">13</span><span className="py-1">14</span>
                  <span className="py-1">15</span><span className="py-1">16</span><span className="py-1">17</span><span className="py-1">18</span><span className="py-1">19</span><span className="py-1">20</span><span className="py-1">21</span>
                  <span className="py-1">22</span><span className="py-1">23</span><span className="py-1">24</span><span className="py-1 text-[#1E3A8A] font-bold">25</span><span className="py-1">26</span><span className="py-1 text-[#1E3A8A] font-bold">27</span><span className="py-1 text-[#1E3A8A] font-bold">28</span>
                  <span className="py-1">29</span><span className="py-1 text-[#1E3A8A] font-bold">30</span>
                </div>
              </div>

              {/* Hạn nộp các case */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Hạn nộp các case
                </h3>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold">25</span>
                    <span className="text-[9px] text-blue-200">T11</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-semibold text-sky-800 bg-sky-100 px-1 rounded">Review 23:59</span>
                    <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Rò rỉ dữ liệu khách hàng</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#0284C7] text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold">27</span>
                    <span className="text-[9px] text-sky-100">T11</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-semibold text-blue-800 bg-blue-100 px-1 rounded">Branching 23:59</span>
                    <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Khôi phục dữ liệu sau sự cố</div>
                  </div>
                </div>
              </div>

              {/* Bài nộp gần đây */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Bài nộp gần đây
                </h3>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">📄</span>
                  <div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-semibold">Chờ phản hồi</span>
                    <Link to="/lecturer/feedback" className="block text-xs font-bold text-slate-800 hover:text-[#1E3A8A]">Nguyễn Minh Anh nộp lần #2</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* 07.2 · REVISION 01: FULL CALENDAR DEADLINE GRID                    */
        /* ─────────────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span>📖</span>
                <span>Khóa học phụ trách</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">3</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="w-4 h-4 rounded bg-[#1E3A8A]"></span>
                <span>Case đã xuất bản</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">4</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span>✏️</span>
                <span>Bản nháp · chờ duyệt</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">2</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span>💬</span>
                <span>Bài nộp chờ bạn chấm</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">4</div>
            </div>
          </div>

          {/* Main 2-Column: Big Calendar (8 cols) + Feedback List (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Big Calendar Grid (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              {/* Calendar Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Tháng 11, 2026</h3>
                  <span className="text-slate-400 text-xs">▼ ▲</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                    <button
                      onClick={() => setCalendarFilter("ALL")}
                      className={`px-2.5 py-1 rounded-md font-medium ${calendarFilter === "ALL" ? "bg-white shadow-2xs text-[#1E3A8A]" : "text-slate-600"}`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setCalendarFilter("BRANCHING")}
                      className={`px-2.5 py-1 rounded-md font-medium ${calendarFilter === "BRANCHING" ? "bg-white shadow-2xs text-[#1E3A8A]" : "text-slate-600"}`}
                    >
                      Branching
                    </button>
                    <button
                      onClick={() => setCalendarFilter("REVIEW")}
                      className={`px-2.5 py-1 rounded-md font-medium ${calendarFilter === "REVIEW" ? "bg-white shadow-2xs text-[#1E3A8A]" : "text-slate-600"}`}
                    >
                      Review
                    </button>
                  </div>

                  <button
                    onClick={() => navigate("/lecturer/cases")}
                    className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-[#1E3A8A]/90 transition-colors shadow-2xs"
                  >
                    + Tạo Case mới
                  </button>
                </div>
              </div>

              {/* Month Calendar Grid */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-[11px] font-semibold text-slate-500 py-2">
                  <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
                </div>

                {/* 5 Weeks Grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
                  {/* Row 1 */}
                  <div className="h-20 p-1.5"><span className="text-slate-700">1</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">2</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">3</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">4</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">5</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">6</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">7</span></div>

                  {/* Row 2 */}
                  <div className="h-20 p-1.5"><span className="text-slate-700">8</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">9</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">10</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">11</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">12</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">13</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">14</span></div>

                  {/* Row 3 */}
                  <div className="h-20 p-1.5"><span className="text-slate-700">15</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">16</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">17</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">18</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">19</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">20</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">21</span></div>

                  {/* Row 4 */}
                  <div className="h-20 p-1.5"><span className="text-slate-700">22</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">23</span></div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">24</span></div>
                  {/* 25: Rò rỉ dữ liệu */}
                  <div className="h-20 p-1.5 bg-blue-50/30">
                    <span className="text-[#0284C7] font-bold">25</span>
                    <div className="mt-1 p-1 rounded bg-[#0284C7] text-white text-[9px] leading-tight font-medium">
                      Rò rỉ dữ liệu<br />Hạn nộp · 23:59
                    </div>
                  </div>
                  <div className="h-20 p-1.5"><span className="text-slate-700">26</span></div>
                  {/* 27: Khôi phục dữ liệu */}
                  <div className="h-20 p-1.5 bg-blue-50/30">
                    <span className="text-[#1E3A8A] font-bold">27</span>
                    <div className="mt-1 p-1 rounded bg-[#1E3A8A] text-white text-[9px] leading-tight font-medium">
                      Khôi phục dữ liệu<br />Hạn nộp · 23:59
                    </div>
                  </div>
                  {/* 28: Sự cố triển khai */}
                  <div className="h-20 p-1.5 bg-blue-50/30">
                    <span className="text-[#1E3A8A] font-bold">28</span>
                    <div className="mt-1 p-1 rounded bg-[#1E3A8A] text-white text-[9px] leading-tight font-medium">
                      Sự cố triển khai<br />Hạn nộp · 23:59
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="h-20 p-1.5"><span className="text-slate-700">29</span></div>
                  {/* 30: Quá tải ĐKHP */}
                  <div className="h-20 p-1.5 bg-blue-50/30">
                    <span className="text-[#1E3A8A] font-bold">30</span>
                    <div className="mt-1 p-1 rounded bg-[#1E3A8A] text-white text-[9px] leading-tight font-medium">
                      Quá tải ĐKHP<br />Hạn nộp · 23:59
                    </div>
                  </div>
                  <div className="h-20 p-1.5 bg-slate-50/50"><span className="text-slate-300">1</span></div>
                  <div className="h-20 p-1.5 bg-slate-50/50"><span className="text-slate-300">2</span></div>
                  <div className="h-20 p-1.5 bg-slate-50/50"><span className="text-slate-300">3</span></div>
                  <div className="h-20 p-1.5 bg-slate-50/50"><span className="text-slate-300">4</span></div>
                  <div className="h-20 p-1.5 bg-slate-50/50"><span className="text-slate-300">5</span></div>
                </div>
              </div>
            </div>

            {/* Right List (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Bài nộp chờ bạn phản hồi (4) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Bài nộp chờ bạn phản hồi (4)
                </h3>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] font-bold text-xs">NA</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Nguyễn Minh Anh</div>
                        <div className="text-[10px] text-slate-400">Quá tải ĐKHP · Lần làm #2</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] font-bold text-xs">TB</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Trần Quốc Bảo</div>
                        <div className="text-[10px] text-slate-400">Quá tải ĐKHP · Lần làm #1</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] font-bold text-xs">LH</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Lê Thu Hà</div>
                        <div className="text-[10px] text-slate-400">Rò rỉ dữ liệu · Lần làm #1</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] font-bold text-xs">PH</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Phạm Gia Huy</div>
                        <div className="text-[10px] text-slate-400">Quá tải ĐKHP · Lần làm #1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thiết kế tình huống mới CTA Card */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#1E3A8A]">Thiết kế tình huống mới</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sinh case nháp từ tài liệu môn học đã lập chỉ mục, sau đó rà soát và phê duyệt.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/lecturer/ai-studio")}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <span>+</span>
                  <span>Tạo Case mới bằng AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
