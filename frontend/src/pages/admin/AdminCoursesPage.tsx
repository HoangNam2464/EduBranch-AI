import { useState } from "react";

interface AdminCourseItem {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  classCode: string;
  caseCount: number;
  semester: string;
  studentCount: number;
  bgGradient: string;
  iconBg: string;
  status: string;
}

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseItem[]>([
    {
      id: "MGT101",
      code: "MGT101",
      name: "Quản trị học",
      lecturer: "Nguyễn Minh Anh",
      classCode: "QTH24A",
      caseCount: 2,
      semester: "HK1 · 2026-2027",
      studentCount: 48,
      bgGradient: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100 text-[#1E3A8A]",
      status: "Đang mở",
    },
    {
      id: "BUS204",
      code: "BUS204",
      name: "Đạo đức kinh doanh",
      lecturer: "Lê Thu Hà",
      classCode: "DDKD24B",
      caseCount: 1,
      semester: "HK1 · 2026-2027",
      studentCount: 42,
      bgGradient: "bg-slate-800 text-white border-slate-700",
      iconBg: "bg-slate-900 text-white",
      status: "Đang mở",
    },
    {
      id: "MKT101",
      code: "MKT101",
      name: "Marketing căn bản",
      lecturer: "Trần Đức Huy",
      classCode: "MKT24A",
      caseCount: 2,
      semester: "HK1 · 2026-2027",
      studentCount: 56,
      bgGradient: "bg-cyan-50 border-cyan-100",
      iconBg: "bg-cyan-100 text-[#0284C7]",
      status: "Đang mở",
    },
    {
      id: "OPS301",
      code: "OPS301",
      name: "Quản trị vận hành",
      lecturer: "Nguyễn Minh Anh",
      classCode: "QTVH25A",
      caseCount: 1,
      semester: "HK1 · 2026-2027",
      studentCount: 38,
      bgGradient: "bg-blue-50/60 border-blue-100",
      iconBg: "bg-blue-100 text-[#1E3A8A]",
      status: "Đang mở",
    },
    {
      id: "FIN201",
      code: "FIN201",
      name: "Tài chính doanh nghiệp",
      lecturer: "Lê Thu Hà",
      classCode: "TCDN25B",
      caseCount: 1,
      semester: "HK1 · 2026-2027",
      studentCount: 45,
      bgGradient: "bg-slate-800 text-white border-slate-700",
      iconBg: "bg-slate-900 text-white",
      status: "Đang mở",
    },
    {
      id: "ORG202",
      code: "ORG202",
      name: "Hành vi tổ chức",
      lecturer: "Trần Đức Huy",
      classCode: "HVTC26A",
      caseCount: 1,
      semester: "HK1 · 2026-2027",
      studentCount: 40,
      bgGradient: "bg-sky-50 border-sky-100",
      iconBg: "bg-sky-100 text-[#0284C7]",
      status: "Đang mở",
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<AdminCourseItem>(courses[0]);
  const [searchCourse, setSearchCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("HK1 · 2026-2027");

  // Transfer lecturer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetLecturer, setTargetLecturer] = useState("Lê Thu Hà");
  const [transferReason, setTransferReason] = useState("");

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.code.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.lecturer.toLowerCase().includes(searchCourse.toLowerCase())
  );

  function handleConfirmTransfer() {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === selectedCourse.id ? { ...c, lecturer: targetLecturer } : c
      )
    );
    setSelectedCourse((prev) => ({ ...prev, lecturer: targetLecturer }));
    setShowTransferModal(false);
    setTransferReason("");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left 2 Columns: Danh sách học phần ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Danh sách học phần</h2>
              <p className="text-[11px] text-slate-400">
                Toàn bộ học phần đang triển khai đào tạo tình huống
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-56 shadow-2xs">
                <input
                  type="text"
                  placeholder="Tìm khóa, mã môn..."
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder-slate-400 text-xs"
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 outline-none"
              >
                <option>HK1 · 2026-2027</option>
                <option>HK2 · 2025-2026</option>
              </select>
            </div>
          </div>

          {/* List of 6 Course Cards */}
          <div className="space-y-3">
            {filteredCourses.map((c) => {
              const isSelected = selectedCourse.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#1E3A8A] bg-blue-50/20 shadow-xs ring-1 ring-[#1E3A8A]/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Course Icon */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
                      {c.code.startsWith("MGT") ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                          <line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" />
                          <line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" />
                          <line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" />
                        </svg>
                      ) : c.code.startsWith("BUS") ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      ) : c.code.startsWith("MKT") ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      ) : c.code.startsWith("OPS") ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                          <path d="M18 9a9 9 0 0 1-9 9" />
                        </svg>
                      ) : c.code.startsWith("FIN") ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        </svg>
                      )}
                    </div>

                    {/* Course Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                          {c.status}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">{c.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {c.code}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-100 inline-flex items-center justify-center text-[9px] text-[#1E3A8A] font-bold">
                            GV
                          </span>
                          {c.lecturer}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">Mã lớp: {c.classCode}</span>
                        <span>•</span>
                        <span>{c.caseCount} case</span>
                        <span>•</span>
                        <span>{c.semester}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right students badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-lg">
                      {c.studentCount} SV
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs">
                <option>10</option>
              </select>
              <span>trên 6 bản ghi</span>
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

        {/* ── Right 1 Column: Chi tiết học phần Panel ── */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Chi tiết học phần</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E3A8A] text-[11px] font-semibold hover:bg-blue-100 transition cursor-pointer"
                >
                  Chuyển giao GV
                </button>
              </div>
            </div>

            {/* Banner card */}
            <div className="rounded-xl bg-[#1E3A8A] text-white p-5 text-center relative overflow-hidden">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-200 block mb-1">
                {selectedCourse.code}
              </span>
              <div className="mx-auto w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" />
                </svg>
              </div>
              <h4 className="text-base font-bold">{selectedCourse.name}</h4>
              <p className="text-xs text-blue-100 mt-0.5">
                GV: {selectedCourse.lecturer}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20">
                  {selectedCourse.status}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20">
                  {selectedCourse.semester}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20">
                  {selectedCourse.studentCount} SV
                </span>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Sinh viên</span>
                <span className="text-sm font-bold text-slate-900">{selectedCourse.studentCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Case Study</span>
                <span className="text-sm font-bold text-slate-900">{selectedCourse.caseCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Mã lớp</span>
                <span className="text-xs font-bold font-mono text-slate-900">{selectedCourse.classCode}</span>
              </div>
            </div>

            {/* Tổng quan học phần */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Tổng quan học phần</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                6 khóa đang mở · 269 sinh viên · 8 case · 3 giảng viên
              </p>

              <div className="space-y-1.5 pt-1 text-xs">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600 font-mono text-[11px]">{c.code}</span>
                    <span className="font-semibold text-slate-800">{c.studentCount} SV</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phân bổ giảng viên */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900">Phân bổ giảng viên</h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">Nguyễn Minh Anh</p>
                    <p className="text-[10px] text-slate-400">2 khóa · 86 SV</p>
                  </div>
                  <button
                    onClick={() => {
                      setTargetLecturer("Nguyễn Minh Anh");
                      setShowTransferModal(true);
                    }}
                    className="p-1 hover:text-[#1E3A8A] text-slate-400 cursor-pointer"
                    title="Chuyển giao"
                  >
                    ⇄
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">Lê Thu Hà</p>
                    <p className="text-[10px] text-slate-400">2 khóa · 87 SV</p>
                  </div>
                  <button
                    onClick={() => {
                      setTargetLecturer("Lê Thu Hà");
                      setShowTransferModal(true);
                    }}
                    className="p-1 hover:text-[#1E3A8A] text-slate-400 cursor-pointer"
                    title="Chuyển giao"
                  >
                    ⇄
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">Trần Đức Huy</p>
                    <p className="text-[10px] text-slate-400">2 khóa · 96 SV</p>
                  </div>
                  <button
                    onClick={() => {
                      setTargetLecturer("Trần Đức Huy");
                      setShowTransferModal(true);
                    }}
                    className="p-1 hover:text-[#1E3A8A] text-slate-400 cursor-pointer"
                    title="Chuyển giao"
                  >
                    ⇄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Chuyển giao giảng viên phụ trách học phần ── */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Chuyển giao giảng viên phụ trách học phần
                  </h3>
                  <p className="text-xs text-slate-400">
                    Thay đổi quyền quản lý tình huống và phản hồi sinh viên
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Học phần chuyển giao
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {selectedCourse.name} ({selectedCourse.code})
                </p>
                <p className="text-[11px] text-slate-500">
                  Giảng viên hiện tại: <span className="font-semibold text-slate-800">{selectedCourse.lecturer}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn giảng viên tiếp nhận mới <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetLecturer}
                  onChange={(e) => setTargetLecturer(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                >
                  <option value="Lê Thu Hà">Lê Thu Hà (Khoa Marketing)</option>
                  <option value="Trần Đức Huy">Trần Đức Huy (Khoa QTKD)</option>
                  <option value="Nguyễn Minh Anh">Nguyễn Minh Anh (Khoa CNTT)</option>
                  <option value="Nguyễn Khánh Vy">Nguyễn Khánh Vy (Khoa CNTT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do chuyển giao (ghi vào Audit Log)
                </label>
                <textarea
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ví dụ: Điều chuyển phân công giảng dạy theo quyết định Khoa..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer shadow-xs"
              >
                Xác nhận chuyển giao
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

