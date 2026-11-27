/**
 * EduBranch AI — Application route tree.
 *
 * Paths come from routes/paths.ts only. Each role area is wrapped by the
 * shared PrivateRoute guard and its own layout.
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { PrivateRoute } from "@/routes/PrivateRoute";

import { PublicLayout } from "@/layouts/PublicLayout";
import { LecturerLayout } from "@/layouts/LecturerLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/pages/errors/ForbiddenPage";
import { RouteErrorPage } from "@/pages/errors/RouteErrorPage";

import { LandingPage } from "@/pages/landing/LandingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { AdminLoginPage } from "@/pages/auth/AdminLoginPage";
import { ProfileEditPage } from "@/pages/profile/ProfileEditPage";

import { LecturerDashboardPage } from "@/pages/dashboard/LecturerDashboardPage";
import { StudentDeskPage } from "@/pages/dashboard/StudentDeskPage";
import { AdminDashboardPage } from "@/pages/dashboard/AdminDashboardPage";

import { CoursesPage } from "@/pages/courses/CoursesPage";
import { StudentCoursesPage } from "@/pages/courses/StudentCoursesPage";
import { MaterialsPage } from "@/pages/materials/MaterialsPage";
import { RagSourceInspectorPage } from "@/pages/materials/RagSourceInspectorPage";
import { CasesPage } from "@/pages/cases/CasesPage";
import { CaseReviewPage } from "@/pages/cases/CaseReviewPage";
import { AiStudioPage } from "@/pages/cases/AiStudioPage";
import { CaseRubricPage } from "@/pages/rubric/CaseRubricPage";
import { LecturerFeedbackPage } from "@/pages/feedback/LecturerFeedbackPage";
import { StudentSubmissionFeedbackPage } from "@/pages/feedback/StudentSubmissionFeedbackPage";
import { ReviewFeedbackPage } from "@/pages/feedback/ReviewFeedbackPage";
import { StatisticsPage } from "@/pages/statistics/StatisticsPage";

import { BranchingCasePlayerPage } from "@/pages/branching/BranchingCasePlayerPage";
import { BranchingReviewPage } from "@/pages/branching/BranchingReviewPage";
import { ReflectionPage } from "@/pages/branching/ReflectionPage";
import { StudentAttemptsHistoryPage } from "@/pages/branching/StudentAttemptsHistoryPage";
import { ReviewStudyPage } from "@/pages/review-study/ReviewStudyPage";
import { ChallengeSupportPage } from "@/pages/challenge/ChallengeSupportPage";

import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminCoursesPage } from "@/pages/admin/AdminCoursesPage";
import { AdminCasesPage } from "@/pages/admin/AdminCasesPage";
import { AdminLogsPage } from "@/pages/admin/AdminLogsPage";
import { AdminAiConfigPage } from "@/pages/admin/AdminAiConfigPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminRubricPage } from "@/pages/admin/AdminRubricPage";

const { LECTURER: L, STUDENT: S, ADMIN: A, AUTH } = PATHS;

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <LandingPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: AUTH.LOGIN, element: <LoginPage /> },
      { path: AUTH.REGISTER, element: <RegisterPage /> },
      { path: AUTH.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: AUTH.RESET_PASSWORD, element: <ResetPasswordPage /> },
    ],
  },
  {
    path: AUTH.ADMIN_LOGIN,
    element: <AdminLoginPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: L.ROOT,
    element: (
      <PrivateRoute role="LECTURER">
        <LecturerLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <LecturerDashboardPage /> },
      { path: L.DASHBOARD, element: <LecturerDashboardPage /> },
      { path: L.COURSES, element: <CoursesPage /> },
      { path: L.CASES, element: <CasesPage /> },
      { path: L.AI_STUDIO, element: <AiStudioPage /> },
      { path: L.COURSE_MATERIALS, element: <MaterialsPage /> },
      { path: L.MATERIAL_SOURCES, element: <RagSourceInspectorPage /> },
      { path: L.COURSE_CASES, element: <CasesPage /> },
      { path: L.CASE_REVIEW, element: <CaseReviewPage /> },
      { path: L.CASE_RUBRIC, element: <CaseRubricPage /> },
      { path: L.CASE_FEEDBACK, element: <LecturerFeedbackPage /> },
      { path: L.RUBRIC, element: <CaseRubricPage /> },
      { path: L.FEEDBACK, element: <LecturerFeedbackPage /> },
      { path: L.FEEDBACK_DETAIL, element: <StudentSubmissionFeedbackPage /> },
      { path: L.STATISTICS, element: <StatisticsPage /> },
      { path: L.PROFILE, element: <ProfileEditPage /> },
      { path: L.SETTINGS, element: <ProfileEditPage /> },
    ],
  },
  {
    path: S.ROOT,
    element: (
      <PrivateRoute role="STUDENT">
        <StudentLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <StudentDeskPage /> },
      { path: S.DESK, element: <StudentDeskPage /> },
      { path: S.COURSES, element: <StudentCoursesPage /> },
      { path: S.BRANCHING_PLAY, element: <BranchingCasePlayerPage /> },
      { path: S.BRANCHING_REVIEW, element: <BranchingReviewPage /> },
      { path: S.REFLECTION, element: <ReflectionPage /> },
      { path: S.CASE_HISTORY, element: <StudentAttemptsHistoryPage /> },
      { path: S.HISTORY, element: <StudentAttemptsHistoryPage /> },
      { path: S.REVIEW_STUDY, element: <ReviewStudyPage /> },
      { path: S.REVIEW_FEEDBACK, element: <ReviewFeedbackPage /> },
      { path: S.CHALLENGE, element: <ChallengeSupportPage /> },
      { path: S.PROFILE, element: <ProfileEditPage /> },
      { path: S.SETTINGS, element: <ProfileEditPage /> },
    ],
  },
  {
    path: A.ROOT,
    element: (
      <PrivateRoute role="ADMIN">
        <AdminLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: A.DASHBOARD, element: <AdminDashboardPage /> },
      { path: A.USERS, element: <AdminUsersPage /> },
      { path: A.COURSES, element: <AdminCoursesPage /> },
      { path: A.CASES, element: <AdminCasesPage /> },
      { path: A.RUBRIC, element: <AdminRubricPage /> },
      { path: A.CASE_RUBRIC, element: <AdminRubricPage /> },
      { path: A.LOGS, element: <AdminLogsPage /> },
      { path: A.AI_SERVICE, element: <AdminAiConfigPage /> },
      { path: A.SETTINGS, element: <AdminSettingsPage /> },
      { path: A.PROFILE, element: <ProfileEditPage /> },
    ],
  },
  // Full-page status screens: no sidebar, header or footer (Figma 01.4 / 01.5 / 01.7).
  { path: L.FORBIDDEN, element: <ForbiddenPage />, errorElement: <RouteErrorPage /> },
  { path: S.FORBIDDEN, element: <ForbiddenPage />, errorElement: <RouteErrorPage /> },
  { path: A.FORBIDDEN, element: <ForbiddenPage />, errorElement: <RouteErrorPage /> },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
