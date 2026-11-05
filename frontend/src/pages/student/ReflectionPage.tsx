/**
 * EduBranch AI — Reflection (Mode A). Figma 05.7 form (`135:4597`), 05.8 submitted (`135:4651`).
 *
 * 1. Post-journey metacognitive reflection on consequences and lessons learned.
 * 2. AI does NOT grade or score reflection.
 * 3. "Làm lại" creates a NEW attempt; earlier attempts are kept unchanged.
 * Data: GET /branching-attempts/:id, POST /branching-attempts/:id/reflection,
 * GET /cases/:caseId/attempts, POST /cases/:caseId/branching-attempts.
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { branchingAttemptService, AttemptDetail, AttemptSummary } from "../../services/branchingAttemptService";
import { useStudentHeader } from "../../layouts/StudentLayout";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  Skeleton,
  Textarea,
  formatDate,
  IconArrowLeft,
  IconCheck,
  IconRetry,
} from "../../components/ui";

const PROMPTS = [
  "Những thông tin cốt lõi nào bạn đã cân nhắc khi đưa ra các quyết định then chốt?",
  "Hệ quả thực tế có nằm ngoài dự tính ban đầu của bạn không? Vì sao?",
  "Nếu làm lại tình huống này, bạn sẽ thay đổi quyết định tại điểm nào?",
];

export function ReflectionPage() {
  const { caseId = "", attemptId = "" } = useParams();
  const navigate = useNavigate();
  const { setHeader } = useStudentHeader();

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [text, setText] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);
    Promise.all([branchingAttemptService.getAttempt(attemptId), branchingAttemptService.getAttemptsByCase(caseId)])
      .then(([a, all]) => {
        setAttempt(a);
        setText(a.reflectionText || "");
        setHistory(all);
      })
      .catch(() => setLoadError("Không tải được dữ liệu lần làm. Vui lòng thử lại."));
  }, [attemptId, caseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (attempt) setHeader({ caseTitle: attempt.caseTitle, phase: "Giai đoạn 3: Suy ngẫm" });
  }, [attempt, setHeader]);

  if (loadError) return <Card padding={false}><ErrorState description={loadError} onRetry={load} /></Card>;
  if (!attempt) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!attempt.isCompleted) {
    return (
      <Card className="text-center">
        <h1 className="text-lg font-semibold text-gray-900">Chưa thể mở phần Suy ngẫm</h1>
        <p className="mt-2 text-sm text-gray-600">Bạn cần hoàn tất hành trình và xem Journey Review trước khi viết suy ngẫm.</p>
        <Button className="mt-5" onClick={() => navigate(`/student/cases/${caseId}/branching-play`)}>Quay lại hành trình</Button>
      </Card>
    );
  }

  const submitted = attempt.reflectionStatus === "SUBMITTED";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      await branchingAttemptService.submitReflection(attempt.id, value);
      setAttempt({ ...attempt, reflectionStatus: "SUBMITTED", reflectionText: value });
    } catch {
      setError("Nộp suy ngẫm thất bại. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const startNew = async () => {
    setBusy(true);
    setError(null);
    try {
      await branchingAttemptService.startAttempt(caseId);
      navigate(`/student/cases/${caseId}/branching-play`);
    } catch {
      setError("Không tạo được lượt làm mới. Vui lòng thử lại.");
      setBusy(false);
      setConfirmNew(false);
    }
  };

  const others = history.filter((h) => h.id !== attempt.id).sort((a, b) => a.attemptNumber - b.attemptNumber);
  const outcome = attempt.outcomeNode?.situation;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Tình huống", onClick: () => navigate(`/student/cases/${caseId}/branching-play`) },
            { label: "Journey Review", onClick: () => navigate(`/student/cases/${caseId}/attempt/${attempt.id}/review`) },
            { label: "Suy ngẫm" },
          ]}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Suy ngẫm sau hành trình</h1>
          {submitted ? <Badge variant="success" dot>Đã nộp suy ngẫm</Badge> : <Badge variant="neutral">Lần làm #{attempt.attemptNumber}</Badge>}
        </div>
        <p className="mt-1 text-sm text-gray-600">{attempt.caseTitle}</p>
      </div>

      {outcome && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Kết cục hành trình của bạn</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{outcome}</p>
        </Card>
      )}

      <Card>
        <h2 className="text-base font-semibold text-gray-900">Câu hỏi định hướng</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
          {PROMPTS.map((p) => <li key={p}>{p}</li>)}
        </ul>

        {submitted ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-600">Nội dung suy ngẫm đã ghi nhận</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-900">{attempt.reflectionText}</p>
            </div>
            <Alert variant="success">
              <strong className="font-semibold">Đã lưu vào hồ sơ học tập.</strong> Giảng viên dùng phần suy ngẫm để chuẩn bị thảo luận trên lớp. AI không chấm điểm phần này.
            </Alert>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label htmlFor="reflection" className="text-sm font-medium text-gray-900">Bài suy ngẫm của bạn</label>
            <Textarea
              id="reflection"
              rows={7}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Bài học bạn rút ra, điều bạn sẽ làm khác đi và lý do."
            />
            <p className="text-xs text-gray-600">{text.trim().length} ký tự • AI không chấm điểm bài suy ngẫm.</p>
            {error && <Alert variant="error">{error}</Alert>}
            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <Button variant="secondary" leftIcon={<IconArrowLeft size={15} />} onClick={() => navigate(`/student/cases/${caseId}/attempt/${attempt.id}/review`)}>
                Quay lại Journey Review
              </Button>
              <Button type="submit" disabled={!text.trim()} isLoading={busy} leftIcon={<IconCheck size={15} />} id="btn-submit-reflection">
                Nộp bài suy ngẫm
              </Button>
            </div>
          </form>
        )}
      </Card>

      {submitted && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Muốn khám phá một hướng đi khác?</h2>
              <p className="mt-1 text-xs text-gray-600">Lượt làm mới (#{history.length + 1}) là một hành trình độc lập; lượt này được giữ nguyên.</p>
            </div>
            <Button leftIcon={<IconRetry size={15} />} onClick={() => setConfirmNew(true)} id="btn-new-attempt">Làm lại</Button>
          </div>
          {error && <Alert variant="error" className="mt-4">{error}</Alert>}
        </Card>
      )}

      {others.length > 0 && (
        <Card padding={false}>
          <h2 className="border-b border-gray-200 px-5 py-4 text-sm font-semibold text-gray-900">Các lần làm khác ({others.length})</h2>
          <ul className="divide-y divide-gray-200">
            {others.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm text-gray-900">Lần làm #{h.attemptNumber}</p>
                  <p className="text-xs text-gray-600">Bắt đầu: {formatDate(h.startedAt, true)}</p>
                </div>
                <Badge variant={h.isCompleted ? "neutral" : "warning"}>
                  {h.reflectionStatus === "SUBMITTED" ? "Đã suy ngẫm" : h.isCompleted ? "Đã hoàn thành" : "Đang thực hiện"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmNew}
        tone="primary"
        title="Bắt đầu lượt làm mới?"
        description="Lượt mới là một hành trình độc lập. Toàn bộ lịch sử các lượt trước được giữ nguyên."
        confirmLabel="Bắt đầu lượt mới"
        isLoading={busy}
        onConfirm={startNew}
        onClose={() => setConfirmNew(false)}
      />
    </div>
  );
}
