import { useState } from "react";

interface UserItem {
  id: string;
  code: string;
  avatar: string;
  name: string;
  email: string;
  createDate: string;
  role: "Quản trị viên" | "Giảng viên" | "Sinh viên";
  department?: string;
  status: "Hoạt động" | "Đã khóa" | "Chờ duyệt";
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([
    {
      id: "AD-01",
      code: "—",
      avatar: "QT",
      name: "Quản trị viên",
      email: "admin@duytan.edu.vn",
      createDate: "01/09/2026",
      role: "Quản trị viên",
      department: "Quản trị viên hệ thống",
      status: "Hoạt động",
    },
    {
      id: "GV-01",
      code: "—",
      avatar: "NA",
      name: "Nguyễn Minh Anh",
      email: "minhanh@duytan.edu.vn",
      createDate: "02/09/2026",
      role: "Giảng viên",
      department: "Khoa Quản trị kinh doanh",
      status: "Hoạt động",
    },
    {
      id: "GV-02",
      code: "—",
      avatar: "LH",
      name: "Lê Thu Hà",
      email: "thuha@duytan.edu.vn",
      createDate: "03/09/2026",
      role: "Giảng viên",
      department: "Khoa Kinh tế",
      status: "Hoạt động",
    },
    {
      id: "GV-03",
      code: "—",
      avatar: "TH",
      name: "Trần Đức Huy",
      email: "duchuy@duytan.edu.vn",
      createDate: "04/09/2026",
      role: "Giảng viên",
      department: "Khoa Marketing",
      status: "Hoạt động",
    },
    {
      id: "GV-04",
      code: "—",
      avatar: "NV",
      name: "Nguyễn Khánh Vy",
      email: "khanhvy@duytan.edu.vn",
      createDate: "21/10/2026",
      role: "Giảng viên",
      department: "Khoa Công nghệ thông tin",
      status: "Chờ duyệt",
    },
    {
      id: "SV-01",
      code: "22110051",
      avatar: "TB",
      name: "Trần Quốc Bảo",
      email: "quocbao@duytan.edu.vn",
      createDate: "10/09/2026",
      role: "Sinh viên",
      status: "Hoạt động",
    },
    {
      id: "SV-02",
      code: "22110052",
      avatar: "PN",
      name: "Phạm Hoàng Nam",
      email: "hoangnam@duytan.edu.vn",
      createDate: "11/09/2026",
      role: "Sinh viên",
      status: "Đã khóa",
    },
    {
      id: "SV-03",
      code: "22110053",
      avatar: "VL",
      name: "Vũ Ngọc Linh",
      email: "ngoclinh@duytan.edu.vn",
      createDate: "12/09/2026",
      role: "Sinh viên",
      status: "Hoạt động",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING">("ALL");
  const [selectedUserToLock, setSelectedUserToLock] = useState<UserItem | null>(null);
  const [lockReason, setLockReason] = useState("");

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.code !== "—" && u.code.includes(searchQuery));
    if (activeTab === "PENDING") {
      return matchSearch && u.status === "Chờ duyệt";
    }
    return matchSearch;
  });

  function handleConfirmLock() {
    if (!selectedUserToLock) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUserToLock.id ? { ...u, status: "Đã khóa" as const } : u))
    );
    setSelectedUserToLock(null);
    setLockReason("");
  }

  function handleUnlock(userId: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "Hoạt động" as const } : u))
    );
  }

  function handleApprove(userId: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "Hoạt động" as const } : u))
    );
  }

  function handleReject(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  return (
    <div className="space-y-6">
      {/* ── Top 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng người dùng */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng người dùng</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">8</p>
          </div>
        </div>

        {/* 2. Giảng viên */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Giảng viên</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">4</p>
          </div>
        </div>

        {/* 3. Sinh viên */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4" />
              <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sinh viên</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">3</p>
          </div>
        </div>

        {/* 4. Giảng viên chờ duyệt */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Giảng viên chờ duyệt</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">1</p>
          </div>
        </div>
      </div>

      {/* ── Main User Table Card ── */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-64 shadow-2xs">
            <input
              type="text"
              placeholder="Tìm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-slate-400 text-xs"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-[#1E3A8A] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả (8)
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              Sắp xếp
            </button>
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "PENDING"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span>Chờ duyệt (1)</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="pb-2 font-semibold">MSSV</th>
                <th className="pb-2 font-semibold">Họ và tên</th>
                <th className="pb-2 font-semibold">Ngày tạo</th>
                <th className="pb-2 font-semibold">Vai trò & Khoa</th>
                <th className="pb-2 font-semibold text-center">Hành động</th>
                <th className="pb-2 font-semibold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  {/* MSSV */}
                  <td className="py-3 font-mono text-slate-500 font-medium">
                    {u.code}
                  </td>

                  {/* Họ và tên + Avatar */}
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                        u.role === "Quản trị viên"
                          ? "bg-blue-100 text-[#1E3A8A]"
                          : u.role === "Giảng viên"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Ngày tạo */}
                  <td className="py-3 text-slate-500 text-[11px]">
                    {u.createDate}
                  </td>

                  {/* Vai trò & Khoa (Two-badge format matching Figma 015) */}
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#1E3A8A]">
                        {u.role}
                      </span>
                      {u.department && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          {u.department}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Hành động */}
                  <td className="py-3 text-center">
                    {u.status === "Chờ duyệt" ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1E3A8A] text-white text-[11px] font-semibold hover:bg-[#1E3A8A]/90 transition cursor-pointer"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50 transition cursor-pointer"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : u.status === "Đã khóa" ? (
                      <button
                        onClick={() => handleUnlock(u.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition cursor-pointer"
                      >
                        Mở khóa
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUserToLock(u);
                          setLockReason("Vi phạm quy chế học vụ / Yêu cầu tạm đình chỉ từ Khoa...");
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
                      >
                        Khóa
                      </button>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.status === "Hoạt động"
                          ? "bg-emerald-50 text-emerald-700"
                          : u.status === "Đã khóa"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        u.status === "Hoạt động"
                          ? "bg-emerald-600"
                          : u.status === "Đã khóa"
                          ? "bg-rose-600"
                          : "bg-amber-600"
                      }`}></span>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
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

      {/* ── Modal: Khóa quyền truy cập tài khoản (Figma 015) ── */}
      {selectedUserToLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Khóa quyền truy cập tài khoản
                  </h3>
                  <p className="text-xs text-slate-400">
                    Người dùng sẽ bị đăng xuất ngay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserToLock(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Target info card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Tài khoản mục tiêu
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {selectedUserToLock.name} {selectedUserToLock.code !== "—" ? `(MSSV: ${selectedUserToLock.code} — ${selectedUserToLock.email})` : `(${selectedUserToLock.email})`}
                </p>
                <p className="text-[11px] text-slate-500">
                  Vai trò hệ thống: <span className="font-semibold">{selectedUserToLock.role} {selectedUserToLock.department ? `(${selectedUserToLock.department})` : ""}</span>
                </p>
              </div>

              {/* Reason textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do khóa tài khoản (bắt buộc để ghi Audit Log)
                </label>
                <textarea
                  rows={3}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Nhập lý do cụ thể..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Warning box */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Tài khoản không thể đăng nhập cho tới khi được mở khóa.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedUserToLock(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmLock}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer shadow-xs"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Xác nhận khóa tài khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
