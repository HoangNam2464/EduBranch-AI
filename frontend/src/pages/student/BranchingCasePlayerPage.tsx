/**
 * EduBranch AI — Branching Case Player (Mode A — Experience Phase)
 * Figma: 05.1 intro + history (`135:4357`), 05.2 decision (`135:4399`), 05.3 end (`135:4469`),
 * 05.9 history (`135:4689`), 05.10 new-attempt dialog (`135:4726`).
 *
 * NON-NEGOTIABLE PRODUCT DIRECTION RULES:
 * 1. Experience-first: decision points follow each other with NO blocking steps.
 * 2. NO reasoning form between decision points.
 * 3. NO consequence mid-flow (revealed ONLY in Journey Review).
 * 4. Case length is dynamic (content-driven).
 * 5. Reaching a terminal node ends the journey and leads to Journey Review.
 * Data: backend branching-attempts API; the backend never sends next_node_id or consequences
 * for the current node (P0-SEC-02).
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
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
  ForbiddenState,
  Skeleton,
  cx,
  formatDate,
  IconBranch,
  IconRetry,
  IconArrowRight,
  IconFlag,
} from "../../components/ui";

interface CaseSummary {
  id: string;
  title: string;
  description: string | null;
}

const LETTERS = "ABCDEFGHIJ";

function loadErrorOf(err: any): { status?: number; message: string } {
  const status = err?.response?.status;
  if (status === 403) return { status, message: "Tình huống chưa được xuất bản hoặc bạn không có quyền truy cập." };
  if (status === 404) return { status, message: "Không tìm thấy tình huống." };
  return { status, message: "Không tải được tình huống. Vui lòng thử lại." };
}

export function BranchingCasePlayerPage() {
  const { caseId = "" } = useParams();
  const navigate = useNavigate();
  const { setHeader } = useStudentHeader();

  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [history, setHistory] = useState<AttemptSummary[] | null>(null);
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ status?: number; message: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const loadIntro = useCallback(async () => {
    setLoadError(null);
    try {
      const [c, h] = await Promise.all([
        apiClient.get<{ data: CaseSummary }>(`/cases/${caseId}`).then((r) => r.data.data),
        branchingAttemptService.getAttemptsByCase(caseId),
      ]);
      setSummary(c);
      setHistory(h);
    } catch (err) {
      setLoadError(loadErrorOf(err));
    }
  }, [caseId]);

  useEffect(() => {
    loadIntro();
  }, [loadIntro]);

  useEffect(() => {
    if (!summary) return;
    setHeader({
      caseTitle: summary.title,
      phase: attempt ? (attempt.isCompleted ? "Kết thúc hành trình" : "Giai đoạn 1: Trải nghiệm") : "Giới thiệu tình huống",
    });
  }, [summary, attempt, setHeader]);

  const open = history?.find((a) => !a.isCompleted);
  const completedCount = history?.filter((a) => a.isCompleted).length ?? 0;

  const enter = async (mode: "resume" | "new") => {
    setBusy(true);
    setActionError(null);
    try {
      const a = mode === "resume" && open ? await branchingAttemptService.getAttempt(open.id) : await branchingAttemptService.startAttempt(caseId);
      setAttempt(a);
      setChoice(null);
      setConfirmNew(false);
    } catch (err) {
      setActionError(loadErrorOf(err).message);
    } finally {
      setBusy(false);
    }
  };

  const confirmChoice = async () => {
    if (!attempt?.currentNode || !choice || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const next = await branchingAttemptService.chooseOption(attempt.id, attempt.currentNode.id, choice);
      setAttempt(next);
      setChoice(null);
      window.scrollTo({ top: 0 });
    } catch {
      setActionError("Không ghi nhận được lựa chọn. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  if (loadError?.status === 403) return <Card padding={false}><ForbiddenState description={loadError.message} /></Card>;
  if (loadError) return <Card padding={false}><ErrorState description={loadError.message} onRetry={loadIntro} /></Card>;
  if (!summary || !history) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  // ── Terminal (05.3) ─────────────────────────────────────────────────────
  if (attempt && (attempt.isCompleted || !attempt.currentNode)) {
    return (
      <Card className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><IconFlag size={22} /></span>
        <Badge variant="neutral">Lần làm #{attempt.attemptNumber}</Badge>
        <h1 className="mt-3 text-xl font-semibold text-gray-900">Bạn đã hoàn thành hành trình</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Bạn đã đi qua {attempt.steps.length} điểm quyết định. Hệ quả của từng lựa chọn và các phương án bạn chưa chọn sẽ được mở trong Journey Review.
        </p>
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={() => navigate(`/student/cases/${caseId}/attempt/${attempt.id}/review`)} id="btn-go-review">
            Xem Journey Review <IconArrowRight size={16} />
          </Button>
        </div>
      </Card>
    );
  }

  // ── Decision point (05.2) ──────────────────────────────────────────────
  if (attempt?.currentNode) {
    const node = attempt.currentNode;
    const idx = node.options.findIndex((o) => o.id === choice);
    return (
      <div className="space-y-6">
        <Card>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="info">Điểm quyết định {attempt.steps.length + 1}</Badge>
            <span className="text-xs text-gray-500">Lần làm #{attempt.attemptNumber}</span>
          </div>
          <p className="whitespace-pre-wrap text-[15px] leading-6 text-gray-900">{node.situation}</p>
        </Card>

        <section aria-labelledby="choose-heading">
          <h2 id="choose-heading" className="text-xs font-semibold uppercase tracking-wide text-gray-700">Chọn phương án hành động</h2>
          <p className="mb-3 text-sm text-gray-600">Lựa chọn của bạn sẽ dẫn tới diễn biến tiếp theo. Hệ quả chỉ được tiết lộ ở Journey Review.</p>
          <div role="radiogroup" aria-labelledby="choose-heading" className="space-y-2.5">
            {node.options.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={choice === o.id}
                disabled={busy}
                onClick={() => setChoice(o.id)}
                className={cx(
                  "flex w-full cursor-pointer items-start gap-3 rounded-lg border bg-white p-4 text-left transition-colors",
                  choice === o.id ? "border-blue-600 ring-2 ring-blue-600/15" : "border-gray-200 hover:border-gray-300",
                )}
              >
                <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold", choice === o.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700")}>
                  {LETTERS[i]}
                </span>
                <span className="text-sm leading-6 text-gray-900">{o.text}</span>
              </button>
            ))}
          </div>
        </section>

        {actionError && <Alert variant="error">{actionError}</Alert>}
        <div>
          <Button size="lg" className="w-full" disabled={!choice} isLoading={busy} onClick={confirmChoice} id="btn-confirm-choice">
            {choice ? `Xác nhận phương án ${LETTERS[idx]} & xem diễn biến tiếp theo` : "Chọn một phương án để tiếp tục"}
            {choice && <IconArrowRight size={16} />}
          </Button>
          <p className="mt-2 text-xs text-gray-500">Quyết định mang tính cam kết và chuyển ngay sang diễn biến tiếp theo.</p>
        </div>
      </div>
    );
  }

  // ── Intro + history (05.1 / 05.9) ──────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "Tình huống học tập" }]} />
        <h1 className="text-2xl font-semibold text-gray-900">{summary.title}</h1>
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="teal"><IconBranch size={12} /> Branching Study</Badge>
        </div>
        <h2 className="text-base font-semibold text-gray-900">Mô tả bối cảnh tình huống</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{summary.description || "Giảng viên chưa thêm mô tả cho tình huống này."}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <span className="text-xs text-gray-500">Đã thực hiện: {history.length} lần</span>
          <div className="flex gap-2">
            {open ? (
              <Button onClick={() => enter("resume")} isLoading={busy} id="btn-resume">Tiếp tục làm dở</Button>
            ) : completedCount > 0 ? (
              <Button leftIcon={<IconRetry size={15} />} onClick={() => setConfirmNew(true)} disabled={busy} id="btn-retry">Làm lại</Button>
            ) : (
              <Button onClick={() => enter("new")} isLoading={busy} id="btn-start">Bắt đầu tình huống <IconArrowRight size={16} /></Button>
            )}
          </div>
        </div>
        {actionError && <Alert variant="error" className="mt-4">{actionError}</Alert>}
      </Card>

      {history.length > 0 && (
        <Card padding={false}>
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Lịch sử các lần làm bài của bạn ({history.length})</h2>
            <span className="text-xs text-gray-500">Không xếp hạng điểm số</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {[...history].sort((a, b) => a.attemptNumber - b.attemptNumber).map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="flex items-center gap-2 text-sm text-gray-900">
                    Lần làm #{h.attemptNumber}
                    {h.isCompleted ? <Badge variant="neutral" dot>{h.reflectionStatus === "SUBMITTED" ? "Đã suy ngẫm" : "Đã hoàn thành"}</Badge> : <Badge variant="warning">Đang thực hiện</Badge>}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Bắt đầu: {formatDate(h.startedAt, true)}
                    {h.completedAt && ` • Hoàn tất: ${formatDate(h.completedAt, true)}`}
                  </p>
                </div>
                {h.isCompleted ? (
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/student/cases/${caseId}/attempt/${h.id}/review`)}>Xem Journey Review</Button>
                ) : (
                  <Button size="sm" onClick={() => enter("resume")} isLoading={busy}>Tiếp tục làm dở</Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmNew}
        tone="primary"
        title="Bắt đầu lượt làm mới?"
        description={`Lượt mới (#${history.length + 1}) là một hành trình độc lập. Toàn bộ lịch sử các lượt trước được giữ nguyên.`}
        confirmLabel="Bắt đầu lượt mới"
        isLoading={busy}
        onConfirm={() => enter("new")}
        onClose={() => setConfirmNew(false)}
      />
    </div>
  );
}
