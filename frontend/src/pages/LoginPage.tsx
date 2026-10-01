import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/** EduBranch AI — Login Page with Role Demo Shortcuts */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default student login
    setUser({
      id: "student-1",
      email: email || "student@university.edu.vn",
      fullName: "Nguyễn Văn Sinh Viên",
      role: "STUDENT",
    });
    setTokens("demo-token", "demo-refresh");
    navigate("/student/cases/case-business-crisis-1/branching-play");
  };

  const handleQuickStudent = (mode: "branching" | "review") => {
    setUser({
      id: "student-1",
      email: "student@university.edu.vn",
      fullName: "Nguyễn Văn Sinh Viên",
      role: "STUDENT",
    });
    setTokens("demo-token", "demo-refresh");
    if (mode === "branching") {
      navigate("/student/cases/case-business-crisis-1/branching-play");
    } else {
      navigate("/student/cases/case-review-study-1/review-study");
    }
  };

  const handleQuickLecturer = () => {
    setUser({
      id: "lecturer-1",
      email: "lecturer@university.edu.vn",
      fullName: "TS. Trần Giảng Viên",
      role: "LECTURER",
    });
    setTokens("demo-token", "demo-refresh");
    navigate("/lecturer/courses");
  };

  return (
    <div className="card p-8 bg-white shadow-sm border border-gray-200 rounded-xl">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập Edu-Branch-AI</h2>
      <p className="text-sm text-gray-500 mb-6">
        Hệ thống học tập tình huống thực nghiệm bậc Đại học (Case-Based Learning)
      </p>

      <form onSubmit={handleLogin} className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Email đại học
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu.vn"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition shadow-sm"
        >
          Đăng nhập
        </button>
      </form>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Truy cập nhanh (Dành cho kiểm thử hai chế độ học)
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickStudent("branching")}
            className="w-full py-2 px-3 text-left bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-medium rounded border border-blue-200 flex items-center justify-between"
          >
            <span>👉 Vào Mode A: <strong>Branching Study</strong> (Trải nghiệm quyết định liên tục)</span>
            <span className="text-blue-600">Khám phá →</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickStudent("review")}
            className="w-full py-2 px-3 text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium rounded border border-emerald-200 flex items-center justify-between"
          >
            <span>👉 Vào Mode B: <strong>Review Study</strong> (Phân tích & Đề xuất giải pháp)</span>
            <span className="text-emerald-600">Khám phá →</span>
          </button>
          <button
            type="button"
            onClick={handleQuickLecturer}
            className="w-full py-2 px-3 text-left bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-medium rounded border border-purple-200 flex items-center justify-between"
          >
            <span>👨‍🏫 Vào quyền <strong>Lecturer</strong> (Quản lý học phần & Case)</span>
            <span className="text-purple-600">Quản trị →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
