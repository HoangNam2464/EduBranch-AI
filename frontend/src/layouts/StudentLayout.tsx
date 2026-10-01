import { Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/** Student learning layout. */
export function StudentLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-gray-900">🌿 Edu-Branch-AI</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            University Case Learning
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Student: {user?.fullName || "Student"}</span>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-600 font-medium cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl w-full mx-auto px-6 py-8 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
