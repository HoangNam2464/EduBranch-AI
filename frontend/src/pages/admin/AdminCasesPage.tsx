import { useState } from "react";
import { Link } from "react-router-dom";

export function AdminCasesPage() {
  const [searchCase, setSearchCase] = useState("");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cases, setCases] = useState([
    {
      id: "CS-01",
      createDate: "21/10/2026",
      title: "Xử lý khủng hoảng truyền thông",
      course: "Quản trị học",
      structure: "12 nút",
      lecturer: "Nguyễn Minh Anh",
      mode: "Branching Study",
      status: "Đã xuất bản",
    },
    {
      id: "CS-02",
      createDate: "20/10/2026",
      title: "Đạo đức trong tuyển dụng",
      course: "Đạo đức kinh doanh",
      structure: "Không dùng cây",
      lecturer: "Lê Thu Hà",
      mode: "Review Study",
      status: "Đã xuất bản",
    },
    {
      id: "CS-03",
      createDate: "19/10/2026",
      title: "Chiến lược giá cho sản phẩm mới",
      course: "Marketing căn bản",
      structure: "8 nút",
      lecturer: "Trần Đức Huy",
      mode: "Branching Study",
      status: "Bản nháp",
    },
    {
      id: "CS-04",
      createDate: "18/10/2026",
      title: "Tối ưu chuỗi cung ứng xanh",
      course: "Quản trị vận hành",
      structure: "15 nút",
      lecturer: "Nguyễn Minh Anh",
      mode: "Branching Study",
      status: "Đã xuất bản",
    },
    {
      id: "CS-05",
      createDate: "17/10/2026",
      title: "Phân tích báo cáo tài chính",
      course: "Tài chính doanh nghiệp",
      structure: "Không dùng cây",
      lecturer: "Lê Thu Hà",
      mode: "Review Study",
      status: "Bản nháp",
    },
    {
      id: "CS-06",
      createDate: "16/10/2026",
      title: "Giải quyết xung đột trong nhóm",
      course: "Hành vi tổ chức",
      structure: "10 nút",
      lecturer: "Trần Đức Huy",
      mode: "Branching Study",
      status: "Đã xuất bản",
    },
    {
      id: "CS-07",
      createDate: "12/10/2026",
      title: "Chuyển đổi số tại doanh nghiệp",
      course: "Quản trị học",
      structure: "9 nút",
      lecturer: "Nguyễn Minh Anh",
      mode: "Branching Study",
      status: "Bản nháp",
    },
    {
      id: "CS-08",
      createDate: "10/10/2026",
      title: "Trách nhiệm xã hội của thương hiệu",
      course: "Marketing căn bản",
      structure: "Không dùng cây",
      lecturer: "Trần Đức Huy",
      mode: "Review Study",
      status: "Bản nháp",
    },
  ]);

  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchCase.toLowerCase()) ||
      c.course.toLowerCase().includes(searchCase.toLowerCase()) ||
      c.lecturer.toLowerCase().includes(searchCase.toLowerCase());
    const matchMode =
      modeFilter === "ALL" ||
      (modeFilter === "BRANCHING" && c.mode === "Branching Study") ||
      (modeFilter === "REVIEW" && c.mode === "Review Study");
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && c.status === "Đã xuất bản") ||
      (statusFilter === "DRAFT" && c.status === "Bản nháp");
    return matchSearch && matchMode && matchStatus;
  });

  function handleArchive(caseId: string) {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: "Đã lưu trữ" } : c))
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Area: 4 Metric Cards + Case Study By Mode Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 4 Metric Cards in 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bản nháp */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Bản nháp</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">2</p>
            </div>
          </div>

          {/* Đã xuất bản */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Đã xuất bản</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">4</p>
            </div>
          </div>

          {/* Đã lưu trữ */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect width="22" height="5" x="1" y="3" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Đã lưu trữ</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">2</p>
            </div>
          </div>

          {/* Khóa học có case */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Khóa học có case</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">6</p>
            </div>
          </div>
        </div>

        {/* Right: Case Study theo chế độ */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Case Study theo chế độ</h3>
            <select className="text-[11px] border border-slate-200 rounded-lg px-2 py-0.5 bg-slate-50 text-slate-700 outline-none">
              <option>Mọi khóa học</option>
            </select>
          </div>

          <div className="mt-3 flex items-end justify-between gap-4">
            {/* Bar chart comparison */}
            <div className="flex-1 h-28 flex items-end justify-around border-b border-slate-100 pb-1 px-4">
              {/* Branching Study */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#1E3A8A]">5</span>
                <div className="w-14 bg-[#1E3A8A] h-20 rounded-t-sm"></div>
                <span className="text-[10px] text-slate-600 font-medium">Branching Study</span>
              </div>

              {/* Review Study */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#0284C7]">3</span>
                <div className="w-14 bg-[#0284C7] h-12 rounded-t-sm"></div>
                <span className="text-[10px] text-slate-600 font-medium">Review Study</span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="w-48 pl-3 border-l border-slate-100 space-y-2.5 text-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span>
                  <span className="text-slate-800 font-bold text-xs">5 case</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Branching Study · 4 nút trở lên</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]"></span>
                  <span className="text-slate-800 font-bold text-xs">3 case</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Review Study · Không dùng cây</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Kho Case Study toàn hệ thống ── */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Kho Case Study toàn hệ thống</h3>
            <p className="text-[11px] text-slate-400">
              Tổng hợp kịch bản thực nghiệm từ tất cả học phần và giảng viên
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-52 shadow-2xs">
              <input
                type="text"
                placeholder="Tìm case..."
                value={searchCase}
                onChange={(e) => setSearchCase(e.target.value)}
                className="w-full bg-transparent outline-none placeholder-slate-400 text-xs"
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Filter Mode */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 outline-none"
            >
              <option value="ALL">Mọi chế độ</option>
              <option value="BRANCHING">Branching Study</option>
              <option value="REVIEW">Review Study</option>
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 outline-none"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="pb-2 font-semibold">Ngày tạo</th>
                <th className="pb-2 font-semibold">Tiêu đề tình huống</th>
                <th className="pb-2 font-semibold">Cấu trúc</th>
                <th className="pb-2 font-semibold">Giảng viên</th>
                <th className="pb-2 font-semibold">Chế độ</th>
                <th className="pb-2 font-semibold text-center">Trạng thái</th>
                <th className="pb-2 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  {/* Ngày tạo */}
                  <td className="py-3 text-slate-500 font-mono text-[11px]">
                    {c.createDate}
                  </td>

                  {/* Tiêu đề & Khóa học */}
                  <td className="py-3 max-w-xs">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {c.title}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Khóa: {c.course}
                    </p>
                  </td>

                  {/* Cấu trúc */}
                  <td className="py-3 text-slate-600 font-medium text-[11px]">
                    {c.structure}
                  </td>

                  {/* Giảng viên */}
                  <td className="py-3 text-slate-800 font-medium">
                    {c.lecturer}
                  </td>

                  {/* Chế độ */}
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.mode === "Branching Study"
                        ? "bg-blue-50 text-[#1E3A8A]"
                        : "bg-cyan-50 text-[#0284C7]"
                    }`}>
                      {c.mode}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      c.status === "Đã xuất bản"
                        ? "bg-emerald-50 text-emerald-700"
                        : c.status === "Bản nháp"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {c.status === "Đã xuất bản" && <span>●</span>}
                      {c.status}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/lecturer/cases/${c.id}/review`}
                        className="text-[#1E3A8A] font-semibold hover:underline text-[11px]"
                      >
                        Xem
                      </Link>
                      <button
                        onClick={() => handleArchive(c.id)}
                        className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                      >
                        Lưu trữ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs">
              <option>10</option>
              <option>25</option>
            </select>
            <span>trên 8 bản ghi</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-400 cursor-not-allowed">
              ‹
            </button>
            <span className="px-2.5 py-1 rounded bg-[#1E3A8A] text-white font-bold text-xs">
              1
            </span>
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-400 cursor-not-allowed">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

