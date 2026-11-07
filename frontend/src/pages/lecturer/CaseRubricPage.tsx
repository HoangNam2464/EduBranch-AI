import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export function CaseRubricPage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  // Rubric Scores State (1 to 5)
  const [realismScore, setRealismScore] = useState<number>(5);
  const [difficultyScore, setDifficultyScore] = useState<number>(4);
  const [curriculumFitScore, setCurriculumFitScore] = useState<number>(5);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute average score
  const avgScore = ((realismScore + difficultyScore + curriculumFitScore) / 3).toFixed(1);

  const handleSaveEvaluation = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/lecturer/cases")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          title="Quay lại danh sách case"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Rubric nghiên cứu chất lượng tình huống
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              HOLD · OPD-011
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Case Study</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Rubric nghiên cứu</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (Case Context & Overall Rubric Gauge) (4 cols) ─ */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Navy Banner Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="bg-[#1E3A8A] p-6 text-white relative">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900 mb-3 shadow-2xs">
                HOLD · OPD-011
              </span>
              <div className="text-white/80 scale-110 mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">
                Khủng hoảng sập mạng lưới trung tâm dữ liệu và tấn công DDoS nhằm vào cổng xác thực sinh trắc học ngân hàng
              </h2>
              <div className="text-[11px] text-blue-200 mt-2 font-medium">
                Branching Study · An ninh mạng & Ứng cứu sự cố
              </div>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="text-slate-400">🎯</span>
                <div>
                  <div className="text-[11px] text-slate-400">Mục đích</div>
                  <div className="font-semibold text-slate-800">Đánh giá chất lượng tình huống</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-slate-400">📐</span>
                <div>
                  <div className="text-[11px] text-slate-400">Thang đo</div>
                  <div className="font-semibold text-slate-800">1 – 5 cho mỗi tiêu chí</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Overall Score Gauge */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Điểm rubric của tình huống
            </h3>

            {/* Gauge Representation */}
            <div className="relative flex flex-col items-center justify-center my-2">
              <div className="relative w-44 h-24 overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeDasharray="2 3" />
                  <path d="M 10 50 A 40 40 0 0 1 85 24" fill="none" stroke="#1E3A8A" strokeWidth="12" strokeDasharray="2 3" />
                </svg>
                <div className="absolute bottom-0 inset-x-0 text-center">
                  <span className="text-2xl font-bold text-slate-900 leading-none">{avgScore}</span>
                  <span className="text-xs text-slate-400">/5</span>
                  <div className="text-[9px] text-blue-700 font-bold uppercase tracking-wider mt-0.5">
                    TRUNG BÌNH 3 TIÊU CHÍ
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Criteria Progress Mini-bars */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Tính thực tế</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0284C7] h-full" style={{ width: `${(realismScore / 5) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-900">{realismScore}/5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Độ khó</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0284C7] h-full" style={{ width: `${(difficultyScore / 5) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-900">{difficultyScore}/5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Phù hợp môn</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0284C7] h-full" style={{ width: `${(curriculumFitScore / 5) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-900">{curriculumFitScore}/5</span>
                </div>
              </div>
            </div>

            {/* Quote review */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
              &ldquo;Bối cảnh sát thực tế, cần bổ sung giới hạn nguồn lực khi xử lý sự cố.&rdquo;
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: RUBRIC SCORING & SAVED EVALUATIONS (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Rubric Interactive Scoring Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Chấm điểm rubric cho tình huống
            </h3>

            {/* Criteria 1: Tính thực tế */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1E3A8A] flex flex-col items-center justify-center font-bold text-sm shrink-0">
                  <span>{realismScore}</span>
                  <span className="text-[9px] text-blue-600">/5</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">1. Tính thực tế</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mức độ sát với các tình huống khủng hoảng thực tế tại doanh nghiệp
                  </p>
                </div>
              </div>

              {/* 1-5 Radio Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRealismScore(val)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      realismScore === val
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria 2: Độ khó */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex flex-col items-center justify-center font-bold text-sm shrink-0">
                  <span>{difficultyScore}</span>
                  <span className="text-[9px] text-sky-600">/5</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">2. Độ khó</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mức độ phức tạp của bài toán và đòi hỏi tư duy phân tích cao
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDifficultyScore(val)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      difficultyScore === val
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria 3: Phù hợp môn */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center font-bold text-sm shrink-0">
                  <span>{curriculumFitScore}</span>
                  <span className="text-[9px] text-emerald-600">/5</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3. Phù hợp môn</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Độ gắn kết với mục tiêu chuẩn đầu ra (CLO) của học phần
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCurriculumFitScore(val)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      curriculumFitScore === val
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600">
                  ✓ Đã lưu phiếu đánh giá thành công!
                </span>
              ) : <span></span>}

              <button
                type="button"
                onClick={handleSaveEvaluation}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer ml-auto"
              >
                <span>💾</span>
                <span>Lưu phiếu đánh giá</span>
              </button>
            </div>
          </div>

          {/* Saved Evaluation Cards List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phiếu đánh giá đã lưu (2)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  Khủng hoảng sập mạng lưới trung tâm dữ liệu và tấn công DDoS...
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#1E3A8A]">
                    Thực tế 5/5
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800">
                    Độ khó 4/5
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                    Phù hợp 5/5
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed italic">
                  &ldquo;Bối cảnh sát thực tế, cần bổ sung giới hạn nguồn lực khi xử lý sự cố.&rdquo;
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                    Khủng hoảng quá tải hệ thống đăng ký học phần
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Phiếu #2</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#1E3A8A]">
                    Thực tế 5/5
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800">
                    Độ khó 4/5
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                    Phù hợp 5/5
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed italic">
                  &ldquo;Các phương án có sự đánh đổi rõ ràng, phù hợp mục tiêu chuẩn đầu ra.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

