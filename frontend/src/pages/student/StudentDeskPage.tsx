import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function StudentDeskPage() {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState("BLACK_FRIDAY");
  const [timeFilter, setTimeFilter] = useState("THIS_WEEK");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Bàn học</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            HOLD · OPD-001
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Không gian học tập cá nhân, theo dõi bài tập được giao, thời lượng học và phản hồi từ giảng viên.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                🌿
              </span>
              <span>Case được giao</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">3</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                ⏱
              </span>
              <span>Đang làm dở</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">1</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                📄
              </span>
              <span>Đã nộp · 1 có phản hồi</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">3</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 6 Analytics Cards (8 cols) & Right Widgets (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT SECTION (8 cols) ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Số bước đã đi qua */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">Số bước đã đi qua</h3>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none"
                >
                  <option value="BLACK_FRIDAY">Black Friday</option>
                  <option value="NOVAPAY">NovaPay</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">Tổng số bước</div>
              <div className="text-xl font-bold text-slate-900 mb-4">4</div>

              <div className="relative h-40 flex items-end justify-around px-8 pt-6 border-b border-slate-100 pb-1">
                {/* Tooltip on Attempt 1 */}
                <div className="absolute top-1 left-6 bg-slate-900 text-white text-[10px] rounded-md px-2 py-1 shadow-md pointer-events-none">
                  <div className="font-semibold">Lần làm #1</div>
                  <div className="text-blue-200">3 bước · Đã nộp</div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 bg-[#1E3A8A] rounded-t-lg h-24 shadow-xs"></div>
                  <span className="text-[10px] text-slate-600 font-semibold mt-1">Lần #1</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 bg-[#0284C7] rounded-t-lg h-10 shadow-xs"></div>
                  <span className="text-[10px] text-slate-600 font-semibold mt-1">Lần #2</span>
                </div>
              </div>
            </div>

            {/* 2. Thời gian học */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">Thời gian học</h3>
                <span className="text-[11px] text-slate-500">Tuần này</span>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">Tổng thời gian</div>
              <div className="text-xl font-bold text-slate-900 mb-4">3 giờ 20 phút</div>

              <div className="relative h-40 flex flex-col justify-end">
                <svg className="w-full h-28 overflow-visible" viewBox="0 0 240 100" fill="none">
                  <path
                    d="M 10 70 C 40 60, 60 85, 100 80 C 140 75, 160 30, 190 25 C 210 20, 230 65, 235 60"
                    stroke="#1E3A8A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Peak Marker: 65 phút on T6 */}
                  <line x1="190" y1="25" x2="190" y2="100" stroke="#0284C7" strokeWidth="4" />
                  <rect x="175" y="8" width="30" height="15" rx="4" fill="#0284C7" />
                  <text x="190" y="19" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">65 phút</text>
                </svg>

                <div className="flex items-center justify-between pt-1 text-[9px] font-semibold text-slate-400">
                  <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span className="text-[#0284C7]">T6</span><span>T7</span>
                </div>
              </div>
            </div>

            {/* 3. Case được giao (Semi-circle Donut) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">Case được giao</h3>
                <span className="text-[11px] text-slate-500">Học kỳ I</span>
              </div>

              <div className="relative flex flex-col items-center justify-center my-3">
                <div className="relative w-44 h-22 overflow-hidden">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="14" />
                    <path d="M 10 50 A 40 40 0 0 1 45 12" fill="none" stroke="#1E3A8A" strokeWidth="14" />
                    <path d="M 47 11 A 40 40 0 0 1 76 22" fill="none" stroke="#0284C7" strokeWidth="14" />
                    <path d="M 78 24 A 40 40 0 0 1 90 50" fill="none" stroke="#CBD5E1" strokeWidth="14" />
                  </svg>
                  <div className="absolute bottom-0 inset-x-0 text-center">
                    <span className="text-lg font-bold text-slate-900 leading-none">3</span>
                    <div className="text-[10px] text-slate-400 font-medium">Case Study</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A8A]"></span>
                    <span className="text-slate-700">Đang làm</span>
                  </div>
                  <div className="font-bold text-slate-900">1 <span className="text-[10px] text-slate-400 font-normal">33%</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7]"></span>
                    <span className="text-slate-700">Đã nộp</span>
                  </div>
                  <div className="font-bold text-slate-900">1 <span className="text-[10px] text-slate-400 font-normal">33%</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span>
                    <span className="text-slate-700">Chưa bắt đầu</span>
                  </div>
                  <div className="font-bold text-slate-900">1 <span className="text-[10px] text-slate-400 font-normal">33%</span></div>
                </div>
              </div>
            </div>

            {/* 4. Thời điểm học (Heatmap) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900">Thời điểm học</h3>
                <span className="text-[11px] text-slate-500">Tuần này</span>
              </div>

              <div className="space-y-1">
                {["22h", "20h", "18h", "15h", "10h", "6h"].map((hour, idx) => (
                  <div key={hour} className="flex items-center gap-1">
                    <span className="w-5 text-[9px] text-slate-400 text-right">{hour}</span>
                    <div className="grid grid-cols-7 gap-1 flex-1">
                      <span className={`h-3.5 rounded ${idx === 2 ? "bg-[#0284C7]" : "bg-blue-50/60"}`}></span>
                      <span className={`h-3.5 rounded ${idx === 2 ? "bg-[#1E3A8A]" : "bg-blue-100"}`}></span>
                      <span className={`h-3.5 rounded ${idx === 2 ? "bg-[#1E3A8A]" : "bg-blue-100"}`}></span>
                      <span className={`h-3.5 rounded ${idx === 2 ? "bg-[#0284C7]" : "bg-blue-100"}`}></span>
                      <span className="h-3.5 rounded bg-blue-50/70"></span>
                      <span className="h-3.5 rounded bg-blue-50/40"></span>
                      <span className="h-3.5 rounded bg-blue-50/40"></span>
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

            {/* 5. Học phần của tôi */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 mb-3">Học phần của tôi</h3>

              <div className="h-32 flex items-end justify-around px-8 border-b border-slate-100 pb-1">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-800">2</span>
                  <div className="w-12 bg-[#1E3A8A] rounded-t-lg h-24"></div>
                  <span className="text-[9px] font-semibold text-slate-500 mt-1">SE2024</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-800">1</span>
                  <div className="w-12 bg-[#0284C7] rounded-t-lg h-14"></div>
                  <span className="text-[9px] font-semibold text-slate-500 mt-1">MKT2024</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 text-[10px] text-slate-600">
                <span>• Hệ thống phân tán: <b className="text-slate-900">2 (67%)</b></span>
                <span>• Marketing số: <b className="text-slate-900">1 (33%)</b></span>
              </div>
            </div>

            {/* 6. Case được giao */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-900 mb-2">Case được giao</h3>
              <div className="space-y-2.5">
                {/* Case 1 */}
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1E3A8A]">🌿</span>
                    <div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-[#1E3A8A] font-semibold">Đang làm</span>
                      <Link to="/student/cases/cs301/branching-play" className="block text-xs font-bold text-slate-800 hover:text-[#1E3A8A] truncate max-w-[150px]">
                        Khủng hoảng sập hệ thống...
                      </Link>
                      <span className="text-[10px] text-slate-400">Hạn 20/11</span>
                    </div>
                  </div>
                </div>

                {/* Case 2 */}
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#0284C7]">📄</span>
                    <div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-semibold">Đã nộp</span>
                      <Link to="/student/cases/cs301/review-study" className="block text-xs font-bold text-slate-800 hover:text-[#0284C7] truncate max-w-[150px]">
                        Tối ưu chiến dịch ra mắt ví...
                      </Link>
                      <span className="text-[10px] text-slate-400">Hạn 24/11</span>
                    </div>
                  </div>
                </div>

                {/* Case 3 */}
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">🌿</span>
                    <div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-700 font-semibold">Chưa bắt đầu</span>
                      <span className="block text-xs font-bold text-slate-800 truncate max-w-[150px]">
                        Khôi phục dịch vụ khi trung tâm...
                      </span>
                      <span className="text-[10px] text-slate-400">Hạn 27/11</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SECTION: SIDEBAR WIDGETS (4 cols) ───────────────── */}
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
              <span className="py-1">15</span><span className="py-1">16</span><span className="py-1">17</span><span className="py-1">18</span><span className="py-1">19</span>
              <span className="py-1 text-[#1E3A8A] font-bold">20</span><span className="py-1">21</span>
              <span className="py-1">22</span><span className="py-1">23</span><span className="py-1 text-[#0284C7] font-bold">24</span><span className="py-1">25</span><span className="py-1">26</span><span className="py-1 text-[#1E3A8A] font-bold">27</span><span className="py-1">28</span>
              <span className="py-1">29</span><span className="py-1">30</span>
            </div>
          </div>

          {/* Hạn nộp sắp tới */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Hạn nộp sắp tới
            </h3>
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold">20</span>
                <span className="text-[9px] text-blue-200">T11</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-semibold text-blue-800 bg-blue-100 px-1 rounded">Branching 23:59</span>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Khủng hoảng sập hệ thống thanh t...</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#0284C7] text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold">24</span>
                <span className="text-[9px] text-sky-100">T11</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-semibold text-sky-800 bg-sky-100 px-1 rounded">Review 23:59</span>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Tối ưu chiến dịch ra mắt ví điện tử...</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#0284C7] text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold">27</span>
                <span className="text-[9px] text-sky-100">T11</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-semibold text-blue-800 bg-blue-100 px-1 rounded">Branching 23:59</span>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Khôi phục dịch vụ khi trung tâm d...</div>
              </div>
            </div>
          </div>

          {/* Thông báo */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Thông báo
            </h3>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] shrink-0 mt-0.5">🔔</span>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Sắp đến hạn</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Black Friday hết hạn ngày 20/11</div>
                <div className="text-[10px] text-slate-400">Hệ thống phân tán</div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">💬</span>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Có phản hồi</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Giảng viên đã nhận xét bài NovaPay</div>
                <div className="text-[10px] text-slate-400">Marketing số</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

