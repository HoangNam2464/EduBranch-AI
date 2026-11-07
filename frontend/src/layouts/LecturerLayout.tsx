import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { EduBranchLogo } from "../components/ui";

// ── Nav items for Lecturer ───────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Tổng quan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    to: "/lecturer/dashboard",
    match: (p: string) => p.includes("/lecturer/dashboard") || p === "/lecturer",
  },
  {
    label: "Khóa học",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    to: "/lecturer/courses",
    match: (p: string) => p.includes("/lecturer/courses"),
  },
  {
    label: "Case Study",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    ),
    to: "/lecturer/cases",
    match: (p: string) => p.includes("/cases"),
  },
  {
    label: "Phản hồi sinh viên",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    to: "/lecturer/feedback",
    match: (p: string) => p.includes("/feedback"),
  },
  {
    label: "Thống kê học tập",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    to: "/lecturer/statistics",
    match: (p: string) => p.includes("/statistics"),
  },
];



export function LecturerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const displayName = user?.fullName ?? "TS. Nguyễn Văn An";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#EEF2F6] text-slate-800 antialiased">
      {/* ── Left Sidebar (Figma: soft grey background matching canvas) ── */}
      <aside
        className="fixed inset-y-0 left-0 flex flex-col bg-[#EEF2F6] z-20 px-4 py-5 select-none"
        style={{ width: 230 }}
      >
        {/* Brand */}
        <div className="px-2 pb-5">
          <Link to="/lecturer/courses" className="flex items-center gap-2.5">
            <EduBranchLogo size={32} />
            <div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-none block">
                EduBranch AI
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
                KHÔNG GIAN GIẢNG VIÊN
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items (Figma: Active is solid navy blue #1E3A8A with white text) */}
        <nav className="flex-1 space-y-1.5 pt-2">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                  ${
                    active
                      ? "bg-[#1E3A8A] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                  }
                `}
              >
                <span className={active ? "text-white" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="pt-4 border-t border-slate-200/80 px-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <Link
              to="/lecturer/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-blue-100 text-xs font-bold text-[#1E3A8A] shrink-0 border border-slate-200/60 hover:opacity-85 transition"
              title="Chỉnh sửa Hồ sơ"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                (displayName.charAt(0) || "N").toUpperCase()
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link to="/lecturer/profile" className="hover:underline">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {displayName}
                </p>
              </Link>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {user?.email ?? "an.nguyen@duytan.edu.vn"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-600 transition cursor-pointer pt-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex flex-col min-h-screen pl-[230px] pr-4 py-4">
        {/* White Rounded Container Card (Figma: all content sits inside this large white card) */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs p-6">
          {/* Header Bar inside white card */}
          <header className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            {/* Page title context */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {location.pathname.includes("/rag")
                  ? "RAG Source Inspector"
                  : location.pathname.includes("/materials")
                  ? "Quản lý tài liệu môn học"
                  : location.pathname.includes("/cases")
                  ? "Quản lý Case Study"
                  : "Quản lý khóa học"}
              </h1>
            </div>

            {/* Right Tools & User Info */}
            <div className="flex items-center gap-3">
              {/* Search Box */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-52 shadow-2xs">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full bg-transparent outline-none placeholder-slate-400 text-xs"
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Notification Bell Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2F6] text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
                title="Thông báo"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {/* Settings Gear Button */}
              <Link
                to="/lecturer/profile"
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
                  location.pathname === "/lecturer/profile"
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-[#EEF2F6] text-slate-600 hover:bg-slate-200/70"
                }`}
                title="Cài đặt & Chỉnh sửa Hồ sơ"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>

              {/* User Avatar Chip */}
              <Link
                to="/lecturer/profile"
                className="flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-85 transition cursor-pointer"
                title="Xem & Chỉnh sửa Hồ sơ"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-purple-100 text-xs font-bold text-purple-700 shrink-0 border border-slate-200/60">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    (displayName.charAt(0) || "N").toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Giảng viên
                  </p>
                </div>
              </Link>
            </div>
          </header>

          {/* Child Page Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>

        {/* Footer outside/below the card (Figma footer spec) */}
        <footer className="pt-3 pb-1 px-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 EduBranch AI</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-600 transition">Chính sách bảo mật</a>
            <a href="#" className="hover:text-slate-600 transition">Điều khoản sử dụng</a>
            <a href="mailto:support@edubranch.ai" className="hover:text-slate-600 transition">support@edubranch.ai</a>
            <span>Đồ án C1SE.65 · Trường Đại học Duy Tân</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
