/**
 * EduBranch AI — Reflection Page (Mode A & Mode B)
 *
 * NON-NEGOTIABLE PRODUCT DIRECTION REQUIREMENTS:
 * 1. Post-journey metacognitive reflection on decision consequences and lessons learned.
 * 2. Absolute rule: AI does NOT grade or score reflection.
 * 3. Retry action creates a NEW ATTEMPT (preserves previous attempt history without mutating it).
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCaseStudyStore, SAMPLE_BRANCHING_CASE } from "../../stores/caseStudyStore";

export function ReflectionPage() {
  const { caseId = "case-business-crisis-1", attemptId } = useParams();
  const navigate = useNavigate();

  const {
    currentAttempt,
    attemptHistory,
    submitBranchingReflection,
    retryBranchingAttempt,
  } = useCaseStudyStore();

  const [reflectionText, setReflectionText] = useState(
    currentAttempt?.reflectionText || ""
  );
  const isSubmitted = currentAttempt?.reflectionStatus === "SUBMITTED";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    submitBranchingReflection(reflectionText);
  };

  const handleRetryNewAttempt = () => {
    retryBranchingAttempt(caseId);
    navigate(`/student/cases/${caseId}/branching-play`);
  };

  const caseData = SAMPLE_BRANCHING_CASE;
  const attempt = currentAttempt;

  if (!attempt || (attemptId && attempt.id !== attemptId) || !attempt.isCompleted) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <h3 className="text-base font-bold text-gray-800 mb-2">Chưa thể mở phần suy ngẫm</h3>
        <p className="text-sm text-gray-500 mb-4">
          Bạn cần hoàn tất hành trình và REVIEW đúng lần thử trước khi viết reflection.
        </p>
        <button
          onClick={() => navigate(`/student/cases/${caseId}/branching-play`)}
          className="btn-primary"
        >
          Quay lại hành trình →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              Giai đoạn 3: TỰ SUY NGẪM (Metacognitive Reflection)
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{caseData.title}</h2>
            <p className="text-xs text-gray-500 mt-1">
              Đúc kết bài học quản trị từ Lần thử #{attempt?.attemptNumber || 1}
            </p>
          </div>
          {isSubmitted && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              ✓ Đã nộp suy ngẫm
            </span>
          )}
        </div>

        {/* Compact Path Summary */}
        {attempt?.outcomeText && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed">
            <span className="font-bold block mb-1 text-slate-900">
              🏁 Tóm tắt kết quả hành trình bạn vừa trải qua:
            </span>
            {attempt.outcomeText}
          </div>
        )}
      </div>

      {/* Reflection Form or Read-only Display */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">
          Câu hỏi định hướng suy ngẫm:
        </h3>
        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 mb-4 bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
          <li>Những thông tin cốt lõi nào bạn đã cân nhắc khi đưa ra các quyết định then chốt?</li>
          <li>Hệ quả thực tế nhận được có nằm ngoài dự tính ban đầu của bạn không? Vì sao?</li>
          <li>Nếu được thực hiện lại tình huống này, bạn sẽ thay đổi quyết định tại điểm nào?</li>
        </ul>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-2">
                Nội dung suy ngẫm đã ghi nhận:
              </span>
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {currentAttempt?.reflectionText}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              ✓ <strong>Đã lưu vào hồ sơ học tập.</strong> Giảng viên sẽ đọc phần suy ngẫm của bạn để chuẩn bị
              nội dung thảo luận và phản hồi trên lớp. AI hoàn toàn không chấm điểm phần này.
            </div>

            {/* Action to Retry (New Attempt) */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Muốn khám phá một lộ trình khác?</h4>
                <p className="text-xs text-gray-500">
                  Lần thử lại sẽ tạo một <strong>Attempt mới độc lập</strong> (#{attempt ? attempt.attemptNumber + 1 : 2}), giữ nguyên toàn bộ lịch sử lần thử này.
                </p>
              </div>
              <button
                onClick={handleRetryNewAttempt}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition shadow flex items-center space-x-1 cursor-pointer"
              >
                <span>Thử nghiệm lộ trình mới (New Attempt)</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Trình bày bài học đúc kết, góc nhìn phản tư và những điểm bạn sẽ thay đổi nếu đối mặt với khủng hoảng thực tế này..."
              rows={6}
              required
              className="w-full text-sm p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(`/student/cases/${caseId}/attempt/${attempt?.id || attemptId}/review`)}
                className="btn-secondary text-xs"
              >
                ← Quay lại Review Lộ trình
              </button>
              <button
                type="submit"
                disabled={!reflectionText.trim()}
                className="btn-primary text-xs py-2.5 px-6"
              >
                Xác nhận nộp bài Suy ngẫm (Complete)
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History of Previous Attempts */}
      {attemptHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
            📚 Lịch sử các lần thử trước đó ({attemptHistory.length} lần thử được lưu trữ độc lập):
          </h4>
          <div className="space-y-2">
            {attemptHistory.map((past) => (
              <div
                key={past.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 text-xs"
              >
                <div>
                  <span className="font-bold text-gray-800">Lần thử #{past.attemptNumber}</span>
                  <span className="text-gray-500 ml-2">· {past.steps.length} quyết định</span>
                  <span className="text-gray-400 ml-2">
                    · {new Date(past.startedAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                  {past.reflectionStatus === "SUBMITTED" ? "Đã suy ngẫm" : "Đã hoàn thành"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
