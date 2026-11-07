import React, { useState } from "react";
import { Link } from "react-router-dom";

export function StatisticsPage() {
  const [selectedCase, setSelectedCase] = useState("QUATAIDKHP");
  const [timeFilter, setTimeFilter] = useState("THIS_WEEK");
  const [activeTooltip, setActiveTooltip] = useState<string | null>("A");

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Thống kê luồng học tập</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổng hợp dữ liệu rẽ nhánh, hành vi ra quyết định và tiến độ thực hành của sinh viên theo từng học phần.
        </p>
      </div>

      {/* Top 3 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>Tỷ lệ hoàn thành</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">71.4%</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </span>
              <span>Số lần làm trung bình</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">1.5 lượt</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </span>
              <span>Đang trong hành trình</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">8 sinh viên</div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Left: 6 Analytics Cards, Right: Calendar & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT SECTION: 6 ANALYTICS CARDS (Lg: 8 cols) ──────────── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Lựa chọn tại Tình huống 1 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">Lựa chọn tại Tình huống 1</h3>
                <div className="relative">
                  <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none"
                  >
                    <option value="QUATAIDKHP">Quá tải ĐKHP</option>
                    <option value="RORIDULIEU">Rò rỉ dữ liệu</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">Tổng lượt chọn</div>
              <div className="text-xl font-bold text-slate-900 mb-4">42</div>

              {/* Bar Chart Representation with Tooltip */}
              <div className="relative h-44 flex items-end justify-between px-6 pt-6 pb-2 border-b border-slate-100">
                {/* Tooltip on Option A */}
                {activeTooltip === "A" && (
                  <div className="absolute top-1 left-4 bg-slate-900 text-white text-[10px] rounded-md px-2.5 py-1 shadow-md pointer-events-none">
                    <div className="font-semibold">Hàng đợi ảo: 24</div>
                    <div className="text-blue-200">57% lượt chọn</div>
                  </div>
                )}

                {/* Option A */}
                <div
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  onMouseEnter={() => setActiveTooltip("A")}
                >
                  <div className="text-[10px] font-bold text-[#1E3A8A]">24</div>
                  <div className="w-12 bg-[#1E3A8A] rounded-t-lg h-28 group-hover:brightness-110 transition-all shadow-xs"></div>
                </div>

                {/* Option B */}
                <div
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  onMouseEnter={() => setActiveTooltip("B")}
                  onMouseLeave={() => setActiveTooltip("A")}
                >
                  <div className="text-[10px] font-semibold text-slate-500">8</div>
                  <div className="w-12 bg-sky-600/80 rounded-t-lg h-10 group-hover:brightness-110 transition-all shadow-xs"></div>
                </div>

                {/* Option C */}
                <div
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  onMouseEnter={() => setActiveTooltip("C")}
                  onMouseLeave={() => setActiveTooltip("A")}
                >
                  <div className="text-[10px] font-semibold text-slate-500">10</div>
                  <div className="w-12 bg-slate-700 rounded-t-lg h-14 group-hover:brightness-110 transition-all shadow-xs"></div>
                </div>
              </div>

              {/* Labels */}
              <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-semibold text-slate-500">
                <span>Phương án A</span>
                <span>Phương án B</span>
                <span>Phương án C</span>
              </div>
            </div>

            {/* 2. Phân bố số lần làm bài */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 mb-2">Phân bố số lần làm bài</h3>
              <div className="text-[11px] text-slate-400 font-medium">Sinh viên đã làm</div>
              <div className="text-xl font-bold text-slate-900 mb-4">42</div>

              {/* Smooth Curved Line Graph SVG */}
              <div className="relative h-44 flex flex-col justify-end">
                <svg className="w-full h-32 overflow-visible" viewBox="0 0 300 120" fill="none">
                  <defs>
                    <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="300" y2="120" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Area fill */}
                  <path
                    d="M 20 20 C 60 25, 90 75, 120 85 C 160 98, 200 108, 280 115 L 280 120 L 20 120 Z"
                    fill="url(#gradientBlue)"
                  />
                  {/* Curve Line */}
                  <path
                    d="M 20 20 C 60 25, 90 75, 120 85 C 160 98, 200 108, 280 115"
                    stroke="#1E3A8A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Peak Marker: 28 SV at 1 lần */}
                  <circle cx="20" cy="20" r="5" fill="#1E3A8A" stroke="#ffffff" strokeWidth="2" />
                  <rect x="8" y="0" width="24" height="14" rx="4" fill="#1E3A8A" />
                  <text x="20" y="10" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">28</text>

                  {/* Marker 2: 10 SV */}
                  <circle cx="120" cy="85" r="3" fill="#1E3A8A" />
                  {/* Marker 3: 3 SV */}
                  <circle cx="200" cy="108" r="3" fill="#1E3A8A" />
                  {/* Marker 4: 1 SV */}
                  <circle cx="280" cy="115" r="3" fill="#1E3A8A" />
                </svg>

                {/* X Axis */}
                <div className="flex items-center justify-between pt-2 text-[10px] font-semibold text-slate-500">
                  <span>1 lần</span>
                  <span>2 lần</span>
                  <span>3 lần</span>
                  <span>&gt;=4 lần</span>
                </div>
              </div>
            </div>

            {/* 3. Kết quả cuối cùng (Donut / Semi-Circle) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">Kết quả cuối cùng</h3>
                <div className="relative">
                  <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none"
                  >
                    <option value="QUATAIDKHP">Quá tải ĐKHP</option>
                  </select>
                </div>
              </div>

              {/* Semi-circle representation */}
              <div className="relative flex flex-col items-center justify-center my-2">
                <div className="relative w-48 h-24 overflow-hidden">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    {/* Background Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="14"
                    />
                    {/* Dark Navy: Phục hồi ngoạn mục (52%) */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 52 10"
                      fill="none"
                      stroke="#1E3A8A"
                      strokeWidth="14"
                    />
                    {/* Cyan/Light Blue: Tổn thất vừa (33%) */}
                    <path
                      d="M 54 10 A 40 40 0 0 1 82 25"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="14"
                    />
                    {/* Gray: Sập toàn bộ (14%) */}
                    <path
                      d="M 83 27 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="14"
                    />
                  </svg>
                  <div className="absolute bottom-0 inset-x-0 text-center">
                    <span className="text-lg font-bold text-slate-900 leading-none">42</span>
                    <div className="text-[10px] text-slate-400 font-medium">kết cục</div>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 pt-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A8A]"></span>
                    <span className="text-slate-700">Phục hồi ngoạn mục</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>22</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-50 text-[#1E3A8A]">52%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7]"></span>
                    <span className="text-slate-700">Tổn thất vừa</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>14</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-50 text-sky-700">33%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span>
                    <span className="text-slate-700">Sập toàn bộ</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>6</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600">14%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Thời điểm làm bài (Heatmap) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900">Thời điểm làm bài</h3>
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none"
                  >
                    <option value="THIS_WEEK">Tuần này</option>
                    <option value="LAST_WEEK">Tuần trước</option>
                  </select>
                </div>
              </div>

              {/* Heatmap Grid (Hours x Days) */}
              <div className="space-y-1 pt-1">
                {/* Row 21h */}
                <div className="flex items-center gap-1">
                  <span className="w-6 text-[9px] text-slate-400 font-medium text-right">21h</span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-[#0284C7] shadow-2xs"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                  </div>
                </div>

                {/* Row 17h */}
                <div className="flex items-center gap-1">
                  <span className="w-6 text-[9px] text-slate-400 font-medium text-right">17h</span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-[#0284C7]"></span>
                    <span className="h-5 rounded bg-[#1E3A8A] shadow-2xs"></span>
                    <span className="h-5 rounded bg-blue-200"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                  </div>
                </div>

                {/* Row 15h */}
                <div className="flex items-center gap-1">
                  <span className="w-6 text-[9px] text-slate-400 font-medium text-right">15h</span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-200"></span>
                    <span className="h-5 rounded bg-[#0284C7]"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                  </div>
                </div>

                {/* Row 13h */}
                <div className="flex items-center gap-1">
                  <span className="w-6 text-[9px] text-slate-400 font-medium text-right">13h</span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                  </div>
                </div>

                {/* Row 9h */}
                <div className="flex items-center gap-1">
                  <span className="w-6 text-[9px] text-slate-400 font-medium text-right">9h</span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    <span className="h-5 rounded bg-blue-50/40"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-100"></span>
                    <span className="h-5 rounded bg-blue-50/70"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                    <span className="h-5 rounded bg-blue-50/40"></span>
                  </div>
                </div>

                {/* Days Label */}
                <div className="flex items-center gap-1 pt-1">
                  <span className="w-6"></span>
                  <div className="grid grid-cols-7 gap-1 flex-1 text-center text-[9px] font-semibold text-slate-400">
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span>CN</span>
                  </div>
                </div>
              </div>

              {/* Heatmap Density Legend */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-3 border-t border-slate-100 mt-2">
                <span>Ít</span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-50"></span>
                  <span className="w-2.5 h-2.5 rounded bg-blue-100"></span>
                  <span className="w-2.5 h-2.5 rounded bg-blue-200"></span>
                  <span className="w-2.5 h-2.5 rounded bg-[#0284C7]"></span>
                  <span className="w-2.5 h-2.5 rounded bg-[#1E3A8A]"></span>
                </div>
                <span>Nhiều</span>
              </div>
            </div>

            {/* 5. Tiến độ lớp (42 sinh viên) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900">Tiến độ lớp (42 sinh viên)</h3>
                <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 shadow-2xs transition-colors">
                  <span>Xuất báo cáo</span>
                  <span>⭳</span>
                </button>
              </div>

              {/* Vertical Bars */}
              <div className="h-36 flex items-end justify-between px-8 border-b border-slate-100 pb-2">
                {/* Bar 1: Hoàn thành */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-[#1E3A8A]">30</span>
                  <div className="w-12 bg-[#1E3A8A] rounded-t-lg h-28 shadow-xs"></div>
                  <span className="text-[10px] font-medium text-slate-600 mt-1">Hoàn thành</span>
                </div>

                {/* Bar 2: Đang làm */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-sky-600">8</span>
                  <div className="w-12 bg-sky-500 rounded-t-lg h-10 shadow-xs"></div>
                  <span className="text-[10px] font-medium text-slate-600 mt-1">Đang làm</span>
                </div>

                {/* Bar 3: Chưa bắt đầu */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">4</span>
                  <div className="w-12 bg-slate-200 rounded-t-lg h-6"></div>
                  <span className="text-[10px] font-medium text-slate-600 mt-1">Chưa bắt đầu</span>
                </div>
              </div>

              {/* Detailed Summary */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-[10px] text-center">
                <div className="p-1.5 rounded-lg bg-blue-50/60">
                  <div className="text-slate-500 font-medium">Đã hoàn thành</div>
                  <div className="font-bold text-[#1E3A8A] mt-0.5">30 (71%)</div>
                </div>
                <div className="p-1.5 rounded-lg bg-sky-50/60">
                  <div className="text-slate-500 font-medium">Đang trong hành trình</div>
                  <div className="font-bold text-sky-700 mt-0.5">8 (19%)</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <div className="text-slate-500 font-medium">Chưa bắt đầu</div>
                  <div className="font-bold text-slate-600 mt-0.5">4 (10%)</div>
                </div>
              </div>
            </div>

            {/* 6. Case Study đang mở */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-900 mb-3">Case Study đang mở</h3>

              <div className="space-y-3">
                {/* Item 1 */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-[#1E3A8A]">Branching</span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">Khủng hoảng quá tải hệ thống...</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hạn 30/11</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <span>👥</span>
                    <span>42</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-100 text-sky-800">Review</span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">Rò rỉ dữ liệu khách hàng</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hạn 25/11</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <span>👥</span>
                    <span>42</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-[#1E3A8A]">Branching</span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">Sự cố triển khai phiên bản mới</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hạn 28/11</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <span>👥</span>
                    <span>42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SECTION: SIDEBAR WIDGETS (Lg: 4 cols) ───────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: Mini Calendar Tháng 11, 2026 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900">Tháng 11, 2026</h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-700">▼</button>
                <button className="p-1 hover:text-slate-700">▲</button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-2">
              <span>CN</span>
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
            </div>

            {/* Dates Grid (Nov 2026) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700">
              <span className="py-1.5">1</span>
              <span className="py-1.5">2</span>
              <span className="py-1.5">3</span>
              <span className="py-1.5">4</span>
              <span className="py-1.5">5</span>
              {/* Day 6 (Today: Navy Circle) */}
              <span className="py-1.5 flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                  6
                </span>
              </span>
              <span className="py-1.5">7</span>

              <span className="py-1.5">8</span>
              <span className="py-1.5">9</span>
              <span className="py-1.5">10</span>
              <span className="py-1.5">11</span>
              <span className="py-1.5">12</span>
              <span className="py-1.5">13</span>
              <span className="py-1.5">14</span>

              <span className="py-1.5">15</span>
              <span className="py-1.5">16</span>
              <span className="py-1.5">17</span>
              <span className="py-1.5">18</span>
              <span className="py-1.5">19</span>
              <span className="py-1.5">20</span>
              <span className="py-1.5">21</span>

              <span className="py-1.5">22</span>
              <span className="py-1.5">23</span>
              <span className="py-1.5">24</span>
              {/* Day 25 (Deadline 1) */}
              <span className="py-1.5 relative">
                <span className="text-[#1E3A8A] font-bold">25</span>
                <span className="absolute bottom-0.5 inset-x-0 mx-auto w-1 h-1 rounded-full bg-[#1E3A8A]"></span>
              </span>
              <span className="py-1.5">26</span>
              <span className="py-1.5">27</span>
              {/* Day 28 (Deadline 2) */}
              <span className="py-1.5 relative">
                <span className="text-[#1E3A8A] font-bold">28</span>
                <span className="absolute bottom-0.5 inset-x-0 mx-auto w-1 h-1 rounded-full bg-[#1E3A8A]"></span>
              </span>

              <span className="py-1.5">29</span>
              {/* Day 30 (Deadline 3) */}
              <span className="py-1.5 relative">
                <span className="text-[#1E3A8A] font-bold">30</span>
                <span className="absolute bottom-0.5 inset-x-0 mx-auto w-1 h-1 rounded-full bg-[#1E3A8A]"></span>
              </span>
              <span className="py-1.5 text-slate-300">1</span>
              <span className="py-1.5 text-slate-300">2</span>
              <span className="py-1.5 text-slate-300">3</span>
              <span className="py-1.5 text-slate-300">4</span>
              <span className="py-1.5 text-slate-300">5</span>
            </div>
          </div>

          {/* Widget 2: Hạn nộp sắp tới */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Hạn nộp sắp tới
            </h3>

            {/* Deadline 1 */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-[#1E3A8A] text-white shrink-0">
                <span className="text-xs font-bold leading-none">25</span>
                <span className="text-[9px] text-blue-200">T11</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-100 text-sky-800">Review 23:59</span>
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  Rò rỉ dữ liệu khách hàng
                </div>
              </div>
            </div>

            {/* Deadline 2 */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-[#0284C7] text-white shrink-0">
                <span className="text-xs font-bold leading-none">28</span>
                <span className="text-[9px] text-sky-100">T11</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-[#1E3A8A]">Branching 23:59</span>
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  Sự cố triển khai phiên bản mới
                </div>
              </div>
            </div>

            {/* Deadline 3 */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-[#0284C7] text-white shrink-0">
                <span className="text-xs font-bold leading-none">30</span>
                <span className="text-[9px] text-sky-100">T11</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-[#1E3A8A]">Branching 23:59</span>
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  Khủng hoảng quá tải hệ thống ĐK...
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Bài nộp gần đây */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Bài nộp gần đây
            </h3>

            {/* Item 1 */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A] shrink-0 mt-0.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#FEF3C7] text-amber-800">Chờ phản hồi</span>
                  <span className="text-[10px] text-slate-400">23/10 · 09:42</span>
                </div>
                <Link to="/lecturer/feedback/sub-01" className="block text-xs font-bold text-slate-800 hover:text-[#1E3A8A] mt-1 transition-colors">
                  Nguyễn Minh Anh nộp lần làm #2
                </Link>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A] text-white shrink-0 mt-0.5 font-bold text-[10px]">
                TB
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#FEF3C7] text-amber-800">Chờ phản hồi</span>
                  <span className="text-[10px] text-slate-400">23/10 · 09:15</span>
                </div>
                <Link to="/lecturer/feedback/sub-02" className="block text-xs font-bold text-slate-800 hover:text-[#1E3A8A] mt-1 transition-colors">
                  Trần Quốc Bảo nộp lần làm #1
                </Link>
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A] shrink-0 mt-0.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#FEF3C7] text-amber-800">Chờ phản hồi</span>
                  <span className="text-[10px] text-slate-400">22/10 · 20:30</span>
                </div>
                <Link to="/lecturer/feedback/sub-03" className="block text-xs font-bold text-slate-800 hover:text-[#1E3A8A] mt-1 transition-colors">
                  Lê Thu Hà nộp lần làm #1
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
