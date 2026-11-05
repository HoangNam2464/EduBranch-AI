import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  CaseStatusBadge,
  ConfirmDialog,
  ErrorState,
  ForbiddenState,
  Modal,
  Skeleton,
  Textarea,
  cx,
  formatDate,
  IconArrowLeft,
  IconCheck,
  IconBranch,
  IconAlert,
} from "../../components/ui";
import { TreeGraph } from "../../components/lecturer/TreeGraph";
import { lecturerApi, apiErrorMessage, CaseDetail, NodeRow, CaseStatusValue } from "../../services/lecturerApi";

/**
 * Trình chỉnh sửa Case Study — Figma 03.4 (`135:4055`), lifecycle bar 03.6 (`135:4274`),
 * publish dialog 03.7 (`135:4331`).
 * Backend contract: PUT /cases/:id updates node situations and option text/consequence only
 * (no add/remove/re-link — FE-010 graph mutation has no API yet), and refuses edits while
 * APPROVED/PUBLISHED. Not rendered: "Quyết định then chốt" toggle (no is_pivotal field; OPD-002 open).
 */
const STEPS: Array<{ status: CaseStatusValue; label: string }> = [
  { status: "DRAFT", label: "Bản nháp" },
  { status: "REVIEWED", label: "Đã rà soát" },
  { status: "APPROVED", label: "Đã phê duyệt" },
  { status: "PUBLISHED", label: "Đã xuất bản" },
];

type Issue = { nodeId?: string; text: string };

/** FND §5 integrity checks on the current tree: reachability, cycles, dead ends, missing consequences. */
function checkTree(nodes: NodeRow[], rootId?: string | null): Issue[] {
  const issues: Issue[] = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const start = rootId && byId.has(rootId) ? rootId : nodes[0]?.id;
  if (!start) return [{ text: "Case chưa có tình huống nào." }];
  const seen = new Set<string>();
  const stack = new Set<string>();
  let cycle = false;
  const dfs = (id: string) => {
    if (stack.has(id)) { cycle = true; return; }
    if (seen.has(id)) return;
    seen.add(id); stack.add(id);
    for (const o of byId.get(id)?.options ?? []) if (o.next_node_id && byId.has(o.next_node_id)) dfs(o.next_node_id);
    stack.delete(id);
  };
  dfs(start);
  if (cycle) issues.push({ text: "Cây có chu trình: một phương án dẫn ngược về tình huống trước đó." });
  for (const n of nodes) {
    if (!seen.has(n.id)) issues.push({ nodeId: n.id, text: "Tình huống không thể đi tới từ tình huống mở đầu." });
    if (!n.situation.trim()) issues.push({ nodeId: n.id, text: "Nội dung tình huống đang trống." });
    n.options.forEach((o, i) => {
      if (!o.option_text.trim()) issues.push({ nodeId: n.id, text: `Phương án ${i + 1} chưa có nội dung.` });
      if (!o.consequence.trim()) issues.push({ nodeId: n.id, text: `Phương án ${i + 1} chưa có hệ quả.` });
      if (o.next_node_id && !byId.has(o.next_node_id)) issues.push({ nodeId: n.id, text: `Phương án ${i + 1} trỏ tới tình huống không tồn tại.` });
    });
  }
  if (!nodes.some((n) => n.is_terminal || n.options.length === 0 || n.options.some((o) => !o.next_node_id))) {
    issues.push({ text: "Cây chưa có kết cục (nút kết thúc)." });
  }
  return issues;
}

