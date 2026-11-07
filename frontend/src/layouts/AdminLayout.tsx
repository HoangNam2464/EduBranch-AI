import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { EduBranchLogo } from "../components/ui";

// ── Nav items for Admin (Matches Figma [HOLD · OPD-015]) ────────────────────
const NAV_ITEMS = [
  {
    label: "Bảng điều khiển",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    to: "/admin/dashboard",
    match: (p: string) => p === "/admin" || p.includes("/admin/dashboard"),
  },
  {
    label: "Người dùng",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    to: "/admin/users",
    match: (p: string) => p.includes("/admin/users"),
  },
  {
    label: "Khóa học",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    to: "/admin/courses",
    match: (p: string) => p.includes("/admin/courses"),
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
    to: "/admin/cases",
    match: (p: string) => p.includes("/admin/cases"),
  },
  {
    label: "Nghiên cứu & Rubric",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    to: "/admin/rubric",
    match: (p: string) => p.includes("/admin/rubric"),
  },
  {
    label: "Nhật ký hệ thống",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    to: "/admin/logs",
    match: (p: string) => p.includes("/admin/logs"),
  },
  {
    label: "Dịch vụ AI",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    to: "/admin/ai-service",
    match: (p: string) => p.includes("/admin/ai-service"),
  },
  {
    label: "Cài đặt hệ thống",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    to: "/admin/settings",
    match: (p: string) => p.includes("/admin/settings"),
  },
];



export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const displayName = user?.fullName ?? "Quản trị viên";
  const displayEmail = user?.email ?? "admin@duytan.edu.vn";

  function handleLogout() {
    logout();
    navigate("/admin/login");
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
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <EduBranchLogo size={32} />
            <div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-none block">
                EduBranch AI
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
                KHÔNG GIAN QUẢN TRỊ
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items (Active: #1E3A8A with white text) */}
        <nav className="flex-1 space-y-1 pt-1 overflow-y-auto">
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
              to="/admin/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-blue-100 text-xs font-bold text-[#1E3A8A] shrink-0 border border-slate-200/60 hover:opacity-85 transition"
              title="Chỉnh sửa Hồ sơ"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                "QT"
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link to="/admin/profile" className="hover:underline">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {displayName}
                </p>
              </Link>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {displayEmail}
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
        {/* White Rounded Container Card */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs p-6">
          {/* Header Bar inside white card */}
          <header className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            {/* Page title context */}
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {location.pathname.includes("/admin/settings")
                  ? "Cài đặt hệ thống"
                  : location.pathname.includes("/admin/ai-service")
                  ? "Cấu hình dịch vụ AI"
                  : location.pathname.includes("/admin/users")
                  ? "Quản lý người dùng"
                  : location.pathname.includes("/admin/courses")
                  ? "Quản lý khóa học"
                  : location.pathname.includes("/admin/cases")
                  ? "Quản lý Case Study"
                  : location.pathname.includes("/admin/rubric")
                  ? "Nghiên cứu & Rubric đánh giá"
                  : location.pathname.includes("/admin/logs")
                  ? "Nhật ký hệ thống"
                  : "Bảng điều khiển"}
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
                to="/admin/settings"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2F6] text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
                title="Cài đặt"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>

              {/* User Avatar Chip */}
              <Link
                to="/admin/profile"
                className="flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-85 transition cursor-pointer"
                title="Xem & Chỉnh sửa Hồ sơ"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-purple-100 text-xs font-bold text-purple-700 shrink-0 border border-slate-200/60">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    "QT"
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Quản trị viên
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

        {/* Footer */}
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

