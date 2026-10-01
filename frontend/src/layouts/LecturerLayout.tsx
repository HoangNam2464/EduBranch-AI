import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/** Lecturer layout — navigation header + content area. */
export function LecturerLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-lg font-bold text-gray-900">🌿 EduBranch AI</h1>
          <nav className="flex space-x-4 text-sm font-medium text-gray-600">
            <Link
              to="/lecturer/courses"
              className={`hover:text-blue-600 ${
                location.pathname.includes("/courses") ? "text-blue-600 font-semibold" : ""
              }`}
            >
              Courses
            </Link>
            <Link
              to="/lecturer/statistics"
              className={`hover:text-blue-600 ${
                location.pathname.includes("/statistics") ? "text-blue-600 font-semibold" : ""
              }`}
            >
              Statistics
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Lecturer: {user?.fullName || "Faculty"}</span>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-600 font-medium cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
