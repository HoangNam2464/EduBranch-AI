import { useState } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { BrandMark, Badge, IconBranch, IconLogOut } from "../components/ui";
import { initials } from "./LecturerLayout";

/**
 * Student learning shell — Figma 05.1 (MVP Review `135:4357`): top bar with case context,
 * learning-mode chip and phase chip; centred 768px content column (no sidebar).
 */
export interface StudentHeader {
  caseTitle?: string;
  phase?: string;
}

type Ctx = { setHeader: (h: StudentHeader) => void };

export function useStudentHeader() {
  return useOutletContext<Ctx>();
}

export function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [header, setHeader] = useState<StudentHeader>({});
  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark size={26} />
          <span className="text-sm font-semibold text-gray-900">EduBranch AI</span>
          {header.caseTitle && (
            <>
              <span className="h-5 w-px bg-gray-200" aria-hidden="true" />
              <span className="truncate text-sm text-gray-600">{header.caseTitle}</span>
            </>
          )}
        </div>
        {header.caseTitle && (
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="teal">
              <IconBranch size={12} /> Branching Study
            </Badge>
            {header.phase && <Badge variant="neutral">{header.phase}</Badge>}
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-gray-900 sm:inline">{user?.fullName ?? "Sinh viên"}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
            {initials(user?.fullName)}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            <IconLogOut size={16} /> Đăng xuất
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-8">
        <Outlet context={{ setHeader } satisfies Ctx} />
      </main>
    </div>
  );
}
