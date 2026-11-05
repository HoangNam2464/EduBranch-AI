import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { BrandMark, IconBook, IconCases, IconMessage, IconChart, IconLogOut } from "../components/ui";

/**
 * Lecturer workspace shell — Figma 02.1 (MVP Review `135:3360`): fixed sidebar + top bar.
 * Bell/help icons from the frame are not rendered because no notification/help feature exists yet.
 */
const NAV = [
  { to: "/lecturer/courses", label: "Khóa học", icon: IconBook },
  { to: "/lecturer/cases", label: "Case Study", icon: IconCases },
  { to: "/lecturer/feedback", label: "Phản hồi sinh viên", icon: IconMessage },
  { to: "/lecturer/statistics", label: "Thống kê học tập", icon: IconChart },
];

export function initials(name?: string | null): string {
  if (!name) return "GV";
  const parts = name.replace(/^(TS|ThS|PGS|GS)\.?\s+/i, "").trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "GV";
}

export function LecturerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="text-sm font-semibold text-gray-900">EduBranch AI</span>
          </div>
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">GV</span>
        </div>
        <nav aria-label="Điều hướng giảng viên" className="flex-1 px-3 py-4">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Không gian giảng viên</p>
          <ul className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r bg-blue-600" aria-hidden="true" />}
                      <Icon size={18} />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
            {initials(user?.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{user?.fullName ?? "Giảng viên"}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <IconLogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="ml-60 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">Giảng viên</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullName ?? "Giảng viên"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
              {initials(user?.fullName)}
            </span>
          </div>
        </header>
        <main className="w-full flex-1 px-8 py-8">
          <div className="mx-auto max-w-[1120px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
