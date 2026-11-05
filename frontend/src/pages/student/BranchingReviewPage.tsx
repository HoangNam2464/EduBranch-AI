/**
 * EduBranch AI — Journey Review (Mode A — REVIEW phase). Figma 05.4 (`135:4517`).
 *
 * 1. Opens only after the journey is complete.
 * 2. Replays the path: chosen option, alternatives not taken.
 * 3. Reveals consequences here for the first time.
 * 4. Retrospective reasoning is optional and saved per decision (not forced on every node).
 * 5. Leads to Reflection.
 * Not rendered: the AI Challenge Support entry of the frame (HOLD, OPD-005 — register `27:321`).
 * Data: GET /branching-attempts/:id (consequences and alternatives only once completed).
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { branchingAttemptService, AttemptDetail } from "../../services/branchingAttemptService";
import { useStudentHeader } from "../../layouts/StudentLayout";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  ErrorState,
  Skeleton,
  Textarea,
  IconCompass,
  IconEye,
  IconLock,
  IconArrowRight,
} from "../../components/ui";

type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "Tự động lưu khi rời ô nhập",
  saving: "Đang lưu…",
  saved: "Đã lưu",
  error: "Lưu thất bại, hãy thử lại",
};

export function BranchingReviewPage() {
  const { caseId = "", attemptId = "" } = useParams();
  const navigate = useNavigate();
  const { setHeader } = useStudentHeader();

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reasonings, setReasonings] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  const load = useCallback(() => {
    setLoadError(null);
    branchingAttemptService
      .getAttempt(attemptId)
      .then((a) => {
        setAttempt(a);
        setReasonings(Object.fromEntries(a.steps.filter((s) => s.reasoningText).map((s) => [s.nodeId, s.reasoningText as string])));
      })
      .catch(() => setLoadError("Không tải được hành trình. Vui lòng thử lại."));
  }, [attemptId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (attempt) setHeader({ caseTitle: attempt.caseTitle, phase: "Giai đoạn 2: Xem lại hành trình" });
  }, [attempt, setHeader]);

  if (loadError) return <Card padding={false}><ErrorState description={loadError} onRetry={load} /></Card>;
  if (!attempt) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!attempt.isCompleted || attempt.steps.length === 0) {
    return (
      <Card className="text-center">
        <h1 className="text-lg font-semibold text-gray-900">Chưa thể mở Journey Review</h1>
        <p className="mt-2 text-sm text-gray-600">Bạn cần đi hết hành trình quyết định trước khi xem lại hệ quả.</p>
        <Button className="mt-5" onClick={() => navigate(`/student/cases/${caseId}/branching-play`)}>Tiếp tục hành trình</Button>
      </Card>
    );
  }

  const saveReasoning = async (nodeId: string) => {
    const text = (reasonings[nodeId] || "").trim();
    const original = (attempt.steps.find((s) => s.nodeId === nodeId)?.reasoningText || "").trim();
    if (text === original) return;
    setSaveState((p) => ({ ...p, [nodeId]: "saving" }));
    try {
      await branchingAttemptService.saveReasoning(attempt.id, nodeId, text);
      setAttempt((prev) => prev && { ...prev, steps: prev.steps.map((s) => (s.nodeId === nodeId ? { ...s, reasoningText: text } : s)) });
      setSaveState((p) => ({ ...p, [nodeId]: "saved" }));
    } catch {
      setSaveState((p) => ({ ...p, [nodeId]: "error" }));
    }
  };

  const outcome = attempt.outcomeNode?.situation;
  const goReflect = () => navigate(`/student/cases/${caseId}/attempt/${attempt.id}/reflect`);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "Tình huống", onClick: () => navigate(`/student/cases/${caseId}/branching-play`) }, { label: "Journey Review" }]} />
        <h1 className="text-2xl font-semibold text-gray-900">Journey Review – Xem lại toàn bộ hành trình quyết định</h1>
        <p className="mt-1 text-sm text-gray-600">{attempt.caseTitle} • Lần làm #{attempt.attemptNumber}</p>
      </div>

      <Card>
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><IconCompass size={18} className="text-blue-600" /> Sơ đồ hành trình quyết định</h2>
        <p className="mt-1 text-xs text-gray-500">Tổng cộng: {attempt.steps.length} bước quyết định đã đi qua.</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {attempt.steps.map((s, i) => (
            <li key={s.nodeId} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Bước {i + 1}</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-900">{s.situation}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-600">Đã chọn: {s.selectedOptionText}</p>
            </li>
          ))}
          {outcome && (
            <li className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Kết cục</p>
              <p className="mt-1 line-clamp-3 text-sm text-gray-800">{outcome}</p>
            </li>
          )}
        </ol>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Chi tiết các quyết định & hệ quả thực tế</h2>
        <span className="flex items-center gap-1 text-xs text-green-800"><IconLock size={13} /> Đã mở khóa sau khi hoàn thành</span>
      </div>

      {attempt.steps.map((s, i) => (
        <Card key={s.nodeId}>
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{i + 1}</span>
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-900">{s.situation}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-600">Phương án bạn đã chọn:</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{s.selectedOptionText}</p>
          </div>
          <div className="mt-3 rounded-lg border border-gray-200 border-l-4 border-l-teal-700 bg-gray-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-900"><IconEye size={14} /> Hệ quả thực tế:</p>
            <p className="mt-1 text-sm leading-6 text-gray-800">{s.consequence || "—"}</p>
          </div>
          {s.otherOptions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-600">Các phương án bạn chưa chọn:</p>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                {s.otherOptions.map((o) => <li key={o.id}>{o.text}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-5 border-t border-gray-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={`reason-${s.nodeId}`} className="text-sm font-medium text-gray-900">Bản lập luận của bạn</label>
              <span className="text-xs text-gray-600" aria-live="polite">{SAVE_LABEL[saveState[s.nodeId] ?? "idle"]}</span>
            </div>
            <p className="mb-2 text-xs text-gray-600">Không bắt buộc cho mọi bước. Hãy tập trung vào quyết định mang tính bước ngoặt.</p>
            <Textarea
              id={`reason-${s.nodeId}`}
              rows={3}
              value={reasonings[s.nodeId] || ""}
              onChange={(e) => {
                setReasonings((p) => ({ ...p, [s.nodeId]: e.target.value }));
                setSaveState((p) => ({ ...p, [s.nodeId]: "idle" }));
              }}
              onBlur={() => saveReasoning(s.nodeId)}
              placeholder="Vì sao bạn chọn phương án này? Dữ kiện hoặc giả định nào đã dẫn bạn tới lựa chọn đó?"
            />
          </div>
        </Card>
      ))}

      {outcome && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Kết quả cuối cùng đạt được</p>
            <Badge variant="neutral">Lần làm #{attempt.attemptNumber}</Badge>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{outcome}</p>
        </Card>
      )}

      {Object.values(saveState).includes("error") && (
        <Alert variant="error">Có bản lập luận chưa lưu được. Hãy bấm vào ô đó rồi rời ra để thử lưu lại.</Alert>
      )}
      <div className="flex justify-end">
        <Button size="lg" onClick={goReflect} id="btn-go-reflect">
          Chuyển sang bước Suy ngẫm <IconArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
