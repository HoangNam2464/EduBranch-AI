/**
 * EduBranch AI — Branching Case Player (Mode A — Experience Phase)
 *
 * NON-NEGOTIABLE PRODUCT DIRECTION RULES:
 * 1. Experience-first: Student navigates decision points consecutively with NO blocking steps.
 * 2. NO reasoning form between Decision Points.
 * 3. NO consequence card mid-flow (consequences are revealed ONLY in REVIEW phase).
 * 4. No fixed decision count: case length is dynamic and determined by case content.
 * 5. Reaching a terminal node transitions automatically to the REVIEW phase.
 */

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCaseStudyStore, SAMPLE_BRANCHING_CASE } from "../../stores/caseStudyStore";

export function BranchingCasePlayerPage() {
  const { caseId = "case-business-crisis-1" } = useParams();
  const navigate = useNavigate();

  const {
    currentAttempt,
    currentNodeId,
    initBranchingAttempt,
    selectBranchingOption,
  } = useCaseStudyStore();

  useEffect(() => {
    initBranchingAttempt(caseId);
  }, [caseId, initBranchingAttempt]);

  const caseData = SAMPLE_BRANCHING_CASE;
  const currentNode = caseData.nodes[currentNodeId as keyof typeof caseData.nodes] || caseData.nodes.N1;
  const attempt = currentAttempt;

  const handleSelectOption = (opt: {
    id: string;
    text: string;
    consequence: string;
    nextNodeId: string | null;
  }) => {
    const nextNode = opt.nextNodeId
      ? caseData.nodes[opt.nextNodeId as keyof typeof caseData.nodes]
      : null;

    const otherOptions = currentNode.options
      .filter((o) => o.id !== opt.id)
      .map((o) => ({ id: o.id, text: o.text }));

    selectBranchingOption(
      currentNode.id,
      currentNode.situation,
      opt.id,
      opt.text,
      opt.consequence,
      otherOptions,
      opt.nextNodeId,
      nextNode?.isTerminal ?? true,
      nextNode?.outcomeText
    );
  };

  const handleGoToReview = () => {
    if (!attempt) return;
    navigate(`/student/cases/${caseId}/attempt/${attempt.id}/review`);
  };

  if (!attempt) {
    return <div className="p-8 text-center text-gray-500">Đang chuẩn bị tình huống học tập...</div>;
  }

  // Terminal State (End of Journey)
  if (currentNode.isTerminal || attempt.isCompleted) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                Chế độ A: Branching Study · Lần thử #{attempt.attemptNumber}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">{caseData.title}</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Hoàn thành hành trình
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
              🏁 Điểm kết thúc hành trình của bạn:
            </h3>
            <p className="text-base text-gray-900 leading-relaxed font-medium mb-3">
              Bạn đã đi đến điểm kết thúc của hành trình này.
            </p>
            <p className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200 leading-relaxed">
              Kết quả chi tiết và hệ quả của các lựa chọn sẽ được mở trong giai đoạn REVIEW.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
            <h4 className="text-sm font-bold text-blue-900 mb-1">
              Giai đoạn tiếp theo: HỒI TƯỞNG & PHÂN TÍCH (REVIEW)
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Bạn vừa hoàn thành chuỗi quyết định thực tế. Bây giờ, hãy xem lại toàn bộ lộ trình bạn đã đi,
              khám phá các hệ quả đằng sau từng lựa chọn và giải trình tư duy cho các quyết định trọng yếu.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGoToReview}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition shadow flex items-center space-x-2 cursor-pointer"
            >
              <span>Vào Giai đoạn REVIEW (Phân tích lộ trình)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Decision Point in Experience Phase
  const decisionCount = attempt.steps.length + 1;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                Chế độ A: Branching Study (Trải nghiệm quyết định liên tục)
              </span>
              <span className="text-xs font-medium text-gray-500">
                Lần thử #{attempt.attemptNumber}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-2">{caseData.title}</h2>
            <p className="text-xs text-gray-500">{caseData.courseName}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-500 block uppercase">Tiến trình</span>
            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Quyết định {decisionCount}
            </span>
          </div>
        </div>

        {/* Situation / Context Box */}
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tình huống thực tế hiện tại
              </h3>
            </div>
            <p className="text-base text-gray-900 leading-relaxed">{currentNode.situation}</p>
          </div>

          {currentNode.contextData && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2">
              <span className="font-bold">📊 Dữ liệu bối cảnh:</span>
              <span>{currentNode.contextData}</span>
            </div>
          )}
        </div>

        {/* Decision Options */}
        <div className="mt-8">
          <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Lựa chọn hành động của bạn tại nút quyết định này:
            </h4>
            <p className="text-xs text-gray-500">
              * Chọn một phương án để tiến thẳng tới diễn biến tiếp theo. Không có biểu mẫu giải trình ngắt quãng trong quá trình trải nghiệm.
            </p>
          </div>

          <div className="space-y-3">
            {currentNode.options.map((option, idx) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex items-start space-x-3 group cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-600 group-hover:text-white text-gray-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900 leading-relaxed">
                    {option.text}
                  </p>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 text-sm font-semibold shrink-0">
                  Chọn →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
