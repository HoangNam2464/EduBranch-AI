/**
 * EduBranch AI — Case Generation Trigger Modal & Progress Tracking
 * Task: [FE-007] (EBA-305 / Jira EBA-35)
 * Reference Figma Node: 483:14338 ("03.2 · Giảng viên · Hộp thoại đang sinh case nháp")
 * Reference Figma Node: 483:14666 ("03.3 · Giảng viên · Thông báo sinh case thất bại")
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeachingMaterial, LearningMode } from "../../types";
import { caseService } from "../../services/caseService";

interface CaseGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName?: string;
  materials: TeachingMaterial[];
  onSuccess?: (newCaseId: string) => void;
}

type GenerationStepStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED";

export function CaseGenerationModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  materials,
  onSuccess,
}: CaseGenerationModalProps) {
  const navigate = useNavigate();

  // Filter completed materials available for RAG
  const completedMaterials = materials.filter(
    (m) =>
      m.processing_status === "COMPLETED" ||
      m.processingStatus === "COMPLETED" ||
      // in case material object uses status property
      (m as any).status === "COMPLETED"
  );

  // Form states
  const [topicHint, setTopicHint] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [learningMode, setLearningMode] = useState<LearningMode>("BRANCHING_STUDY");
  const [numNodes, setNumNodes] = useState(4);

  // Generation status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Status, setStep1Status] = useState<GenerationStepStatus>("WAITING");
  const [step2Status, setStep2Status] = useState<GenerationStepStatus>("WAITING");
  const [step3Status, setStep3Status] = useState<GenerationStepStatus>("WAITING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-select completed materials when modal opens
  useEffect(() => {
    if (isOpen) {
      if (completedMaterials.length > 0) {
        setSelectedMaterials(completedMaterials.map((m) => m.id));
      }
      setIsGenerating(false);
      setErrorMessage(null);
      setCurrentStep(1);
      setStep1Status("WAITING");
      setStep2Status("WAITING");
      setStep3Status("WAITING");
    }
  }, [isOpen, materials]);

  if (!isOpen) return null;

  const handleSelectAll = () => {
    setSelectedMaterials(completedMaterials.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMaterials([]);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterials.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất 1 tài liệu giáo trình để cung cấp dữ liệu RAG.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentStep(1);
    setStep1Status("IN_PROGRESS");
    setStep2Status("WAITING");
    setStep3Status("WAITING");

    // Phase 1: RAG context retrieval
    const timer1 = setTimeout(() => {
      setStep1Status("COMPLETED");
      setCurrentStep(2);
      setStep2Status("IN_PROGRESS");
    }, 900);

    // Phase 2: Decision point synthesis
    const timer2 = setTimeout(() => {
      setStep2Status("COMPLETED");
      setCurrentStep(3);
      setStep3Status("IN_PROGRESS");
    }, 2200);

    try {
      const generatedCase = await caseService.generateCase(courseId, {
        materialIds: selectedMaterials,
        topicHint: topicHint.trim() || undefined,
        numNodes,
        learningMode,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setStep1Status("COMPLETED");
      setStep2Status("COMPLETED");
      setStep3Status("COMPLETED");

      // Short delay for visual completion before navigating
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
        if (onSuccess) {
          onSuccess(generatedCase.id);
        } else {
          navigate(`/lecturer/cases/${generatedCase.id}/review`);
        }
      }, 700);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Quá trình sinh tình huống tự động gặp sự cố. Vui lòng thử lại.";
      setErrorMessage(msg);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* =========================================================================
            HEADER
            ========================================================================= */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Sinh Case Study Bằng AI
              </h2>
              <p className="text-xs text-gray-500">
                {courseName ? `Học phần: ${courseName}` : "Tự động tạo cây quyết định rẽ nhánh từ giáo trình"}
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* =========================================================================
            BODY: PROGRESS TRACKING DIALOG (Figma Frame 483:14338)
            ========================================================================= */}
        {isGenerating ? (
          <div className="p-8 space-y-6">
            {/* Dialog Heading */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Đang sinh case nháp
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  AI đang dựng tình huống từ {selectedMaterials.length} tài liệu bạn đã chọn...
                </p>
              </div>
            </div>

            {/* Stepper Progress Items (Exact Figma Structure) */}
            <div className="space-y-3 pt-2">
              {/* Step 1 */}
              <div
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  step1Status === "COMPLETED"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : step1Status === "IN_PROGRESS"
                    ? "bg-blue-50/70 border-blue-300 text-blue-950 ring-2 ring-blue-500/20"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {step1Status === "COMPLETED" ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : step1Status === "IN_PROGRESS" ? (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold">1</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      Truy xuất đoạn trích liên quan từ {selectedMaterials.length} tài liệu
                    </p>
                    <p className="text-xs text-gray-500">
                      Trích xuất semantic chunks & vector grounding
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    step1Status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : step1Status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800 animate-pulse"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step1Status === "COMPLETED" ? "Hoàn tất" : step1Status === "IN_PROGRESS" ? "Đang thực hiện" : "Đang chờ"}
                </span>
              </div>

              {/* Step 2 */}
              <div
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  step2Status === "COMPLETED"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : step2Status === "IN_PROGRESS"
                    ? "bg-blue-50/70 border-blue-300 text-blue-950 ring-2 ring-blue-500/20"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {step2Status === "COMPLETED" ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : step2Status === "IN_PROGRESS" ? (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold">2</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      Tổng hợp tình huống và các điểm quyết định
                    </p>
                    <p className="text-xs text-gray-500">
                      Dựng cốt truyện thực tế & các nhánh lựa chọn
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    step2Status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : step2Status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800 animate-pulse"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step2Status === "COMPLETED" ? "Hoàn tất" : step2Status === "IN_PROGRESS" ? "Đang thực hiện" : "Đang chờ"}
                </span>
              </div>

              {/* Step 3 */}
              <div
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  step3Status === "COMPLETED"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : step3Status === "IN_PROGRESS"
                    ? "bg-blue-50/70 border-blue-300 text-blue-950 ring-2 ring-blue-500/20"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {step3Status === "COMPLETED" ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : step3Status === "IN_PROGRESS" ? (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold">3</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      Kiểm tra cấu trúc cây quyết định ({numNodes} nodes)
                    </p>
                    <p className="text-xs text-gray-500">
                      Đảm bảo tính hợp lệ, không node cụt & tính sư phạm
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    step3Status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : step3Status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800 animate-pulse"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step3Status === "COMPLETED" ? "Hoàn tất" : step3Status === "IN_PROGRESS" ? "Đang thực hiện" : "Đang chờ"}
                </span>
              </div>
            </div>

            <div className="text-center pt-2 text-xs text-gray-400">
              Quá trình này thường mất khoảng 3 - 5 giây. Vui lòng giữ cửa sổ mở.
            </div>
          </div>
        ) : (
          /* =========================================================================
             BODY: FORM CONFIGURATION MODE
             ========================================================================= */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 text-sm">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">Sinh case chưa thành công</p>
                  <p className="text-xs mt-0.5 text-red-700">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-600 font-bold"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Field 1: Topic / Scenario Hint */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Chủ đề / Định hướng tình huống (Topic Hint) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                placeholder="Ví dụ: Khủng hoảng thanh khoản ngân hàng và chiến lược tái cơ cấu nợ, hoặc Xử lý sự cố rò rỉ dữ liệu..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-xs"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Gợi ý cho AI bám sát chủ đề trọng tâm của học phần hoặc case thực tế cụ thể.
              </p>
            </div>

            {/* Field 2: Reference Materials (RAG Context) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Tài liệu tham chiếu RAG ({selectedMaterials.length}/{completedMaterials.length} đã chọn) <span className="text-red-500">*</span>
                </label>
                {completedMaterials.length > 0 && (
                  <div className="space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {completedMaterials.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Học phần này chưa có tài liệu nào ở trạng thái sẵn sàng (COMPLETED).</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/lecturer/courses/${courseId}/materials`);
                    }}
                    className="font-semibold underline hover:text-amber-900 cursor-pointer shrink-0 ml-2"
                  >
                    Tải tài liệu ngay &rarr;
                  </button>
                </div>
              ) : (
                <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl p-2.5 divide-y divide-gray-100 bg-gray-50/50 shadow-inner">
                  {completedMaterials.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat.id);
                    const filename = mat.original_filename || mat.originalFilename || "Tài liệu học phần";
                    const isPdf = filename.toLowerCase().endsWith(".pdf");
                    const chunkCount = mat.chunk_count || (mat as any).chunkCount || 0;

                    return (
                      <label
                        key={mat.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/60 text-blue-950" : "hover:bg-gray-100/70 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMaterial(mat.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isPdf ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {isPdf ? "PDF" : "DOCX"}
                          </span>
                          <span className="text-xs font-medium truncate" title={filename}>
                            {filename}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0">
                          {chunkCount} chunks
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Field 3: Learning Mode (Dual Learning Mode) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Chế độ học tập (Learning Mode)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setLearningMode("BRANCHING_STUDY")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    learningMode === "BRANCHING_STUDY"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-950"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">🌿 Branching Study</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      Cây quyết định
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Sinh viên trải nghiệm tình huống phân nhánh đa chiều, đối mặt với các hệ quả và suy ngẫm phản biện.
                  </p>
                </div>

                <div
                  onClick={() => setLearningMode("REVIEW_STUDY")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    learningMode === "REVIEW_STUDY"
                      ? "border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20 text-purple-950"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">📖 Review Study</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                      Phân tích mở
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Sinh viên phân tích chuyên sâu tình huống học thuật, đề xuất giải pháp và nhận đánh giá định tính.
                  </p>
                </div>
              </div>
            </div>

            {/* Field 4: Target Decision Tree Depth (Slider) */}
            {learningMode === "BRANCHING_STUDY" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Số lượng Nodes trong cây quyết định
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {numNodes} Nodes
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={numNodes}
                  onChange={(e) => setNumNodes(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>2 Nodes (Gọn nhẹ)</span>
                  <span>4 Nodes (Chuẩn đề xuất)</span>
                  <span>8 Nodes (Rẽ nhánh sâu)</span>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={completedMaterials.length === 0 || selectedMaterials.length === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Bắt đầu sinh case AI</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
