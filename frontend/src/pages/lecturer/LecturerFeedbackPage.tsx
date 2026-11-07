import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface SubmissionItem {
  id: string;
  mssv: string;
  studentName: string;
  avatar: string;
  submittedAt: string;
  caseTitle: string;
  courseName: string;
  attemptNumber: number;
  status: "PENDING" | "REVIEWED";
}

const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub-01",
    mssv: "22110001",
    studentName: "Nguyễn Minh Anh",
    avatar: "NA",
    submittedAt: "23/10/2026 - 09:42",
    caseTitle: "Khủng hoảng quá tải hệ thống đăng ký học phần",
    courseName: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    attemptNumber: 2,
    status: "PENDING",
  },
  {
    id: "sub-02",
    mssv: "22110012",
    studentName: "Trần Quốc Bảo",
    avatar: "TB",
    submittedAt: "23/10/2026 - 09:15",
    caseTitle: "Khủng hoảng quá tải hệ thống đăng ký học phần",
    courseName: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    attemptNumber: 1,
    status: "PENDING",
  },
  {
    id: "sub-03",
    mssv: "22110024",
    studentName: "Lê Thu Hà",
    avatar: "LH",
    submittedAt: "22/10/2026 - 20:30",
    caseTitle: "Rò rỉ dữ liệu khách hàng",
    courseName: "An ninh mạng & Ứng cứu sự cố",
    attemptNumber: 1,
    status: "PENDING",
  },
  {
    id: "sub-04",
    mssv: "22110031",
    studentName: "Phạm Gia Huy",
    avatar: "PH",
    submittedAt: "22/10/2026 - 18:05",
    caseTitle: "Khủng hoảng quá tải hệ thống đăng ký học phần",
    courseName: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    attemptNumber: 1,
    status: "PENDING",
  },
  {
    id: "sub-05",
    mssv: "22110039",
    studentName: "Vũ Ngọc Linh",
    avatar: "VL",
    submittedAt: "22/10/2026 - 15:10",
    caseTitle: "Sự cố triển khai phiên bản mới",
    courseName: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
    attemptNumber: 2,
    status: "REVIEWED",
  },
  {
    id: "sub-06",
    mssv: "22110045",
    studentName: "Đặng Đức Minh",
    avatar: "ĐM",
    submittedAt: "21/10/2026 - 16:45",
    caseTitle: "Khôi phục dữ liệu sau sự cố",
    courseName: "Quản trị hệ thống thông tin",
    attemptNumber: 1,
    status: "REVIEWED",
  },
];

export function LecturerFeedbackPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST">("NEWEST");

  // Metrics
  const totalSubmissions = INITIAL_SUBMISSIONS.length;
  const pendingCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "PENDING").length;
  const reviewedCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "REVIEWED").length;
  const uniqueCasesCount = new Set(INITIAL_SUBMISSIONS.map((s) => s.caseTitle)).size;

  // Filtered & Sorted submissions
  const filteredSubmissions = useMemo(() => {
    return INITIAL_SUBMISSIONS.filter((item) => {
      const matchSearch =
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mssv.includes(searchTerm) ||
        item.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courseName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PENDING"
          ? item.status === "PENDING"
          : item.status === "REVIEWED";

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (sortBy === "NEWEST") return b.id.localeCompare(a.id);
      return a.id.localeCompare(b.id);
    });
  }, [searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Hàng đợi Review và phản hồi lập luận
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi bài làm, đánh giá đường đi quyết định và phản hồi chuyên môn định tính cho sinh viên.
        </p>
      </div>

      {/* Top 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              <span>Tổng bài làm đã nộp</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{totalSubmissions}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>Chờ phản hồi</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{pendingCount}</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <span>Đã phản hồi</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{reviewedCount}</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </span>
              <span>Case Study có bài nộp</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{uniqueCasesCount}</div>
          </div>
        </div>
      </div>

      {/* Main Container Card: Search, Filters & Submissions Queue Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Tên SV, MSSV hoặc case..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
            />
            <svg
              className="absolute left-3 top-2.5 text-slate-400"
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

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:border-[#1E3A8A] focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái ({totalSubmissions})</option>
                <option value="PENDING">Chờ phản hồi ({pendingCount})</option>
                <option value="REVIEWED">Đã phản hồi ({reviewedCount})</option>
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-3 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "NEWEST" | "OLDEST")}
                className="appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:border-[#1E3A8A] focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="NEWEST">Sắp xếp: Mới nhất</option>
                <option value="OLDEST">Sắp xếp: Cũ nhất</option>
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-3 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold text-[11px]">
                <th className="py-3 px-4">MSSV</th>
                <th className="py-3 px-4">Sinh viên</th>
                <th className="py-3 px-4">Thời gian nộp</th>
                <th className="py-3 px-4">Case Study & Khóa học</th>
                <th className="py-3 px-4 text-center">Lần làm</th>
                <th className="py-3 px-4 text-center">Hành động</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy bài làm nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* MSSV */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.mssv}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-xs">
                          {item.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{item.studentName}</div>
                          <div className="text-[11px] text-slate-400">MSSV: {item.mssv}</div>
                        </div>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.submittedAt}
                    </td>

                    {/* Case Study & Course */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50/80 text-[#1E3A8A] border border-blue-100/60 truncate max-w-full">
                        {item.caseTitle}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        {item.courseName}
                      </div>
                    </td>

                    {/* Attempt Number */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      #{item.attemptNumber}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      {item.status === "PENDING" ? (
                        <button
                          onClick={() => navigate(`/lecturer/feedback/${item.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Đánh giá & nhận xét</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/lecturer/feedback/${item.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Xem phản hồi</span>
                        </button>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {item.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Chờ phản hồi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Đã phản hồi
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
              <option value="50">50</option>
            </select>
            <span>trên {filteredSubmissions.length} bài làm</span>
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
    </div>
  );
}
