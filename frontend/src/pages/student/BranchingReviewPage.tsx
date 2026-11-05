/**
 * EduBranch AI — Branching Review Page (Mode A — REVIEW Phase)
 *
 * CRITICAL PRODUCT DIRECTION REQUIREMENTS:
 * 1. REVIEW happens AFTER completing the journey (terminal node reached).
 * 2. Replays full journey: what was chosen, alternative paths not taken.
 * 3. Consequences of choices are REVEALED HERE for the first time.
 * 4. Captures retrospective reasoning for pivotal/key decisions (not forced on every node).
 * 5. Provides link to Reflection and optional AI Challenge Support.
 *
 * Data: GET /branching-attempts/:id (consequences and alternatives are only returned once completed).
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCaseStudyStore } from "../../stores/caseStudyStore";
import { branchingAttemptService, AttemptDetail } from "../../services/branchingAttemptService";

type SaveState = "idle" | "saving" | "saved" | "error";

export function BranchingReviewPage() {
  const { caseId = "", attemptId = "" } = useParams();
  const navigate = useNavigate();
  const { initChallengeSession } = useCaseStudyStore();

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reasonings, setReasonings] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    let active = true;
    branchingAttemptService
      .getAttempt(attemptId)
      .then((a) => {
        if (!active) return;
        setAttempt(a);
        const initial: Record<string, string> = {};
        a.steps.forEach((s) => {
          if (s.reasoningText) initial[s.nodeId] = s.reasoningText;
        });
        setReasonings(initial);
      })
      .catch(() => active && setLoadError("Không tải được hành trình. Vui lòng thử lại."));
    return () => {
      active = false;
    };
  }, [attemptId]);

  if (loadError) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <h3 className="text-base font-bold text-gray-800 mb-2">Không mở được Review</h3>
        <p className="text-sm text-gray-500 mb-4">{loadError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Tải lại</button>
      </div>
    );
  }

  if (!attempt) {
    return <div className="p-8 text-center text-gray-500">Đang tải hành trình...</div>;
  }

  if (!attempt.isCompleted || attempt.steps.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <h3 className="text-base font-bold text-gray-800 mb-2">Chưa có dữ liệu hành trình</h3>
        <p className="text-sm text-gray-500 mb-4">
          Bạn cần trải nghiệm và đi hết lộ trình quyết định trước khi vào giai đoạn Review.
        </p>
        <button onClick={() => navigate(`/student/cases/${caseId}/branching-play`)} className="btn-primary">
          Tiếp tục hành trình Case →
        </button>
      </div>
    );
  }

  const handleReasoningChange = (nodeId: string, val: string) => {
    setReasonings((prev) => ({ ...prev, [nodeId]: val }));
    setSaveState((prev) => ({ ...prev, [nodeId]: "idle" }));
  };

  const handleReasoningBlur = async (nodeId: string) => {
    const text = (reasonings[nodeId] || "").trim();
    const original = attempt.steps.find((s) => s.nodeId === nodeId)?.reasoningText || "";
    if (text === original.trim()) return;
    setSaveState((prev) => ({ ...prev, [nodeId]: "saving" }));
    try {
      await branchingAttemptService.saveReasoning(attempt.id, nodeId, text);
      setAttempt((prev) =>
        prev && { ...prev, steps: prev.steps.map((s) => (s.nodeId === nodeId ? { ...s, reasoningText: text } : s)) },
      );
      setSaveState((prev) => ({ ...prev, [nodeId]: "saved" }));
    } catch {
      setSaveState((prev) => ({ ...prev, [nodeId]: "error" }));
    }
  };

  const saveLabel = (nodeId: string) => {
    switch (saveState[nodeId]) {
      case "saving":
        return "Đang lưu...";
      case "saved":
        return "✓ Đã lưu";
      case "error":
        return "Lưu thất bại, hãy thử lại";
      default:
        return "Tự động lưu khi rời ô nhập";
    }
  };

  const handleInvokeChallenge = (nodeId: string, reasoning: string) => {
    if (!reasoning || reasoning.trim().length < 10) {
      alert("Vui lòng ghi ít nhất 10 ký tự giải trình trước khi kích hoạt AI Challenge Support.");
      return;
    }
    void nodeId;
    const sessionId = initChallengeSession(caseId, "BRANCHING", reasoning);
    navigate(`/student/cases/${caseId}/challenge/${sessionId}`);
  };

  const handleGoToReflection = () => {
    navigate(`/student/cases/${caseId}/attempt/${attempt.id}/reflect`);
  };

  const outcomeText = attempt.outcomeNode?.situation;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
              Giai đoạn 2: REVIEW (Hồi tưởng & Đánh giá Lộ trình)
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{attempt.caseTitle}</h2>
            <p className="text-xs text-gray-500 mt-1">
              Phân tích hồi cứu lần thử #{attempt.attemptNumber} · Tổng số điểm quyết định: {attempt.steps.length}
            </p>
          </div>
          <button
            onClick={handleGoToReflection}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition shadow flex items-center space-x-1 cursor-pointer"
          >
            <span>Đến trang Reflection (Suy ngẫm)</span>
            <span>→</span>
          </button>
        </div>

        <div className="mt-4 p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900 leading-relaxed">
          💡 <strong>Mục tiêu của giai đoạn REVIEW:</strong> Xem lại toàn bộ cây quyết định bạn vừa trải qua.
          Tại đây, các hệ quả thực tế đằng sau lựa chọn của bạn được giải mã. Hãy viết giải trình hồi tưởng
          cho các quyết định quan trọng để chuẩn bị cho phần thảo luận trên lớp cùng Giảng viên.
        </div>
      </div>

      {/* Sequential Journey Replay Timeline */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-2">
          <span>📍 Lộ trình quyết định chi tiết theo trình tự thời gian</span>
        </h3>

        {attempt.steps.map((step, idx) => (
          <div
            key={step.nodeId}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                Điểm quyết định #{idx + 1}
              </span>
              
            </div>

            {/* Situation */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Tình huống bạn đã đối mặt:
              </h4>
              <p className="text-sm text-gray-900 bg-gray-50 p-3.5 rounded border border-gray-200 leading-relaxed font-medium">
                {step.situation}
              </p>
            </div>

            {/* Decision Made vs Alternative */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-lg p-3.5">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
                  ✓ Quyết định bạn đã chọn:
                </span>
                <p className="text-xs font-medium text-emerald-950 leading-relaxed">
                  {step.selectedOptionText}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                  Khác biệt: Các lựa chọn bạn đã bỏ qua:
                </span>
                <div className="space-y-1.5">
                  {step.otherOptions.map((alt) => (
                    <p key={alt.id} className="text-xs text-gray-600 line-through opacity-80">
                      • {alt.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Consequence Reveal Card */}
            <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm">⚡</span>
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Hệ quả thực tế được tiết lộ (Chỉ giải mã ở bước REVIEW):
                </h5>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">{step.consequence || "—"}</p>
            </div>

            {/* Retrospective Reasoning Box */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                  ✍️ Giải trình hồi tưởng của bạn (Tùy chọn cho các quyết định trọng yếu):
                </label>
                <span className="text-xs text-gray-400">{saveLabel(step.nodeId)}</span>
              </div>
              <textarea
                value={reasonings[step.nodeId] || ""}
                onChange={(e) => handleReasoningChange(step.nodeId, e.target.value)}
                onBlur={() => handleReasoningBlur(step.nodeId)}
                placeholder="Tại sao bạn chọn phương án này? Những dữ liệu/giả định nào đã định hướng lựa chọn của bạn? Nếu làm lại, bạn có thay đổi không?..."
                rows={3}
                className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-gray-500 italic">
                  * Không bắt buộc giải trình mọi node. Hãy tập trung vào quyết định có tính bước ngoặt.
                </p>
                <button
                  type="button"
                  onClick={() => handleInvokeChallenge(step.nodeId, reasonings[step.nodeId] || "")}
                  className="text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded border border-purple-200 transition cursor-pointer flex items-center space-x-1"
                >
                  <span>🤖 Thử thách tư duy với AI Support</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Outcome Milestone Card */}
        {outcomeText && (
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md">
            <span className="text-xs uppercase tracking-wider text-blue-400 font-bold block mb-2">
              🏁 Kết cục chung cuộc của hành trình (Lần thử #{attempt.attemptNumber})
            </span>
            <p className="text-sm leading-relaxed text-gray-200">{outcomeText}</p>
          </div>
        )}

        {/* Action to Reflection */}
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Hoàn tất rà soát hành trình?</h4>
            <p className="text-xs text-gray-500">
              Chuyển sang trang Tự suy ngẫm (Reflection) để đúc kết bài học quản trị trước khi thử lại hoặc nộp bài.
            </p>
          </div>
          <button
            onClick={handleGoToReflection}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shadow flex items-center space-x-2 cursor-pointer"
          >
            <span>Đến trang Reflection →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
