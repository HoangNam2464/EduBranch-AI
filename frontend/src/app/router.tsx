/**
 * EduBranch AI — Application Router
 * Source of Truth: Proposal V1.2 & Final Migration Plan Rev 2
 */

import { createBrowserRouter } from "react-router-dom";
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
]);