export function CaseReviewPage() {
  const { caseId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CaseDetail | null>(null);
  const [draft, setDraft] = useState<NodeRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ status?: number; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ variant: "success" | "error" | "info"; text: string } | null>(null);
  const [panel, setPanel] = useState<"outline" | "check">("outline");
  const [graphOpen, setGraphOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [courseName, setCourseName] = useState<string>("");

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const d = await lecturerApi.getCase(caseId);
      setData(d);
      setDraft(d.nodes.map((n) => ({ ...n, options: n.options.map((o) => ({ ...o })) })));
      setSelected((s) => s ?? d.root_node_id ?? d.nodes[0]?.id ?? null);
      lecturerApi.getCourse(d.course_id).then((c) => setCourseName(c.name)).catch(() => {});
    } catch (err: any) {
      setLoadError({ status: err?.response?.status, message: apiErrorMessage(err, "Không tải được Case Study.") });
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    let s = 0, k = 0;
    for (const n of [...draft].sort((a, b) => a.node_index - b.node_index)) {
      const terminal = n.is_terminal || n.options.length === 0;
      out[n.id] = terminal ? `Kết cục ${++k}` : `Tình huống ${++s}`;
    }
    return out;
  }, [draft]);

  const issues = useMemo(() => checkTree(draft, data?.root_node_id), [draft, data?.root_node_id]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(data?.nodes ?? []), [draft, data]);

  if (loadError?.status === 403) return <Card padding={false}><ForbiddenState /></Card>;
  if (loadError) return <Card padding={false}><ErrorState description={loadError.message} onRetry={load} /></Card>;
  if (!data) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-5 md:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_280px]"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
      </div>
    );
  }

  const editable = data.status === "DRAFT" || data.status === "REVIEWED";
  const node = draft.find((n) => n.id === selected) ?? null;
  const stepIndex = STEPS.findIndex((s) => s.status === data.status);

  const patchNode = (id: string, fn: (n: NodeRow) => NodeRow) => setDraft((d) => d.map((n) => (n.id === id ? fn(n) : n)));

  const save = async (): Promise<boolean> => {
    if (!dirty) return true;
    setBusy(true);
    setNotice(null);
    try {
      const updated = await lecturerApi.updateCase(data.id, {
        nodes: draft.map((n) => ({ id: n.id, situation: n.situation, options: n.options.map((o) => ({ id: o.id, text: o.option_text, consequence: o.consequence })) })),
      });
      setData(updated);
      setDraft(updated.nodes.map((n) => ({ ...n, options: n.options.map((o) => ({ ...o })) })));
      setNotice({ variant: "success", text: "Đã lưu thay đổi." });
      return true;
    } catch (err) {
      setNotice({ variant: "error", text: apiErrorMessage(err, "Không lưu được thay đổi.") });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const transition = async (to: CaseStatusValue, msg: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await lecturerApi.setCaseStatus(data.id, to);
      await load();
      setNotice({ variant: "success", text: msg });
    } catch (err) {
      setNotice({ variant: "error", text: apiErrorMessage(err, "Không chuyển được trạng thái.") });
    } finally {
      setBusy(false);
      setPublishOpen(false);
    }
  };

  const markReviewed = async () => {
    if (issues.length > 0) {
      setPanel("check");
      setNotice({ variant: "error", text: `Cây còn ${issues.length} vấn đề cần xử lý trước khi đánh dấu đã rà soát.` });
      return;
    }
    if (await save()) await transition("REVIEWED", "Đã lưu và đánh dấu đã rà soát.");
  };

  return (
    <div className="-mx-2">
      {/* Header + actions */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button type="button" onClick={() => navigate(-1)} className="mt-1 cursor-pointer rounded-md p-1 text-gray-600 hover:bg-gray-100" aria-label="Quay lại">
            <IconArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-7 text-gray-900">{data.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <CaseStatusBadge status={data.status} />
              {courseName && <span>Khóa: {courseName}</span>}
              <span>• Phiên bản: v{data.version ?? 1}</span>
              <span>• Cập nhật {formatDate(data.updated_at, true)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editable && dirty && <Button variant="secondary" onClick={save} isLoading={busy}>Lưu nháp</Button>}
          {data.status === "DRAFT" && <Button onClick={markReviewed} isLoading={busy} id="btn-mark-reviewed">Lưu & đánh dấu đã rà soát</Button>}
          {data.status === "REVIEWED" && (
            <>
              <Button variant="secondary" onClick={() => transition("DRAFT", "Đã trả Case về bản nháp.")} disabled={busy}>Trả về bản nháp</Button>
              <Button onClick={async () => { if (await save()) transition("APPROVED", "Đã phê duyệt Case."); }} isLoading={busy} disabled={issues.length > 0} id="btn-approve">Phê duyệt</Button>
            </>
          )}
          {data.status === "APPROVED" && (
            <>
              <Button variant="secondary" onClick={() => transition("DRAFT", "Đã trả Case về bản nháp.")} disabled={busy}>Trả về bản nháp</Button>
              <Button onClick={() => setPublishOpen(true)} disabled={busy} id="btn-publish">Xuất bản</Button>
            </>
          )}
          {data.status === "PUBLISHED" && (
            <Button variant="secondary" onClick={() => transition("DRAFT", "Đã gỡ xuất bản, Case trở về bản nháp.")} isLoading={busy}>Gỡ xuất bản để chỉnh sửa</Button>
          )}
        </div>
      </div>

      {/* Lifecycle stepper (03.6) */}
      <ol className="mb-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4" aria-label="Vòng đời Case Study">
        {STEPS.map((s, i) => (
          <li key={s.status} className="flex flex-1 items-center gap-3 last:flex-none">
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                i < stepIndex && "border-blue-600 bg-blue-600 text-white",
                i === stepIndex && "border-blue-600 bg-white text-blue-700 ring-4 ring-blue-50",
                i > stepIndex && "border-gray-300 bg-white text-gray-500",
              )}
              aria-current={i === stepIndex ? "step" : undefined}
            >
              {i < stepIndex ? <IconCheck size={14} /> : i + 1}
            </span>
            <span className={cx("whitespace-nowrap text-sm", i === stepIndex ? "font-semibold text-gray-900" : "text-gray-500")}>{s.label}</span>
            {i < STEPS.length - 1 && <span className={cx("h-px flex-1", i < stepIndex ? "bg-blue-600" : "bg-gray-200")} aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {notice && <Alert variant={notice.variant} className="mb-4">{notice.text}</Alert>}
      {!editable && (
        <Alert variant="info" className="mb-4">
          Case ở trạng thái {data.status === "PUBLISHED" ? "đã xuất bản" : "đã phê duyệt"} nên không thể chỉnh sửa. Trả về bản nháp nếu cần thay đổi nội dung.
        </Alert>
      )}

      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* Node list */}
        <nav aria-label="Danh sách tình huống" className="space-y-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Danh sách tình huống ({draft.length})</p>
          {[...draft].sort((a, b) => a.node_index - b.node_index).map((n) => {
            const terminal = n.is_terminal || n.options.length === 0;
            const nodeIssues = issues.filter((x) => x.nodeId === n.id).length;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n.id)}
                className={cx(
                  "w-full cursor-pointer rounded-lg border bg-white p-3 text-left transition-colors",
                  selected === n.id ? "border-blue-600 ring-2 ring-blue-600/15" : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <Badge variant={terminal ? "neutral" : "info"}>{labels[n.id]}</Badge>
                  {nodeIssues > 0 && <span className="text-red-600" title={`${nodeIssues} vấn đề`}><IconAlert size={14} /></span>}
                </div>
                <p className="line-clamp-3 text-xs leading-5 text-gray-700">{n.situation}</p>
                {!terminal && <p className="mt-1 text-[11px] text-gray-500">{n.options.length} phương án rẽ nhánh</p>}
              </button>
            );
          })}
        </nav>

        {/* Node editor */}
        <Card className="min-w-0">
          {node ? (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant={node.is_terminal || node.options.length === 0 ? "neutral" : "info"}>{labels[node.id]}</Badge>
                {node.id === data.root_node_id && <Badge variant="teal">Mở đầu</Badge>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="node-situation" className="block text-sm font-medium text-gray-900">
                  Nội dung tình huống <span className="text-red-600">*</span>
                </label>
                <Textarea
                  id="node-situation"
                  rows={6}
                  value={node.situation}
                  disabled={!editable}
                  onChange={(e) => patchNode(node.id, (n) => ({ ...n, situation: e.target.value }))}
                />
              </div>
              {node.options.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Các phương án lựa chọn ({node.options.length})</h2>
                  <p className="mb-3 text-xs text-gray-500">Mỗi phương án dẫn tới một tình huống tiếp theo và chứa hệ quả tương ứng.</p>
                  <div className="space-y-4">
                    {node.options.map((o, i) => (
                      <div key={o.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-3 text-sm font-medium text-blue-700">Phương án {i + 1}</p>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label htmlFor={`opt-${o.id}`} className="block text-sm font-medium text-gray-900">Nội dung lựa chọn <span className="text-red-600">*</span></label>
                            <Textarea id={`opt-${o.id}`} rows={2} value={o.option_text} disabled={!editable}
                              onChange={(e) => patchNode(node.id, (n) => ({ ...n, options: n.options.map((x) => (x.id === o.id ? { ...x, option_text: e.target.value } : x)) }))} />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">Tình huống tiếp theo: </span>
                            {o.next_node_id ? (
                              <button type="button" className="cursor-pointer text-blue-600 hover:underline" onClick={() => setSelected(o.next_node_id)}>
                                {labels[o.next_node_id] ?? "—"}
                              </button>
                            ) : (
                              <span className="text-gray-600">Kết thúc hành trình</span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor={`cons-${o.id}`} className="block text-sm font-medium text-amber-800">Hệ quả (do giảng viên xác định) <span className="text-red-600">*</span></label>
                            <Textarea id={`cons-${o.id}`} rows={3} value={o.consequence} disabled={!editable} className="border-l-4 border-l-teal-700"
                              onChange={(e) => patchNode(node.id, (n) => ({ ...n, options: n.options.map((x) => (x.id === o.id ? { ...x, consequence: e.target.value } : x)) }))} />
                            <p className="text-xs text-gray-500">Chỉ hiển thị cho sinh viên trong Journey Review, không hiển thị khi đang làm bài.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {node.options.length === 0 && <Alert variant="info">Đây là kết cục của hành trình. Sinh viên đọc nội dung này ở Journey Review.</Alert>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chọn một tình huống để chỉnh sửa.</p>
          )}
        </Card>

        {/* Outline / checks */}
        <aside className="space-y-3 md:col-span-2 xl:col-span-1">
          <div className="flex gap-2">
            <Button size="sm" variant={panel === "outline" ? "primary" : "secondary"} onClick={() => setPanel("outline")}>Sơ đồ cây</Button>
            <Button size="sm" variant={panel === "check" ? "primary" : "secondary"} onClick={() => setPanel("check")}>Kiểm tra cây ({issues.length})</Button>
          </div>
          {panel === "outline" ? (
            <>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Topology: {draft.length} nút</span>
                <button type="button" onClick={() => setGraphOpen(true)} className="flex cursor-pointer items-center gap-1 text-blue-600 hover:underline">
                  <IconBranch size={13} /> Xem đồ thị
                </button>
              </div>
              {[...draft].sort((a, b) => a.node_index - b.node_index).map((n) => (
                <button key={n.id} type="button" onClick={() => setSelected(n.id)}
                  className={cx("w-full cursor-pointer rounded-lg border bg-white p-3 text-left text-xs", selected === n.id ? "border-blue-600" : "border-gray-200 hover:border-gray-300")}>
                  <p className="font-medium text-gray-900">{labels[n.id]}</p>
                  <ul className="mt-1.5 space-y-1 text-gray-600">
                    {n.options.map((o) => (
                      <li key={o.id} className="truncate">{o.option_text.slice(0, 40)}{o.option_text.length > 40 ? "…" : ""} → {o.next_node_id ? labels[o.next_node_id] : "Kết thúc"}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </>
          ) : issues.length === 0 ? (
            <Alert variant="success">Cây hợp lệ: không có chu trình, không có nút mồ côi, mọi phương án đều có hệ quả.</Alert>
          ) : (
            <ul className="space-y-2" aria-label="Vấn đề của cây">
              {issues.map((x, i) => (
                <li key={i}>
                  <button type="button" disabled={!x.nodeId} onClick={() => x.nodeId && setSelected(x.nodeId)}
                    className="w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs text-gray-800 disabled:cursor-default">
                    {x.nodeId && <span className="font-medium text-gray-900">{labels[x.nodeId]}: </span>}{x.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <Modal isOpen={graphOpen} onClose={() => setGraphOpen(false)} title="Sơ đồ cây quyết định" size="lg" footer={<Button variant="secondary" onClick={() => setGraphOpen(false)}>Đóng</Button>}>
        <TreeGraph nodes={draft} rootId={data.root_node_id} labels={labels} selectedId={selected} onSelect={(id) => { setSelected(id); setGraphOpen(false); }} />
      </Modal>

      <ConfirmDialog
        isOpen={publishOpen}
        tone="primary"
        title="Xuất bản Case Study?"
        description="Sau khi xuất bản, sinh viên có đường dẫn sẽ làm được Case này. Muốn sửa nội dung, bạn cần gỡ xuất bản và trả về bản nháp."
        confirmLabel="Xuất bản"
        isLoading={busy}
        onConfirm={() => transition("PUBLISHED", "Đã xuất bản Case. Sao chép đường dẫn bên dưới để gửi sinh viên.")}
        onClose={() => setPublishOpen(false)}
      />

      {data.status === "PUBLISHED" && <StudentLinkBox caseId={data.id} />}
    </div>
  );
}

/** Shares the existing student direct-link route. Not an approved access model (PO-25, OPD-001 open). */
function StudentLinkBox({ caseId }: { caseId: string }) {
  const url = `${window.location.origin}/student/cases/${caseId}/branching-play`;
  const [copied, setCopied] = useState(false);
  return (
    <Card className="mt-5">
      <p className="text-sm font-medium text-gray-900">Đường dẫn cho sinh viên</p>
      <p className="mt-1 text-xs text-gray-500">Cơ chế truy cập bằng đường dẫn đang có trong hệ thống; cách sinh viên tìm khóa học và case vẫn chờ quyết định (OPD-001).</p>
      <div className="mt-3 flex gap-2">
        <code className="flex-1 truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800">{url}</code>
        <Button variant="secondary" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ } }}>
          {copied ? "Đã sao chép" : "Sao chép"}
        </Button>
      </div>
    </Card>
  );
}
