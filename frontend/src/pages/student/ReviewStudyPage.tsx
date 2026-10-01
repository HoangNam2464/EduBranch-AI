/**
 * EduBranch AI — Review Study Page (Mode B)
 *
 * CRITICAL PRODUCT DIRECTION REQUIREMENTS:
 * 1. Mode B is an INDEPENDENT learning mode, NOT a simplified Branching Study.
 * 2. No decision tree required.
 * 3. Flow: Context/Data -> Problem -> Analysis -> Solution -> Reasoning -> Lecturer Review -> Reflection.
 * 4. Accepts multiple reasonable solutions (no single correct answer; AI does not grade).
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCaseStudyStore, SAMPLE_REVIEW_STUDY_CASE } from "../../stores/caseStudyStore";

export function ReviewStudyPage() {
  const { caseId = "case-review-study-1" } = useParams();
  const navigate = useNavigate();

  const { reviewSubmission, submitReviewStudy, initChallengeSession } = useCaseStudyStore();

  const [analysis, setAnalysis] = useState("");
  const [solution, setSolution] = useState("");
  const [reasoning, setReasoning] = useState("");

  const caseData = SAMPLE_REVIEW_STUDY_CASE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || !reasoning.trim()) return;

    submitReviewStudy(caseId, {
      studentAnalysis: analysis,
      proposedSolution: solution,
      reasoningText: reasoning,
    });

    const submission = useCaseStudyStore.getState().reviewSubmission;
    navigate(`/student/cases/${caseId}/review-study/${submission?.id || "pending"}/feedback`);
  };

  const handleInvokeChallenge = () => {
    if (!reasoning.trim() || reasoning.length < 10) {
      alert("Vui lòng nhập lập luận bảo vệ phương án trước khi kiểm thử với AI Challenge Support.");
      return;
    }
    const sessionId = initChallengeSession(caseId, "REVIEW", reasoning);
    navigate(`/student/cases/${caseId}/challenge/${sessionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Chế độ B: Review Study (Phân tích chuyên sâu & Đề xuất phương án)
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{caseData.title}</h2>
            <p className="text-xs text-gray-500 mt-1">{caseData.courseName}</p>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            Không dùng cây quyết định
          </span>
        </div>

        {/* Case Context & Data */}
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Bối cảnh tình huống & Dữ liệu thực tế</span>
            </h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {caseData.contextText}
            </p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
              ❓ Câu hỏi / Bài toán cần giải quyết:
            </h3>
            <p className="text-sm text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
              {caseData.problemText}
            </p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">
            Bản đệ trình giải pháp của sinh viên
          </h3>
          <p className="text-xs text-gray-500">
            Giảng viên sẽ trực tiếp đánh giá và phản hồi định tính. Hệ thống chấp nhận nhiều hướng giải quyết hợp lý.
          </p>
        </div>

        {/* 1. Student Analysis (Optional per R2 confirmed) */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-2">
            1. Phân tích bối cảnh & nguyên nhân cốt lõi (Tùy chọn):
          </label>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            placeholder="Phân tích điểm mạnh, điểm yếu, các áp lực tài chính và dịch chuyển hành vi tiêu dùng..."
            rows={4}
            className="w-full text-xs p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* 2. Proposed Solution (Mandatory) */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-2">
            2. Phương án đề xuất cụ thể (Bắt buộc): <span className="text-red-500">*</span>
          </label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Nêu rõ các bước hành động cụ thể: xử lý 15 cửa hàng thua lỗ ra sao, dịch chuyển ngân sách như thế nào..."
            rows={5}
            required
            className="w-full text-xs p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* 3. Student Reasoning & Justification (Mandatory) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase text-gray-700 tracking-wider">
              3. Lập luận bảo vệ & Căn cứ số liệu (Bắt buộc): <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleInvokeChallenge}
              className="text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded border border-purple-200 transition cursor-pointer"
            >
              🤖 Thử thách lập luận với AI Challenge Support →
            </button>
          </div>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Tại sao bạn tin rằng phương án này tối ưu? Rủi ro lớn nhất là gì và bạn kiểm soát rủi ro đó như thế nào?..."
            rows={5}
            required
            className="w-full text-xs p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-400 italic">
            * Sau khi nộp, bài làm sẽ được chuyển tới hàng đợi phản hồi của Giảng viên.
          </span>
          <button
            type="submit"
            disabled={!solution.trim() || !reasoning.trim()}
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow cursor-pointer disabled:opacity-50"
          >
            Nộp Phương án cho Giảng viên Review →
          </button>
        </div>
      </form>
    </div>
  );
}
