import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { EduBranchLogo } from "../components/ui";

// ── Nav items for Student (Matches Figma 05) ─────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Bàn học",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    to: "/student",
    match: (p: string) => p === "/student",
  },
  {
    label: "Khóa học của tôi",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    to: "/student/courses",
    match: (p: string) =>
      p.includes("/courses") || p.includes("/cases") || p.includes("/attempt") || p.includes("/branching-play") || p.includes("/review-study"),
  },
  {
    label: "Tham gia lớp học",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6" />
        <path d="m15.5 7.5 3 3" />
      </svg>
    ),
    to: "/student/courses?join=true",
    match: (p: string) => p.includes("join=true"),
  },
];



export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const displayName = user?.fullName ?? "Lê Minh Khôi";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#EEF2F6] text-slate-800 antialiased">
      {/* ── Left Sidebar (Figma 01.4 spec) ── */}
      <aside
        className="fixed inset-y-0 left-0 flex flex-col bg-[#EEF2F6] z-20 px-4 py-5 select-none"
        style={{ width: 230 }}
      >
        {/* Brand */}
        <div className="px-2 pb-5">
          <Link to="/student" className="flex items-center gap-2.5">
            <EduBranchLogo size={32} />
            <div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-none block">
                EduBranch AI
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
                KHÔNG GIAN SINH VIÊN
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
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
              to="/student/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-blue-100 text-xs font-bold text-[#1E3A8A] shrink-0 border border-slate-200/60 hover:opacity-85 transition"
              title="Chỉnh sửa Hồ sơ"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                (displayName.charAt(0) || "L").toUpperCase()
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link to="/student/profile" className="hover:underline">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {displayName}
                </p>
              </Link>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {user?.email ?? "minhkhoi@student.duytan.edu.vn"}
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
          {/* Header Bar */}
          <header className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {location.pathname.includes("/branching-play")
                ? "Thực hành tình huống phân nhánh"
                : location.pathname.includes("/review-study")
                ? "Nghiên cứu & Phản biện tình huống"
                : location.pathname.includes("/403")
                ? "Không có quyền truy cập"
                : "Không gian học tập"}
            </h1>

            <div className="flex items-center gap-3">
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

              <button
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2F6] text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
                title="Thông báo"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              <Link
                to="/student/profile"
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
                  location.pathname === "/student/profile"
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

              <Link
                to="/student/profile"
                className="flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-85 transition cursor-pointer"
                title="Xem & Chỉnh sửa Hồ sơ"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-purple-100 text-xs font-bold text-purple-700 shrink-0 border border-slate-200/60">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    (displayName.charAt(0) || "L").toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Sinh viên
                  </p>
                </div>
              </Link>
            </div>
          </header>

          {/* Page Content */}
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
