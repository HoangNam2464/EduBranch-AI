/**
 * EduBranch AI — Review Study Feedback & Reflection Page (Mode B)
 *
 * CRITICAL REQUIREMENTS:
 * 1. Shows student's submitted solution and reasoning.
 * 2. Displays Lecturer's feedback.
 * 3. Captures Student Reflection on Lecturer Feedback (completing status: REFLECTED).
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCaseStudyStore, SAMPLE_REVIEW_STUDY_CASE } from "../../stores/caseStudyStore";

export function ReviewFeedbackPage() {
  const { caseId = "case-review-study-1", submissionId } = useParams();
  const navigate = useNavigate();

  const { reviewSubmission, submitReviewReflection } = useCaseStudyStore();
  const [reflection, setReflection] = useState(reviewSubmission?.reflectionText || "");

  const submission = reviewSubmission;

  if (!submission || submission.id !== submissionId) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <h3 className="text-base font-bold text-gray-800 mb-2">Chưa có bài Review Study để hiển thị</h3>
        <p className="text-sm text-gray-500 mb-4">
          Hãy nộp một phương án trước. Phản hồi chỉ xuất hiện sau khi giảng viên review bài làm.
        </p>
        <button
          onClick={() => navigate(`/student/cases/${caseId}/review-study`)}
          className="btn-primary"
        >
          Quay lại Review Study →
        </button>
      </div>
    );
  }

  const isReviewed = submission.status === "REVIEWED" || submission.status === "REFLECTED";
  const isReflected = submission.status === "REFLECTED" || Boolean(submission.reflectionText);

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    submitReviewReflection(reflection);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Chế độ B: Review Study · Phản hồi & Suy ngẫm
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{SAMPLE_REVIEW_STUDY_CASE.title}</h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isReflected ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {isReflected ? "✓ Đã hoàn tất phản tư (REFLECTED)" : "Giảng viên đã phản hồi (REVIEWED)"}
          </span>
        </div>
      </div>

      {/* Submitted Solution Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Nội dung phương án bạn đã đệ trình:
        </h3>

        {submission.studentAnalysis && (
          <div className="bg-gray-50 p-3.5 rounded border border-gray-200 text-xs">
            <span className="font-bold text-gray-700 block mb-1">Phân tích bối cảnh:</span>
            <p className="text-gray-800">{submission.studentAnalysis}</p>
          </div>
        )}

        <div className="bg-gray-50 p-3.5 rounded border border-gray-200 text-xs">
          <span className="font-bold text-gray-700 block mb-1">Phương án đề xuất:</span>
          <p className="text-gray-900 font-medium">{submission.proposedSolution}</p>
        </div>

        <div className="bg-gray-50 p-3.5 rounded border border-gray-200 text-xs">
          <span className="font-bold text-gray-700 block mb-1">Lập luận bảo vệ:</span>
          <p className="text-gray-800">{submission.reasoningText}</p>
        </div>
      </div>

      {/* Lecturer Feedback Card */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-base">👨‍🏫</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Nhận xét & Phản hồi chuyên môn của Giảng viên:
          </h3>
        </div>
        <p className="text-sm text-amber-950 font-medium bg-white p-4 rounded-lg border border-amber-200 leading-relaxed whitespace-pre-wrap">
          {isReviewed
            ? submission.lecturerFeedback || "Giảng viên chưa thêm nhận xét chi tiết."
            : "Bài làm đã được nộp và đang chờ giảng viên review."}
        </p>
      </div>

      {/* Student Reflection on Lecturer Feedback */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
          Suy ngẫm & Đúc kết sau khi nhận phản hồi:
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Dựa trên nhận xét của Giảng viên, bạn đúc kết được điều gì để hoàn thiện năng lực giải quyết tình huống quản trị?
        </p>

        {!isReviewed ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
            Reflection sẽ mở sau khi giảng viên gửi phản hồi định tính cho bài làm này.
          </div>
        ) : isReflected ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-900 space-y-2">
            <span className="font-bold block">Nội dung suy ngẫm đã lưu:</span>
            <p className="text-gray-900 text-sm leading-relaxed">{reflection || submission.reflectionText}</p>
          </div>
        ) : (
          <form onSubmit={handleReflectionSubmit} className="space-y-4">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Ghi lại những điều bạn học được từ góc nhìn của Giảng viên, các giả định bạn cần điều chỉnh trong tương lai..."
              rows={4}
              required
              className="w-full text-xs p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!reflection.trim()}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition shadow cursor-pointer disabled:opacity-50"
              >
                Xác nhận hoàn tất phản tư (Submit Reflection)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
