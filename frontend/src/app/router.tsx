/**
 * EduBranch AI — Application Router
 * Source of Truth: Proposal V1.2 & Final Migration Plan Rev 2
 */

import { createBrowserRouter, useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { LecturerLayout } from "../layouts/LecturerLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { CoursesPage } from "../pages/lecturer/CoursesPage";
import { MaterialsPage } from "../pages/lecturer/MaterialsPage";
import { CasesPage } from "../pages/lecturer/CasesPage";
import { CaseReviewPage } from "../pages/lecturer/CaseReviewPage";
import { StatisticsPage } from "../pages/lecturer/StatisticsPage";
import { LecturerFeedbackPage } from "../pages/lecturer/LecturerFeedbackPage";
import { BranchingCasePlayerPage } from "../pages/student/BranchingCasePlayerPage";
import { BranchingReviewPage } from "../pages/student/BranchingReviewPage";
import { ChallengeSupportPage } from "../pages/student/ChallengeSupportPage";
import { ReflectionPage } from "../pages/student/ReflectionPage";
import { ReviewStudyPage } from "../pages/student/ReviewStudyPage";
import { ReviewFeedbackPage } from "../pages/student/ReviewFeedbackPage";
import { PrivateRoute } from "../components/ui/PrivateRoute";
import { Button } from "../components/ui";
import { useAuthStore } from "../stores/authStore";

/**
 * Route Error Boundary Fallback UI
 * Isolates runtime render exceptions and navigation errors safely.
 */
function RouteErrorBoundary() {
  const error = useRouteError();
  const { isAuthenticated, user } = useAuthStore();

  let errorMessage = "Đã xảy ra sự cố không mong muốn trong quá trình xử lý yêu cầu.";
  let errorStatus: number | string = "500";

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const portalUrl = !isAuthenticated
    ? "/login"
    : user?.role === "LECTURER"
      ? "/lecturer/courses"
      : "/student";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
          ⚠️
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {errorStatus === 404 ? "Không tìm thấy nội dung" : "Đã xảy ra lỗi hệ thống"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {errorMessage}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
          <Link to={portalUrl}>
            <Button variant="primary">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * 404 Catch-All Page for unmatched routes
 */
function NotFoundPage() {
  const { isAuthenticated, user } = useAuthStore();

  const portalUrl = !isAuthenticated
    ? "/login"
    : user?.role === "LECTURER"
      ? "/lecturer/courses"
      : "/student";

  const portalLabel = !isAuthenticated
    ? "Quay lại trang Đăng nhập"
    : user?.role === "LECTURER"
      ? "Quay về Portal Giảng viên"
      : "Quay về Portal Sinh viên";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
          🔍
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">404</h1>
        <h2 className="mt-2 text-lg font-semibold text-gray-800">
          Không tìm thấy trang yêu cầu
        </h2>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          Đường dẫn bạn đang truy cập không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại liên kết hoặc quay về giao diện chính của hệ thống.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to={portalUrl}>
            <Button variant="primary" id="btn-back-to-portal">
              {portalLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StudentDirectLinkNotice() {
  return (
    <div className="mx-auto mt-12 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl">
        🔗
      </div>
      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        Yêu cầu liên kết trực tiếp từ Giảng viên
      </h2>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        EduBranch AI hoạt động theo cơ chế liên kết trực tiếp (Direct Link). Vui lòng sử dụng đường dẫn tình huống (Branching Study hoặc Review Study) do Giảng viên học phần cung cấp qua bài giảng hoặc thông báo môn học để tham gia thực hành.
      </p>
      <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-500 border border-gray-100">
        Nếu bạn mở liên kết tình huống trước khi đăng nhập, hệ thống sẽ tự động đưa bạn trở lại bài làm sau khi hoàn tất xác thực.
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/lecturer",
    element: (
      <PrivateRoute role="LECTURER">
        <LecturerLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId/materials", element: <MaterialsPage /> },
      { path: "courses/:courseId/cases", element: <CasesPage /> },
      { path: "cases/:caseId/review", element: <CaseReviewPage /> },
      { path: "cases/:caseId/feedback", element: <LecturerFeedbackPage /> },
      { path: "statistics", element: <StatisticsPage /> },
    ],
  },
  {
    path: "/student",
    element: (
      <PrivateRoute role="STUDENT">
        <StudentLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <StudentDirectLinkNotice /> },
      { path: "cases/:caseId/branching-play", element: <BranchingCasePlayerPage /> },
      { path: "cases/:caseId/attempt/:attemptId/review", element: <BranchingReviewPage /> },
      { path: "cases/:caseId/attempt/:attemptId/reflect", element: <ReflectionPage /> },
      { path: "cases/:caseId/review-study", element: <ReviewStudyPage /> },
      { path: "cases/:caseId/review-study/:submissionId/feedback", element: <ReviewFeedbackPage /> },
      { path: "cases/:caseId/challenge/:sessionId", element: <ChallengeSupportPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
