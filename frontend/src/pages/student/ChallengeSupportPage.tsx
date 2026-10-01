/**
 * EduBranch AI — AI Reasoning / Challenge Support Page (Both Learning Modes)
 *
 * NON-NEGOTIABLE REQUIREMENTS:
 * 1. AI Reasoning & Challenge Support provides Socratic counter-questions only.
 * 2. Strict cap: 1-2 rounds maximum (enforced).
 * 3. Absolute rule: AI does NOT grade, score, evaluate pass/fail, or judge academic correctness.
 * 4. Embedded support tool, not a generic chatbot or debate assistant.
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCaseStudyStore } from "../../stores/caseStudyStore";

export function ChallengeSupportPage() {
  const { caseId = "case-business-crisis-1", sessionId } = useParams();
  const navigate = useNavigate();

  const { challengeSession, submitStudentChallengeReply } = useCaseStudyStore();
  const [studentReply, setStudentReply] = useState("");

  const session = challengeSession || {
    sessionId: sessionId || "session-demo",
    caseId,
    targetType: "BRANCHING" as const,
    currentRound: 1,
    messages: [
      {
        role: "STUDENT" as const,
        content: "Tôi chọn thu hồi khẩn cấp và minh bạch vì uy tín thương hiệu là tài sản sống còn.",
        round: 1,
      },
      {
        role: "CHALLENGE_SUPPORT" as const,
        content:
          "Nếu đối thủ cạnh tranh lợi dụng việc thu hồi để phát tán tin đồn rằng toàn bộ các dòng thuốc khác của bạn cũng nhiễm tạp chất, doanh nghiệp bạn có đủ dự phòng dòng tiền để chịu đựng 6 tháng điều tra không?",
        round: 1,
      },
    ],
    isCompleted: false,
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentReply.trim() || session.isCompleted) return;
    submitStudentChallengeReply(studentReply);
    setStudentReply("");
  };

  const handleReturn = () => {
    if (session.targetType === "BRANCHING") {
      navigate(`/student/cases/${caseId}/branching-play`);
    } else {
      navigate(`/student/cases/${caseId}/review-study`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                AI Reasoning / Challenge Support
              </span>
              <span className="text-xs font-medium text-gray-500">
                Vòng {session.currentRound} / 2 (Giới hạn tối đa 2 vòng)
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Thử thách phản biện tư duy & Giả định
            </h2>
          </div>
          <button onClick={handleReturn} className="btn-secondary text-xs">
            ← Quay lại phiên học tập
          </button>
        </div>

        {/* Boundary Disclaimer */}
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 leading-relaxed">
          🔒 <strong>Nguyên tắc sư phạm:</strong> AI Challenge Support đặt ra câu hỏi phản biện nhằm thử thách
          tính chặt chẽ của lập luận và kích hoạt tư duy đa chiều. <strong>AI hoàn toàn không chấm điểm,
          không đánh giá đúng/sai hay thay thế phán đoán của Giảng viên.</strong>
        </div>
      </div>

      {/* Message Exchange Flow */}
      <div className="space-y-4">
        {session.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl border ${
              msg.role === "STUDENT"
                ? "bg-blue-50/50 border-blue-200 ml-8"
                : "bg-white border-purple-200 shadow-sm mr-8"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  msg.role === "STUDENT" ? "text-blue-800" : "text-purple-800"
                }`}
              >
                {msg.role === "STUDENT" ? "👤 Lập luận của bạn" : "🤖 Câu hỏi phản biện từ AI Support"}
              </span>
              <span className="text-[11px] text-gray-400">Vòng {msg.round}</span>
            </div>
            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Reply Form or Session Completed Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {session.isCompleted ? (
          <div className="text-center py-4 space-y-3">
            <span className="inline-block p-2 rounded-full bg-emerald-100 text-emerald-700 text-lg">
              ✓
            </span>
            <h4 className="text-sm font-bold text-gray-900">
              Phiên Challenge Support đã hoàn thành (Đạt mức trần 2 vòng phản biện)
            </h4>
            <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
              Bạn đã hoàn thành việc rà soát các giả định và rủi ro tiềm ẩn. Hãy mang những lập luận này vào
              phần thảo luận tình huống trực tiếp với Giảng viên và lớp học.
            </p>
            <button onClick={handleReturn} className="btn-primary text-xs py-2 px-5 mt-2">
              Quay lại hoàn tất bài học →
            </button>
          </div>
        ) : (
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Phản hồi câu hỏi thử thách của bạn (Vòng {session.currentRound + 1} - Vòng cuối):
            </label>
            <textarea
              value={studentReply}
              onChange={(e) => setStudentReply(e.target.value)}
              placeholder="Trình bày giải pháp đối phó với rủi ro phản biện trên..."
              rows={4}
              required
              className="w-full text-xs p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Tối đa 2 vòng phản biện để chống lan man</span>
              <button
                type="submit"
                disabled={!studentReply.trim()}
                className="btn-primary text-xs py-2 px-5 disabled:opacity-50"
              >
                Gửi phản hồi vòng 2 →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
