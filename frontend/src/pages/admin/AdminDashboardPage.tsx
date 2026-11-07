import { useState } from "react";
import { Link } from "react-router-dom";

export function AdminDashboardPage() {
  const [selectedWeekRange, setSelectedWeekRange] = useState("5 tuần");
  const [selectedAiPeriod, setSelectedAiPeriod] = useState("7 ngày");
  const [selectedCaseScope, setSelectedCaseScope] = useState("Toàn hệ thống");

  return (
    <div className="space-y-6">
      {/* ── Top 3 Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Sinh viên */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sinh viên</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">3</p>
          </div>
        </div>

        {/* Metric 2: Giảng viên · 1 chờ duyệt */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#1E3A8A]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500">Giảng viên</p>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                1 chờ duyệt
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">4</p>
          </div>
        </div>

        {/* Metric 3: Khóa học đang mở */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Khóa học đang mở</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">3</p>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: 2/3 Dashboard Charts + 1/3 Right Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: 6 Analytics Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Người dùng mới theo tuần */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Người dùng mới theo tuần</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-slate-400">Đăng ký mới</span>
                    <span className="text-xl font-bold text-slate-900">7</span>
                  </div>
                </div>
                <select
                  value={selectedWeekRange}
                  onChange={(e) => setSelectedWeekRange(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 outline-none"
                >
                  <option>5 tuần</option>
                  <option>10 tuần</option>
                </select>
              </div>

              {/* Stacked Bar Chart */}
              <div className="mt-4 pt-2">
                <div className="flex items-center justify-end gap-3 text-[10px] text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span> Sinh viên
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8]"></span> Giảng viên
                  </span>
                </div>

                <div className="h-32 flex items-end justify-between gap-3 px-2 border-b border-slate-100 pb-1 relative">
                  {/* T38 */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full max-w-[28px] flex flex-col items-center">
                      <div className="w-full bg-[#38BDF8] h-8 rounded-t-xs"></div>
                    </div>
                    <span className="text-[10px] text-slate-400">T38</span>
                  </div>

                  {/* T39 */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full max-w-[28px] flex flex-col items-center">
                      <div className="w-full bg-[#1E3A8A] h-8 rounded-t-xs"></div>
                    </div>
                    <span className="text-[10px] text-slate-400">T39</span>
                  </div>

                  {/* T40 */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full max-w-[28px] flex flex-col items-center">
                      <div className="w-full bg-[#0284C7] h-8 rounded-t-xs"></div>
                    </div>
                    <span className="text-[10px] text-slate-400">T40</span>
                  </div>

                  {/* T41 */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full max-w-[28px] flex flex-col items-center">
                      <div className="w-full bg-[#1E3A8A] h-8 rounded-t-xs"></div>
                      <div className="w-full bg-[#38BDF8] h-8"></div>
                    </div>
                    <span className="text-[10px] text-slate-400">T41</span>
                  </div>

                  {/* T42 (with Tooltip) */}
                  <div className="flex-1 flex flex-col items-center gap-1 relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-slate-900 text-white text-[9px] px-2 py-1 rounded shadow-md whitespace-nowrap z-10 flex flex-col items-center">
                      <span className="font-bold">Tuần 42</span>
                      <span className="text-slate-300">Sinh viên: 1 · Giảng viên: 1</span>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -bottom-0.5 absolute"></div>
                    </div>
                    <div className="w-full max-w-[28px] flex flex-col items-center">
                      <div className="w-full bg-[#1E3A8A] h-8 rounded-t-xs"></div>
                      <div className="w-full bg-[#38BDF8] h-8"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">T42</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Lượt gọi dịch vụ AI */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Lượt gọi dịch vụ AI</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-slate-900">6</span>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      14,790 tokens
                    </span>
                  </div>
                </div>
                <select
                  value={selectedAiPeriod}
                  onChange={(e) => setSelectedAiPeriod(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 outline-none"
                >
                  <option>7 ngày</option>
                  <option>30 ngày</option>
                </select>
              </div>

              {/* Spline curve visualization */}
              <div className="mt-3 pt-2">
                <div className="h-32 relative flex flex-col justify-end">
                  <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                    <defs>
                      <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Area */}
                    <path
                      d="M 10,85 C 40,80 60,65 90,60 C 120,55 130,20 160,20 C 190,20 210,50 240,25 C 265,10 285,60 295,85 L 295,95 L 10,95 Z"
                      fill="url(#aiGradient)"
                    />
                    {/* Spline Line */}
                    <path
                      d="M 10,85 C 40,80 60,65 90,60 C 120,55 130,20 160,20 C 190,20 210,50 240,25 C 265,10 285,60 295,85"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="2.5"
                    />
                    {/* Data Indicator at peak */}
                    <line x1="160" y1="20" x2="160" y2="95" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="160" cy="20" r="5" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="160" y="14" textAnchor="middle" fill="#1E3A8A" fontSize="9" fontWeight="bold">2</text>
                  </svg>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-1">
                    <span>T2</span>
                    <span>T3</span>
                    <span className="font-bold text-[#0284C7]">T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Case Study theo trạng thái */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Case Study theo trạng thái</h3>
                <select
                  value={selectedCaseScope}
                  onChange={(e) => setSelectedCaseScope(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 outline-none"
                >
                  <option>Toàn hệ thống</option>
                  <option>Theo khoa</option>
                </select>
              </div>

              {/* Donut Chart Gauge */}
              <div className="mt-3 flex flex-col items-center">
                <div className="relative w-40 h-24 flex items-end justify-center">
                  <svg viewBox="0 0 160 90" className="w-full h-full">
                    {/* Background Arc */}
                    <path
                      d="M 15 80 A 65 65 0 0 1 145 80"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
                    {/* Published Arc (60%) */}
                    <path
                      d="M 15 80 A 65 65 0 0 1 100 20"
                      fill="none"
                      stroke="#1E3A8A"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
                    {/* Draft Arc (40%) */}
                    <path
                      d="M 102 21 A 65 65 0 0 1 145 80"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute bottom-1 text-center">
                    <span className="text-xl font-bold text-slate-900 leading-none block">5</span>
                    <span className="text-[10px] text-slate-400 font-medium">Case Study</span>
                  </div>
                </div>

                <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-around text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span>
                    <span className="text-slate-600 text-[11px]">Đã xuất bản</span>
                    <span className="font-bold text-slate-900 ml-1">3</span>
                    <span className="text-[10px] text-slate-400">(60%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8]"></span>
                    <span className="text-slate-600 text-[11px]">Chưa xuất bản</span>
                    <span className="font-bold text-slate-900 ml-1">2</span>
                    <span className="text-[10px] text-slate-400">(40%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Hoạt động đăng nhập (Heatmap) */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Hoạt động đăng nhập</h3>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Tuần này
                </span>
              </div>

              {/* Heatmap Grid */}
              <div className="mt-3">
                <div className="grid grid-cols-8 gap-1 text-[9px] text-slate-400 items-center">
                  <span></span>
                  <span className="text-center">T2</span>
                  <span className="text-center">T3</span>
                  <span className="text-center">T4</span>
                  <span className="text-center">T5</span>
                  <span className="text-center">T6</span>
                  <span className="text-center">T7</span>
                  <span className="text-center">CN</span>

                  {/* 21h */}
                  <span className="text-right pr-1">21h</span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>

                  {/* 19h */}
                  <span className="text-right pr-1">19h</span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-[#0284C7]"></span>
                  <span className="h-3 rounded-xs bg-[#0284C7]"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>

                  {/* 17h */}
                  <span className="text-right pr-1">17h</span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-blue-300"></span>
                  <span className="h-3 rounded-xs bg-[#1E3A8A]"></span>
                  <span className="h-3 rounded-xs bg-[#0284C7]"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>

                  {/* 15h */}
                  <span className="text-right pr-1">15h</span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-[#0284C7]"></span>
                  <span className="h-3 rounded-xs bg-[#0284C7]"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>

                  {/* 13h */}
                  <span className="text-right pr-1">13h</span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-blue-200"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>

                  {/* 9h */}
                  <span className="text-right pr-1">9h</span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-blue-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                  <span className="h-3 rounded-xs bg-slate-100"></span>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-end gap-1 mt-3 pt-1 border-t border-slate-100 text-[9px] text-slate-400">
                  <span>Ít</span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-100"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-100"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-300"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span>
                  <span>Nhiều</span>
                </div>
              </div>
            </div>

            {/* 5. Giảng viên theo khoa */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Giảng viên theo khoa</h3>
                <span className="text-[10px] text-slate-400">4 Giảng viên</span>
              </div>

              <div className="mt-4 h-28 flex items-end justify-between gap-4 px-3 border-b border-slate-100 pb-1">
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700">1</span>
                  <div className="w-full max-w-[28px] bg-[#1E3A8A] h-14 rounded-t-xs"></div>
                  <span className="text-[10px] text-slate-500">QTKD</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700">1</span>
                  <div className="w-full max-w-[28px] bg-[#0284C7] h-14 rounded-t-xs"></div>
                  <span className="text-[10px] text-slate-500">Kinh tế</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700">1</span>
                  <div className="w-full max-w-[28px] bg-[#1E3A8A] h-14 rounded-t-xs"></div>
                  <span className="text-[10px] text-slate-500">Marketing</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700">1</span>
                  <div className="w-full max-w-[28px] bg-[#1E3A8A] h-14 rounded-t-xs"></div>
                  <span className="text-[10px] text-slate-500">CNTT</span>
                </div>
              </div>
            </div>

            {/* 6. Case Study mới xuất bản */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Case Study mới xuất bản</h3>
                <Link to="/admin/cases" className="text-[11px] text-[#0284C7] hover:underline font-semibold">
                  Xem tất cả
                </Link>
              </div>

              <div className="mt-3 space-y-2.5">
                {/* Case 1 */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#1E3A8A]">
                        Quản trị học
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                      Xử lý khủng hoảng truyền thông
                    </p>
                    <p className="text-[10px] text-slate-400">21/10/2026</p>
                  </div>
                </div>

                {/* Case 2 */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                        Đạo đức KD
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                      Đạo đức trong tuyển dụng
                    </p>
                    <p className="text-[10px] text-slate-400">20/10/2026</p>
                  </div>
                </div>

                {/* Case 3 */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700">
                        Vận hành
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                      Tối ưu chuỗi cung ứng xanh
                    </p>
                    <p className="text-[10px] text-slate-400">18/10/2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Calendar, Tasks to Handle & Security Log */}
        <div className="space-y-6">
          {/* Calendar Widget (Tháng 10, 2026) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Tháng 10, 2026</h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-600 cursor-pointer">▲</button>
                <button className="p-1 hover:text-slate-600 cursor-pointer">▼</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mt-3">
              <span className="text-slate-400 font-medium">CN</span>
              <span className="text-slate-400 font-medium">T2</span>
              <span className="text-slate-400 font-medium">T3</span>
              <span className="text-slate-400 font-medium">T4</span>
              <span className="text-slate-400 font-medium">T5</span>
              <span className="text-slate-400 font-medium">T6</span>
              <span className="text-slate-400 font-medium">T7</span>

              {/* Days row 1 */}
              <span className="text-slate-300 py-1">27</span>
              <span className="text-slate-300 py-1">28</span>
              <span className="text-slate-300 py-1">29</span>
              <span className="text-slate-300 py-1">30</span>
              <span className="text-slate-700 py-1">1</span>
              <span className="text-slate-700 py-1">2</span>
              <span className="text-slate-700 py-1">3</span>

              {/* Days row 2 */}
              <span className="text-slate-700 py-1">4</span>
              <span className="text-slate-700 py-1">5</span>
              <span className="text-slate-700 py-1">6</span>
              <span className="text-slate-700 py-1">7</span>
              <span className="text-slate-700 py-1">8</span>
              <span className="text-slate-700 py-1">9</span>
              <span className="text-slate-700 py-1">10</span>

              {/* Days row 3 */}
              <span className="text-slate-700 py-1">11</span>
              <span className="text-slate-700 py-1">12</span>
              <span className="text-slate-700 py-1">13</span>
              <span className="text-slate-700 py-1">14</span>
              <span className="text-slate-700 py-1">15</span>
              <span className="text-slate-700 py-1">16</span>
              <span className="text-slate-700 py-1">17</span>

              {/* Days row 4 */}
              <span className="text-slate-700 py-1">18</span>
              <span className="text-slate-700 py-1">19</span>
              <span className="text-slate-700 py-1">20</span>
              <span className="text-slate-700 py-1">21</span>
              {/* Active day 22 */}
              <span className="py-1">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A8A] text-white font-bold">
                  22
                </span>
              </span>
              <span className="text-slate-700 py-1">23</span>
              <span className="text-slate-700 py-1">24</span>

              {/* Days row 5 */}
              <span className="text-slate-700 py-1">25</span>
              <span className="text-slate-700 py-1">26</span>
              <span className="text-slate-700 py-1">27</span>
              <span className="text-slate-700 py-1">28</span>
              <span className="text-slate-700 py-1">29</span>
              <span className="text-slate-700 py-1">30</span>
              <span className="text-slate-700 py-1">31</span>
            </div>
          </div>

          {/* Việc cần xử lý */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Việc cần xử lý
            </h3>
            <div className="mt-3 space-y-2.5">
              {/* Task 1 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50/50 border border-blue-100/60">
                <div className="text-center rounded-lg bg-[#1E3A8A] text-white px-2 py-1">
                  <p className="text-[11px] font-bold leading-tight">22</p>
                  <p className="text-[8px] uppercase tracking-tighter">Th10</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Duyệt GV
                    </span>
                    <span className="text-[9px] text-slate-400">Chờ duyệt</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    Nguyễn Khánh Vy - Khoa CNTT
                  </p>
                </div>
              </div>

              {/* Task 2 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-center rounded-lg bg-slate-700 text-white px-2 py-1">
                  <p className="text-[11px] font-bold leading-tight">22</p>
                  <p className="text-[8px] uppercase tracking-tighter">Th10</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Khóa học
                    </span>
                    <span className="text-[9px] text-slate-400">Đã chuyển</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    Chuyển giao KH-02 cho Lê Thu Hà
                  </p>
                </div>
              </div>

              {/* Task 3 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-center rounded-lg bg-slate-700 text-white px-2 py-1">
                  <p className="text-[11px] font-bold leading-tight">22</p>
                  <p className="text-[8px] uppercase tracking-tighter">Th10</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      Dịch vụ AI
                    </span>
                    <span className="text-[9px] text-slate-400">Đã lưu</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    Cập nhật cấu hình mô hình AI
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nhật ký bảo mật */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Nhật ký bảo mật
            </h3>
            <div className="mt-3 space-y-3">
              {/* Log 1 */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-[#1E3A8A] mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#1E3A8A]">UPDATE_AI_CONFIG</span>
                  </div>
                  <p className="text-[11px] text-slate-700 truncate">
                    Quản trị viên cập nhật AiConfig (AI-01)
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    127.0.0.1 · 5 phút trước
                  </p>
                </div>
              </div>

              {/* Log 2 */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-800">PUBLISH_CASE</span>
                  </div>
                  <p className="text-[11px] text-slate-700 truncate">
                    Nguyễn Minh Anh xuất bản case CS-03
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    10.0.4.21 · 18 phút trước
                  </p>
                </div>
              </div>

              {/* Log 3 */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-[#1E3A8A] mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#1E3A8A]">APPROVE_LECTURER</span>
                  </div>
                  <p className="text-[11px] text-slate-700 truncate">
                    Quản trị viên duyệt tài khoản GV-03
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    127.0.0.1 · 32 phút trước
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

