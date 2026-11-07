import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { EduBranchLogo } from "../components/ui";

// ── Nav items for Lecturer matching Figma Frame [309:798] ─────────────────────
const NAV_ITEMS = [
  {
    label: "Khóa học",
    to: "/lecturer/courses",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    match: (p: string) => p.includes("/lecturer/courses"),
  },
  {
    label: "Case Study",
    to: "/lecturer/cases",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    ),
    match: (p: string) => p.includes("/cases"),
  },
  {
    label: "Phản hồi sinh viên",
    to: "/lecturer/feedback",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    match: (p: string) => p.includes("/feedback"),
  },
  {
    label: "Thống kê học tập",
    to: "/lecturer/statistics",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    match: (p: string) => p.includes("/statistics"),
  },
];

export function LecturerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const displayName = user?.fullName || "TS. Nguyễn Văn An";
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "NA";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Derive dynamic page title for top bar
  const pageTitle = location.pathname.includes("/rag")
    ? "RAG Source Inspector"
    : location.pathname.includes("/materials")
    ? "Tài liệu học phần"
    : location.pathname.includes("/cases/review") || location.pathname.includes("/case-review")
    ? "Biên tập kịch bản tình huống"
    : location.pathname.includes("/cases")
    ? "Quản lý Case Study"
    : location.pathname.includes("/feedback")
    ? "Phản hồi học tập sinh viên"
    : location.pathname.includes("/statistics")
    ? "Thống kê phổ quyết định & phân tích học phần"
    : "Quản lý khóa học";

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] text-gray-900 font-sans antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR (Figma: 240px, bg-white, border-r border-gray-200)
      ───────────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-200 flex flex-col z-30 select-none">
        {/* Brand Area */}
        <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between">
          <Link to="/lecturer/courses" className="flex items-center gap-2.5">
            <EduBranchLogo size={28} />
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900 tracking-tight leading-none">
                EduBranch AI
              </span>
              <span className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider">
                Giảng viên
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                aria-current={active ? "page" : undefined}
              >
                <span className={active ? "text-blue-600" : "text-gray-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-gray-200 space-y-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {user?.email || "an.nguyen@duytan.edu.vn"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN WORKSPACE AREA (Offset by 240px)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 pl-60 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Global Search Bar */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Tìm kiếm học phần, case..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Thông báo hệ thống"
              className="w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-gray-900 leading-tight">
                  {displayName}
                </span>
                <span className="block text-[11px] text-gray-500">
                  Giảng viên
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
