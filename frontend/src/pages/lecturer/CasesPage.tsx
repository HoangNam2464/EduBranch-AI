/**
 * EduBranch AI — Cases Page (Course Case Studies Management)
 * Task: [FE-007] (EBA-305 / Jira EBA-35)
 * Reference Figma Node: 483:14030 ("03.1 · Giảng viên · Quản lý Case Study")
 * Reference Figma Node: 483:14338 ("03.2 · Giảng viên · Hộp thoại đang sinh case nháp")
 * Reference Figma Node: 483:14666 ("03.3 · Giảng viên · Thông báo sinh case thất bại")
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Case, CaseStatus, LearningMode, TeachingMaterial } from "../../types";
import { caseService } from "../../services/caseService";
import { materialService } from "../../services/materialService";
import { courseService } from "../../services/courseService";
import { CaseGenerationModal } from "../../components/cases/CaseGenerationModal";

export function CasesPage() {
  const { courseId = "default-course" } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Data states
  const [courseName, setCourseName] = useState<string>("Học phần");
  const [courseCode, setCourseCode] = useState<string>("");
  const [cases, setCases] = useState<Case[]>([]);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [showGenerationModal, setShowGenerationModal] = useState<boolean>(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CaseStatus>("ALL");
  const [modeFilter, setModeFilter] = useState<"ALL" | LearningMode>("ALL");

  // ---------------------------------------------------------------------------
  // Load data (Course details, Cases list, Teaching materials)
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setErrorMessage(null);

      // Fetch course info, cases, and materials in parallel
      const [courseRes, casesRes, matsRes] = await Promise.allSettled([
        courseService.getCourseById(courseId),
        caseService.getCasesByCourse(courseId),
        materialService.getMaterialsByCourse(courseId),
      ]);

      if (courseRes.status === "fulfilled" && courseRes.value) {
        setCourseName(courseRes.value.name || "Học phần");
        setCourseCode(courseRes.value.courseCode || "");
      }

      if (casesRes.status === "fulfilled") {
        setCases(casesRes.value || []);
      }

      if (matsRes.status === "fulfilled") {
        setMaterials(matsRes.value || []);
      }
    } catch (err: any) {
      console.error("Error loading cases data:", err);
      setErrorMessage("Không thể tải danh sách tình huống học phần. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Count materials
  const completedMaterialsCount = useMemo(() => {
    return materials.filter(
      (m) =>
        m.processing_status === "COMPLETED" ||
        m.processingStatus === "COMPLETED" ||
        (m as any).status === "COMPLETED"
    ).length;
  }, [materials]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search by title or description
      const titleMatch = (c.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || descMatch;

      // Filter by status
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

      // Filter by learning mode
      const currentMode = c.learningMode || c.learning_mode || "BRANCHING_STUDY";
      const matchesMode = modeFilter === "ALL" || currentMode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [cases, searchQuery, statusFilter, modeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = cases.length;
    const branching = cases.filter(
      (c) => (c.learningMode || c.learning_mode) !== "REVIEW_STUDY"
    ).length;
    const review = cases.filter(
      (c) => (c.learningMode || c.learning_mode) === "REVIEW_STUDY"
    ).length;
    const published = cases.filter((c) => c.status === "PUBLISHED").length;
    const draft = cases.filter((c) => c.status === "DRAFT").length;
    return { total, branching, review, published, draft };
  }, [cases]);

  // Status Badge UI helper
  const renderStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Bản nháp
          </span>
        );
      case "REVIEWED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Chờ duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Đã duyệt
          </span>
        );
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Đã công bố
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* =========================================================================
          BREADCRUMBS
          ========================================================================= */}
      <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
        <Link
          to="/lecturer/courses"
          className="hover:text-blue-600 transition-colors flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Khóa học</span>
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">
          {courseCode ? `[${courseCode}] ` : ""}
          {courseName}
        </span>
        <span>/</span>
        <span className="text-blue-600 font-semibold">Tình huống (Case Studies)</span>
      </nav>

      {/* =========================================================================
          PAGE HEADER (Figma Frame 483:14033)
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Quản lý Case Studies
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Xây dựng và kiểm duyệt tình huống học tập phân nhánh (Decision Tree) được tổng hợp bằng AI RAG từ giáo trình.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            to={`/lecturer/courses/${courseId}/materials`}
            className="inline-flex items-center space-x-2 px-3.5 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Tài liệu học phần ({completedMaterialsCount}/{materials.length})</span>
          </Link>

          <button
            onClick={() => setShowGenerationModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>+ Sinh case bằng AI</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ALERTS (Success / Error)
          ========================================================================= */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-4 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* =========================================================================
          AI SOURCE NOTICE BANNER (Figma Layer 512:6593)
          ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-blue-950">AI RAG Grounding: </span>
            <span className="text-blue-800">
              AI chỉ sinh tình huống từ tài liệu đã lập chỉ mục xong. Hiện có{" "}
              <strong>{completedMaterialsCount}/{materials.length}</strong> tài liệu sẵn sàng làm ngữ cảnh RAG.
            </span>
          </div>
        </div>

        <Link
          to={`/lecturer/courses/${courseId}/materials`}
          className="text-blue-600 hover:text-blue-800 font-semibold underline shrink-0 inline-flex items-center space-x-1"
        >
          <span>Quản lý tài liệu</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* =========================================================================
          ANALYTICS CARDS OVERVIEW (Figma Frame 483:14052)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng Case Studies</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Trong học phần hiện tại</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Branching Study</p>
          <p className="text-2xl font-extrabold text-blue-950 mt-1">{stats.branching}</p>
          <p className="text-[11px] text-blue-600/70 mt-0.5">Tình huống rẽ nhánh</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Review Study</p>
          <p className="text-2xl font-extrabold text-purple-950 mt-1">{stats.review}</p>
          <p className="text-[11px] text-purple-600/70 mt-0.5">Phân tích chuyên sâu</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Đã Xuất Bản</p>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">{stats.published}</p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Sinh viên có thể truy cập</p>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS & FILTERS (Figma Frame 483:14154 & 483:14156)
          ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tình huống theo tên, nội dung..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filter Controls (Status tabs & Mode dropdown) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Tabs */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "DRAFT"
                  ? "bg-white text-amber-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              Bản nháp
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("REVIEWED")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "REVIEWED"
                  ? "bg-white text-blue-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              Chờ duyệt
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "APPROVED"
                  ? "bg-white text-purple-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              Đã duyệt
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "PUBLISHED"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              Đã xuất bản
            </button>
          </div>

          {/* Mode Dropdown */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả chế độ</option>
            <option value="BRANCHING_STUDY">🌿 Branching Study</option>
            <option value="REVIEW_STUDY">📖 Review Study</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            title="Làm mới danh sách"
            className="p-1.5 border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CASES GRID / LIST (Figma Frame 483:14172)
          ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Đang tải danh sách Case Studies...</p>
          <p className="text-xs text-gray-400 mt-1">Đang đồng bộ dữ liệu từ cơ sở dữ liệu học phần</p>
        </div>
      ) : filteredCases.length === 0 ? (
        /* =========================================================================
           AC-2: DEDICATED EMPTY STATE
           ========================================================================= */
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {searchQuery || statusFilter !== "ALL" || modeFilter !== "ALL"
                ? "Không tìm thấy tình huống phù hợp"
                : "Chưa có Case Study nào cho học phần này"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              {searchQuery || statusFilter !== "ALL" || modeFilter !== "ALL"
                ? "Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái và chế độ học tập."
                : "Giảng viên có thể tải lên tài liệu giáo trình và nhấn \"Sinh case bằng AI\" để tự động khởi tạo cây quyết định rẽ nhánh mô phỏng tình huống thực nghiệm."}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            {searchQuery || statusFilter !== "ALL" || modeFilter !== "ALL" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setModeFilter("ALL");
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <>
                <Link
                  to={`/lecturer/courses/${courseId}/materials`}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Tải giáo trình lên
                </Link>
                <button
                  onClick={() => setShowGenerationModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>+ Sinh case đầu tiên bằng AI</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
           CASES GRID CARDS
           ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => {
            const isReviewStudy = (c.learningMode || c.learning_mode) === "REVIEW_STUDY";
            const updatedDate = c.updatedAt || c.updated_at || c.createdAt || c.created_at;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Media banner */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isReviewStudy
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isReviewStudy ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isReviewStudy
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isReviewStudy ? "Review Study" : "Branching Study"}
                        </span>
                      </div>
                    </div>

                    {renderStatusBadge(c.status)}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5" title={c.title}>
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed" title={c.description}>
                    {c.description || "Tình huống học tập mô phỏng phân tích và ra quyết định."}
                  </p>
                </div>

                {/* Card Bottom / Footer actions */}
                <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {updatedDate ? new Date(updatedDate).toLocaleDateString("vi-VN") : "Gần đây"}
                    </span>
                  </div>

                  {/* AC-3: Navigation link to Case Review / Decision Tree Editor */}
                  <Link
                    to={`/lecturer/cases/${c.id}/review`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-blue-600 text-gray-700 hover:text-white border border-gray-300 hover:border-blue-600 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>Mở cây quyết định</span>
                    <span className="text-sm font-bold">&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          AC-4: CASE GENERATION MODAL
          ========================================================================= */}
      <CaseGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        courseId={courseId}
        courseName={courseName}
        materials={materials}
        onSuccess={(newCaseId) => {
          setSuccessMessage("Khởi tạo case study nháp thành công! Đang chuyển hướng tới trình biên tập cây quyết định...");
          loadData();
          setTimeout(() => {
            navigate(`/lecturer/cases/${newCaseId}/review`);
          }, 800);
        }}
      />
    </div>
  );
}
