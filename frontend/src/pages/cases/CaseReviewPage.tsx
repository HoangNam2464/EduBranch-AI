/**
 * CaseReviewPage — Giảng viên · Trình chỉnh sửa Case Study
 * Figma page 08 (section 03):
 *  - 03.4 Branching Study editor: left column (Tình huống · Nội dung tình huống chi tiết ·
 *    Các phương án lựa chọn), right column 478 (Cây quyết định · Kiểm tra cây · Đoạn nguồn được trích),
 *    columns 20 apart, then the action bar (03.6) and the publish dialog (03.7).
 *  - 03.5 Review Study editor: Nội dung Review Study · Bối cảnh & số liệu · Vấn đề cần phân tích |
 *    Thông tin case · Sinh viên sẽ nộp · Đoạn nguồn được trích.
 * The case title is shown in the shell header (useShellTitle).
 * Route: /lecturer/cases/:caseId/review
 *
 * Data: GET /cases/:id (lecturer projection with nodes + options). PUT /cases/:id persists only the
 * case title/description, each node's `situation` and each option's text + consequence, and only the
 * fields that changed are sent. Fields the backend cannot store keep their Figma slot, read-only, with
 * a hint (tooltip + aria-describedby). Nothing is simulated.
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { ChevronDown, ChevronRight, CircleAlert, CircleCheck, GitFork, Link2, Plus, Trash2 } from "lucide-react";
import { caseService, type UpdateCaseRequest } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import type { CaseDetail, CaseNode, CaseOption, CaseStatus } from "@/types";
import { CaseGovernanceBar, type PublishSummary, type RequestError } from "@/components/cases/CaseGovernanceBar";
import { Button, Toast, ToastRegion, cx, FOCUS_RING, type ToastType } from "@/components/ds";
import { ErrorState, SkeletonBlock, SkeletonLine, SkeletonRegion } from "@/components/feedback";
import { PATHS, buildPath } from "@/routes/paths";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { analyzeTree } from "@/pages/cases/caseTree";
import { isEditable } from "@/pages/cases/caseUi";
import {
  CAPTION,
  CARD_TITLE,
  DecisionTreeCanvas,
  EDITOR_BOX,
  EditorCard,
  FIELD_BOX,
  FIELD_LABEL,
  Row,
  RowList,
  orderNodes,
} from "@/pages/cases/CaseReviewParts";

/** VARCHAR(500) of cases.title. */
const TITLE_MAX = 500;

type LoadState = { status: "loading" } | { status: "error"; code?: number | string; at: Date } | { status: "ready" };

interface ToastState {
  type: ToastType;
  title: string;
  message?: ReactNode;
}

type InvalidField = { kind: "titleRequired" } | { kind: "situationRequired"; nodeId: string } | { kind: "optionRequired"; nodeId: string; optionId: string };

function httpStatus(error: unknown): number | string | undefined {
  if (isAxiosError(error)) return error.response?.status ?? error.code;
  return undefined;
}

/** Message the backend put in the error body (Nest: { message }), if any. */
function backendMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const message = (error.response?.data as { message?: unknown } | undefined)?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message) && message.length > 0) return message.join(", ");
  return undefined;
}

/** HTTP status → translated summary key; the backend text is kept only as secondary detail. */
function errorKind(error: unknown): "invalid" | "forbidden" | "notFound" | "conflict" | "network" | "generic" {
  if (!isAxiosError(error)) return "generic";
  if (!error.response) return "network";
  switch (error.response.status) {
    case 400:
      return "invalid";
    case 403:
      return "forbidden";
    case 404:
      return "notFound";
    case 409:
      return "conflict";
    default:
      return "generic";
  }
}

/**
 * Body of PUT /cases/:id with only what changed between the saved case and the draft,
 * or null when nothing changed. Options are sent whole (the backend writes text and consequence together).
 */
function buildUpdate(saved: CaseDetail, draft: CaseDetail): UpdateCaseRequest | null {
  const body: UpdateCaseRequest = {};
  if (draft.title !== saved.title) body.title = draft.title;
  if ((draft.description ?? "") !== (saved.description ?? "")) body.description = draft.description ?? "";
  const savedNodes = new Map(saved.nodes.map((n) => [n.id, n]));
  const nodes: NonNullable<UpdateCaseRequest["nodes"]> = [];
  for (const node of draft.nodes) {
    const before = savedNodes.get(node.id);
    if (!before) continue;
    const savedOptions = new Map(before.options.map((o) => [o.id, o]));
    const options = node.options
      .filter((o) => {
        const prev = savedOptions.get(o.id);
        return prev && (prev.text !== o.text || prev.consequence !== o.consequence);
      })
      .map((o) => ({ id: o.id, option_text: o.text, consequence: o.consequence }));
    const situationChanged = node.situation !== before.situation;
    if (situationChanged || options.length > 0) {
      nodes.push({ id: node.id, ...(situationChanged ? { situation: node.situation } : {}), ...(options.length > 0 ? { options } : {}) });
    }
  }
  if (nodes.length > 0) body.nodes = nodes;
  return Object.keys(body).length > 0 ? body : null;
}

/** First field PUT /cases/:id would otherwise skip or null out. */
function findInvalid(c: CaseDetail, order: CaseNode[]): InvalidField | null {
  if (!c.title.trim()) return { kind: "titleRequired" };
  if (c.learningMode !== "BRANCHING_STUDY") return null;
  for (const n of order) {
    if (!n.situation.trim()) return { kind: "situationRequired", nodeId: n.id };
    const bad = n.options.find((o) => !o.text.trim() || !o.consequence.trim());
    if (bad) return { kind: "optionRequired", nodeId: n.id, optionId: bad.id };
  }
  return null;
}

export function CaseReviewPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { t } = useTranslation();
  if (!caseId) {
    return <ErrorState title={t("caseReview.load.notFoundTitle")} description={t("caseReview.load.notFoundDescription")} errorCode={404} />;
  }
  // The route element stays mounted when :caseId changes; a new key drops every state of the previous case.
  return <CaseEditor key={caseId} caseId={caseId} />;
}

function CaseEditor({ caseId }: { caseId: string }) {
  const { t } = useTranslation();
  const uid = useId();

  const [reloadTick, setReloadTick] = useState(0);
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  /** Last state confirmed by the backend. */
  const [saved, setSaved] = useState<CaseDetail | null>(null);
  /** Editor copy of `saved`. */
  const [draft, setDraft] = useState<CaseDetail | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [course, setCourse] = useState<{ id: string; name: string; code?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useShellTitle(saved?.title ?? null);

  // ── Load the case (GET /cases/:id) ──
  useEffect(() => {
    let alive = true;
    caseService.getCaseById(caseId).then(
      (detail) => {
        if (!alive) return;
        const first = orderNodes(detail.nodes, detail.rootNodeId)[0];
        setSaved(detail);
        setDraft(detail);
        setSelectedNodeId(first?.id ?? null);
        setExpandedOptionId(first?.options[0]?.id ?? null);
        setLoad({ status: "ready" });
      },
      (error: unknown) => alive && setLoad({ status: "error", code: httpStatus(error), at: new Date() }),
    );
    return () => {
      alive = false;
    };
  }, [caseId, reloadTick]);

  // Course name / code for 03.5 info card and the 03.7 dialog ("—" / omitted when it cannot be read).
  const courseId = saved?.courseId;
  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    courseService.getCourseById(courseId).then(
      (c) => alive && setCourse({ id: c.id, name: c.name, code: c.courseCode }),
      () => alive && setCourse(null),
    );
    return () => {
      alive = false;
    };
  }, [courseId]);

  // Success toasts close by themselves; error toasts stay until closed.
  useEffect(() => {
    if (toast?.type !== "success") return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const describeError = useCallback(
    (error: unknown): RequestError => ({ summary: t(`caseReview.errors.${errorKind(error)}`), detail: backendMessage(error) }),
    [t],
  );
  const showError = useCallback((title: string, error: RequestError) => setToast({ type: "error", title, message: <ErrorMessage error={error} /> }), []);

  if (load.status === "loading") return <EditorSkeleton label={t("caseReview.load.loading")} />;

  if (load.status === "error" || !draft || !saved) {
    const code = load.status === "error" ? load.code : undefined;
    const kind = code === 404 ? "notFound" : code === 403 ? "forbidden" : "error";
    return (
      <ErrorState
        title={t(`caseReview.load.${kind}Title`)}
        description={t(`caseReview.load.${kind}Description`)}
        onRetry={
          kind === "error"
            ? () => {
                setLoad({ status: "loading" });
                setReloadTick((n) => n + 1);
              }
            : undefined
        }
        errorCode={code}
        occurredAt={load.status === "error" ? load.at : undefined}
      />
    );
  }

  // ── Ready ──
  const status = saved.status;
  const editable = isEditable(status);
  const fieldsDisabled = !editable || pending;
  const update = buildUpdate(saved, draft);
  const dirty = update !== null;

  const order = orderNodes(draft.nodes, draft.rootNodeId);
  const tree = analyzeTree(draft.nodes, draft.rootNodeId);
  const pointNo = new Map<string, number>();
  const outcomeNo = new Map<string, number>();
  for (const n of order) {
    const map = n.isTerminal ? outcomeNo : pointNo;
    map.set(n.id, map.size + 1);
  }
  const nodeById = new Map(draft.nodes.map((n) => [n.id, n]));
  const nodeTag = (n: CaseNode) =>
    n.isTerminal ? t("caseReview.branching.nodeOutcome", { n: outcomeNo.get(n.id) }) : t("caseReview.branching.nodeSituation", { n: pointNo.get(n.id) });
  const selectedNode = (selectedNodeId && nodeById.get(selectedNodeId)) || order[0];
  const optionLetter = (i: number) => String.fromCharCode(65 + i);
  const allConsequences = draft.nodes.every((n) => n.options.every((o) => o.consequence.trim()));

  async function saveContent(): Promise<boolean> {
    if (!draft || !saved) return false;
    const invalid = findInvalid(draft, order);
    if (invalid) {
      const node = invalid.kind === "titleRequired" ? undefined : nodeById.get(invalid.nodeId);
      if (node) {
        setSelectedNodeId(node.id);
        setExpandedOptionId(invalid.kind === "optionRequired" ? invalid.optionId : (node.options[0]?.id ?? null));
      }
      setToast({
        type: "error",
        title: t("caseReview.validation.title"),
        message: t(`caseReview.validation.${invalid.kind}`, { node: node ? nodeTag(node) : "" }),
      });
      return false;
    }
    const body = buildUpdate(saved, draft);
    if (!body) return true;
    setPending(true);
    try {
      const updated = await caseService.updateCase(caseId, body);
      if (!mounted.current) return false;
      setSaved(updated);
      setDraft(updated);
      setToast({ type: "success", title: t("caseReview.toast.savedTitle") });
      return true;
    } catch (error) {
      if (mounted.current) showError(t("caseReview.toast.saveFailedTitle"), describeError(error));
      return false;
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  /** PATCH /cases/:id/status — the UI follows the response only. Resolves null on success. */
  async function requestStatus(target: CaseStatus): Promise<RequestError | null> {
    setPending(true);
    try {
      const result = await caseService.updateCaseStatus(caseId, target);
      if (!mounted.current) return null;
      setSaved((prev) => (prev ? { ...prev, status: result.status } : prev));
      setDraft((prev) => (prev ? { ...prev, status: result.status } : prev));
      setToast({
        type: "success",
        title: t("caseReview.toast.statusChangedTitle"),
        message: t("caseReview.toast.statusChangedMessage", { status: t(`caseReview.status.${result.status}`) }),
      });
      return null;
    } catch (error) {
      return describeError(error);
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  async function changeStatus(target: CaseStatus) {
    const error = await requestStatus(target);
    if (error && mounted.current) showError(t("caseReview.toast.statusFailedTitle"), error);
  }

  async function handleSaveReviewed() {
    if (dirty && !(await saveContent())) return;
    await changeStatus("REVIEWED");
  }

  function handleCopyLink() {
    const link = `${window.location.origin}${buildPath(
      saved!.learningMode === "REVIEW_STUDY" ? PATHS.STUDENT.REVIEW_STUDY : PATHS.STUDENT.BRANCHING_PLAY,
      { caseId: saved!.id },
    )}`;
    const failed = () => setToast({ type: "error", title: t("caseReview.bar.copyFailed"), message: link });
    if (!navigator.clipboard) return failed();
    navigator.clipboard.writeText(link).then(() => mounted.current && setToast({ type: "success", title: t("caseReview.bar.copied") }), () => mounted.current && failed());
  }

  function updateDraft(change: (c: CaseDetail) => CaseDetail) {
    setDraft((prev) => (prev ? change(prev) : prev));
  }
  function updateNode(nodeId: string, change: (n: CaseNode) => CaseNode) {
    updateDraft((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === nodeId ? change(n) : n)) }));
  }
  function updateOption(nodeId: string, optionId: string, field: "text" | "consequence", value: string) {
    updateNode(nodeId, (n) => ({ ...n, options: n.options.map((o) => (o.id === optionId ? { ...o, [field]: value } : o)) }));
  }
  function selectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
    setExpandedOptionId(nodeById.get(nodeId)?.options[0]?.id ?? null);
  }

  const unsupportedId = `${uid}-unsupported`;
  const unsupported = t("caseReview.unsupportedHint");
  const modeLabel = t(`caseReview.mode.${saved.learningMode}`);
  const courseLabel = course && course.id === saved.courseId ? (course.code ?? course.name) : undefined;

  const publish: PublishSummary =
    saved.learningMode === "BRANCHING_STUDY"
      ? {
          title: saved.title,
          meta: [courseLabel, modeLabel, t("caseReview.publishModal.points", { count: tree.situations }), t("caseReview.publishModal.outcomes", { count: tree.outcomes })]
            .filter(Boolean)
            .join(" · "),
          course: courseLabel,
          checks: [
            { label: t("caseReview.publishModal.checkTree"), ok: tree.nodeCount > 0 && tree.issues.length === 0 },
            { label: t("caseReview.publishModal.checkConsequences"), ok: allConsequences },
            { label: t("caseReview.publishModal.checkApproved"), ok: status === "APPROVED" },
          ],
        }
      : {
          title: saved.title,
          meta: [courseLabel, modeLabel].filter(Boolean).join(" · "),
          course: courseLabel,
          checks: [
            { label: t("caseReview.publishModal.checkContext"), ok: !!saved.contextText?.trim() },
            { label: t("caseReview.publishModal.checkProblem"), ok: !!saved.problemText?.trim() },
            { label: t("caseReview.publishModal.checkApproved"), ok: status === "APPROVED" },
          ],
        };

  return (
    <div className="flex flex-col gap-5">
      <span id={unsupportedId} className="sr-only">
        {unsupported}
      </span>

      {toast && (
        <ToastRegion>
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} closeLabel={t("caseReview.toast.close")} />
        </ToastRegion>
      )}

      {!editable && (
        <p role="note" className="rounded-eb-lg bg-surface px-5 py-3 text-[14px] leading-5 text-ink-secondary">
          {t("caseReview.readOnlyNotice")}
        </p>
      )}

      <div className="flex items-start gap-5">
        {saved.learningMode === "BRANCHING_STUDY" ? (
          <>
            {/* ══ 03.4 left column ══ */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              {!selectedNode ? (
                <EditorCard>
                  <p className={CAPTION}>{t("caseReview.branching.noNodes")}</p>
                </EditorCard>
              ) : (
                <>
                  <SituationCard node={selectedNode} tag={nodeTag(selectedNode)} unsupportedId={unsupportedId} unsupported={unsupported} uid={uid} />

                  <EditorCard className="gap-[23px]">
                    <label htmlFor={`${uid}-situation`} className={CARD_TITLE}>
                      {selectedNode.isTerminal ? t("caseReview.branching.outcomeContent") : t("caseReview.branching.situationContent")} *
                    </label>
                    <textarea
                      id={`${uid}-situation`}
                      value={selectedNode.situation}
                      disabled={fieldsDisabled}
                      aria-required="true"
                      aria-invalid={!selectedNode.situation.trim() || undefined}
                      onChange={(e) => updateNode(selectedNode.id, (n) => ({ ...n, situation: e.target.value }))}
                      className={EDITOR_BOX}
                    />
                  </EditorCard>

                  <EditorCard className="gap-6" labelledBy={`${uid}-options`}>
                    <h2 id={`${uid}-options`} className={CARD_TITLE}>
                      {t("caseReview.branching.optionsTitle", { count: selectedNode.options.length })}
                    </h2>
                    <div className="flex flex-col gap-5">
                      <p className={CAPTION}>
                        {selectedNode.isTerminal ? t("caseReview.branching.noOptions") : t("caseReview.branching.optionsHelp")}
                      </p>
                      {selectedNode.options.map((option, index) =>
                        option.id === expandedOptionId ? (
                          <OptionEditor
                            key={option.id}
                            uid={uid}
                            index={index}
                            option={option}
                            target={option.nextNodeId ? nodeById.get(option.nextNodeId) : undefined}
                            targetTag={nodeTag}
                            disabled={fieldsDisabled}
                            unsupportedId={unsupportedId}
                            unsupported={unsupported}
                            onChange={(field, value) => updateOption(selectedNode.id, option.id, field, value)}
                          />
                        ) : (
                          <OptionCollapsed
                            key={option.id}
                            label={t("caseReview.branching.optionSummary", {
                              n: index + 1,
                              text: option.text,
                              target: option.nextNodeId && nodeById.get(option.nextNodeId) ? nodeTag(nodeById.get(option.nextNodeId)!) : t("caseReview.branching.endsJourney"),
                            })}
                            expandLabel={t("caseReview.branching.expandOption", { n: index + 1 })}
                            deleteLabel={t("caseReview.branching.deleteOption")}
                            unsupportedId={unsupportedId}
                            unsupported={unsupported}
                            onExpand={() => setExpandedOptionId(option.id)}
                          />
                        ),
                      )}
                      {!selectedNode.isTerminal && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leadingIcon={Plus}
                          disabled
                          aria-describedby={unsupportedId}
                          title={unsupported}
                          className="self-start"
                        >
                          {t("caseReview.branching.addOption")}
                        </Button>
                      )}
                    </div>
                  </EditorCard>
                </>
              )}
            </div>

            {/* ══ 03.4 right column ══ */}
            <div className="flex w-[478px] shrink-0 flex-col gap-5">
              <EditorCard className="gap-[23px]" labelledBy={`${uid}-tree`}>
                <div className="flex items-center gap-2">
                  <h2 id={`${uid}-tree`} className={cx(CARD_TITLE, "min-w-0 flex-1")}>
                    {t("caseReview.branching.treeTitle")}
                  </h2>
                  <span className={CAPTION}>{t("caseReview.branching.nodeCount", { count: tree.nodeCount })}</span>
                </div>
                {tree.nodeCount > 0 && tree.issues.length === 0 ? (
                  <p className="flex items-center gap-1.5 text-[12px] leading-4 text-success">
                    <CircleCheck aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0" />
                    {t("caseReview.branching.treeValid")}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-[12px] leading-4 text-error-text">
                    <CircleAlert aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.2} className="shrink-0" />
                    {t("caseReview.branching.treeInvalid", { count: Math.max(1, tree.issues.length) })}
                  </p>
                )}
                {order.length > 0 && (
                  <DecisionTreeCanvas
                    order={order}
                    rootId={draft.rootNodeId}
                    depth={tree.depth}
                    selectedId={selectedNode?.id}
                    activeOptionId={expandedOptionId ?? undefined}
                    onSelect={selectNode}
                    badge={(n) =>
                      n.id === draft.rootNodeId
                        ? t("caseReview.branching.badgeStart")
                        : n.isTerminal
                          ? t("caseReview.branching.badgeOutcome")
                          : t("caseReview.branching.badgePoint", { n: pointNo.get(n.id) })
                    }
                    nodeLabel={(n) => t("caseReview.branching.nodeLabel", { label: nodeTag(n), text: n.situation })}
                    optionLetter={optionLetter}
                    ariaLabel={t("caseReview.branching.treeTitle")}
                  />
                )}
                <p className={CAPTION}>{t("caseReview.branching.treeHint")}</p>
              </EditorCard>

              <EditorCard className="gap-[23px]" labelledBy={`${uid}-check`}>
                <h2 id={`${uid}-check`} className={CARD_TITLE}>
                  {t("caseReview.branching.treeCheck")}
                </h2>
                <RowList>
                  <Row icon={<GitFork aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.333} className="shrink-0 text-link" />}>
                    <span className="text-ink-secondary">{t("caseReview.branching.topologyLabel")} </span>
                    <span className="text-ink">
                      {t("caseReview.branching.topology", { nodes: tree.nodeCount, situations: tree.situations, outcomes: tree.outcomes })}
                    </span>
                  </Row>
                  <Row
                    icon={
                      tree.issues.length === 0 ? (
                        <CircleCheck aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0 text-status-published-text" />
                      ) : (
                        <CircleAlert aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.333} className="shrink-0 text-error-text" />
                      )
                    }
                  >
                    <span className="text-ink-secondary">{t("caseReview.branching.checkLabel")} </span>
                    <span className="text-ink">{t("caseReview.branching.issueCount", { count: tree.issues.length })}</span>
                  </Row>
                  {tree.issues.map((issue) => (
                    <Row key={issue} className="pl-6 text-error-text">
                      {t(`caseReview.branching.issue.${issue}`)}
                    </Row>
                  ))}
                </RowList>
              </EditorCard>

              <SourcesCard uid={uid} />
            </div>
          </>
        ) : (
          <>
            {/* ══ 03.5 left column ══ */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <EditorCard className="gap-6" labelledBy={`${uid}-review`}>
                <h2 id={`${uid}-review`} className={CARD_TITLE}>
                  {t("caseReview.review.contentCard")}
                </h2>
                <div className="flex flex-col gap-[21px]">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`${uid}-title`} className={FIELD_LABEL}>
                      {t("caseReview.review.title")} *
                    </label>
                    <input
                      id={`${uid}-title`}
                      type="text"
                      value={draft.title}
                      maxLength={TITLE_MAX}
                      disabled={fieldsDisabled}
                      aria-required="true"
                      aria-invalid={!draft.title.trim() || undefined}
                      onChange={(e) => updateDraft((c) => ({ ...c, title: e.target.value }))}
                      className={cx(FIELD_BOX, "h-[46px]")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`${uid}-desc`} className={FIELD_LABEL}>
                      {t("caseReview.review.shortDesc")}
                    </label>
                    <input
                      id={`${uid}-desc`}
                      type="text"
                      value={draft.description ?? ""}
                      disabled={fieldsDisabled}
                      onChange={(e) => updateDraft((c) => ({ ...c, description: e.target.value }))}
                      className={cx(FIELD_BOX, "h-11 px-[15px] py-0")}
                    />
                  </div>
                </div>
              </EditorCard>

              {(["context", "problem"] as const).map((key) => (
                <EditorCard key={key} className="gap-[23px]">
                  <label htmlFor={`${uid}-${key}`} className={CARD_TITLE}>
                    {t(`caseReview.review.${key}`)} *
                  </label>
                  <textarea
                    id={`${uid}-${key}`}
                    value={(key === "context" ? draft.contextText : draft.problemText) ?? "—"}
                    readOnly
                    aria-describedby={unsupportedId}
                    title={unsupported}
                    className={cx(EDITOR_BOX, "text-ink")}
                  />
                </EditorCard>
              ))}
            </div>

            {/* ══ 03.5 right column ══ */}
            <div className="flex w-[478px] shrink-0 flex-col gap-5">
              <EditorCard className="gap-[23px]" labelledBy={`${uid}-info`}>
                <h2 id={`${uid}-info`} className={CARD_TITLE}>
                  {t("caseReview.review.infoCard")}
                </h2>
                <RowList>
                  {(
                    [
                      ["modeLabel", modeLabel],
                      ["courseLabel", course && course.id === saved.courseId ? course.name : t("caseReview.review.unknown")],
                      ["statusLabel", t(`caseReview.status.${status}`)],
                      ["versionLabel", saved.version !== undefined ? t("caseReview.review.version", { version: saved.version }) : t("caseReview.review.unknown")],
                      ["structureLabel", t("caseReview.review.noTree")],
                    ] as const
                  ).map(([label, value]) => (
                    <Row key={label}>
                      <span className="text-ink-secondary">{t(`caseReview.review.${label}`)} </span>
                      <span className="text-ink">{value}</span>
                    </Row>
                  ))}
                </RowList>
              </EditorCard>

              <EditorCard className="gap-[23px]" labelledBy={`${uid}-answers`}>
                <h2 id={`${uid}-answers`} className={CARD_TITLE}>
                  {t("caseReview.review.studentAnswers")}
                </h2>
                <RowList>
                  {(["answerAnalysis", "answerSolution", "answerReasoning"] as const).map((key) => (
                    <Row key={key} className="text-ink">
                      {t(`caseReview.review.${key}`)}
                    </Row>
                  ))}
                </RowList>
                <p className={CAPTION}>{t("caseReview.review.answersHint")}</p>
              </EditorCard>

              <SourcesCard uid={uid} />
            </div>
          </>
        )}
      </div>

      {/* ══ 03.6 action bar & 03.7 publish dialog ══ */}
      <CaseGovernanceBar
        status={status}
        saving={pending}
        dirty={dirty}
        publish={publish}
        onSaveReviewed={() => void handleSaveReviewed()}
        onSaveDraft={() => void saveContent()}
        onApprove={() => void changeStatus("APPROVED")}
        onConfirmPublish={() => requestStatus("PUBLISHED")}
        onPublishErrorAfterClose={(error) => showError(t("caseReview.toast.statusFailedTitle"), error)}
        onRevertToDraft={() => void changeStatus("DRAFT")}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
}

function ErrorMessage({ error }: { error: RequestError }) {
  const { t } = useTranslation();
  return (
    <>
      {error.summary}
      {error.detail && <span className="mt-0.5 block text-ink-muted">{t("caseReview.errors.detail", { detail: error.detail })}</span>}
    </>
  );
}

// ── 03.4 "Tình huống" card ───────────────────────────────────────────────────
// Node title, prompt question and the key-decision flag have no backend field: read-only slots.

function SituationCard({
  node,
  tag,
  unsupportedId,
  unsupported,
  uid,
}: {
  node: CaseNode;
  tag: string;
  unsupportedId: string;
  unsupported: string;
  uid: string;
}) {
  const { t } = useTranslation();
  return (
    <EditorCard className="gap-6" labelledBy={`${uid}-node`}>
      <h2 id={`${uid}-node`} className={CARD_TITLE}>
        {node.isTerminal ? t("caseReview.branching.outcomeCard") : t("caseReview.branching.situationCard")}
      </h2>
      <div className="flex flex-col gap-[21px]">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-node-title`} className={FIELD_LABEL}>
            {t("caseReview.branching.situationTitle")} *
          </label>
          <input
            id={`${uid}-node-title`}
            type="text"
            value={tag}
            readOnly
            aria-describedby={unsupportedId}
            title={unsupported}
            className={cx(FIELD_BOX, "h-[46px]")}
          />
        </div>
        {!node.isTerminal && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor={`${uid}-prompt`} className={FIELD_LABEL}>
                {t("caseReview.branching.promptQuestion")}
              </label>
              <input
                id={`${uid}-prompt`}
                type="text"
                value="—"
                readOnly
                aria-describedby={unsupportedId}
                title={unsupported}
                className={cx(FIELD_BOX, "h-11 px-[15px] py-0 text-ink-muted")}
              />
            </div>
            <div className="flex h-11 items-center gap-2.5 rounded-eb-md border border-line-strong px-[15px]" title={unsupported}>
              <span id={`${uid}-key`} className="min-w-0 flex-1 text-[14px] leading-5 text-ink">
                {t("caseReview.branching.keyDecision")}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={false}
                aria-labelledby={`${uid}-key`}
                aria-describedby={unsupportedId}
                disabled
                className="flex h-4 w-7 shrink-0 cursor-not-allowed items-start rounded-eb-md bg-line-strong p-0.5"
              >
                <span className="size-3 rounded-[6px] bg-surface" />
              </button>
            </div>
            <p className={CAPTION}>{t("caseReview.branching.keyDecisionHelp")}</p>
          </>
        )}
      </div>
    </EditorCard>
  );
}

// ── 03.4 options ────────────────────────────────────────────────────────────

function OptionEditor({
  uid,
  index,
  option,
  target,
  targetTag,
  disabled,
  unsupportedId,
  unsupported,
  onChange,
}: {
  uid: string;
  index: number;
  option: CaseOption;
  target?: CaseNode;
  targetTag: (n: CaseNode) => string;
  disabled: boolean;
  unsupportedId: string;
  unsupported: string;
  onChange: (field: "text" | "consequence", value: string) => void;
}) {
  const { t } = useTranslation();
  const base = `${uid}-opt-${option.id}`;
  return (
    <div role="group" aria-labelledby={`${base}-h`} className="flex flex-col gap-3.5 rounded-eb-lg bg-canvas p-4">
      <div className="flex items-center gap-2">
        <h3 id={`${base}-h`} className="min-w-0 flex-1 text-[14px] leading-5 font-medium text-ink">
          {t("caseReview.branching.optionLabel", { n: index + 1 })}
        </h3>
        <DeleteIcon label={t("caseReview.branching.deleteOption")} unsupportedId={unsupportedId} unsupported={unsupported} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${base}-text`} className={FIELD_LABEL}>
          {t("caseReview.branching.optionText")} *
        </label>
        <textarea
          id={`${base}-text`}
          rows={1}
          value={option.text}
          disabled={disabled}
          aria-required="true"
          aria-invalid={!option.text.trim() || undefined}
          onChange={(e) => onChange("text", e.target.value)}
          className={cx(FIELD_BOX, "resize-none field-sizing-content")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${base}-desc`} className={FIELD_LABEL}>
          {t("caseReview.branching.optionDescription")}
        </label>
        <input
          id={`${base}-desc`}
          type="text"
          value="—"
          readOnly
          aria-describedby={unsupportedId}
          title={unsupported}
          className={cx(FIELD_BOX, "h-[46px] text-ink-muted")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id={`${base}-next-l`} className={FIELD_LABEL}>
          {t("caseReview.branching.nextNode")} *
        </span>
        <div
          role="group"
          aria-labelledby={`${base}-next-l`}
          aria-describedby={unsupportedId}
          title={unsupported}
          className="flex h-9 items-center gap-2.5 border-b border-line-soft py-2 text-[14px] leading-5"
        >
          <span className="min-w-0 flex-1 truncate">
            {target ? (
              <>
                <span className="text-ink-muted">{targetTag(target)}: </span>
                <span className="text-ink">{target.situation}</span>
              </>
            ) : (
              <span className="text-ink">{t("caseReview.branching.endsJourney")}</span>
            )}
          </span>
          <ChevronDown aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.7} className="shrink-0 text-control-icon" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${base}-cons`} className="text-[12px] leading-4 font-medium text-ink">
          {t("caseReview.branching.consequence")} *
        </label>
        <textarea
          id={`${base}-cons`}
          value={option.consequence}
          disabled={disabled}
          aria-required="true"
          aria-invalid={!option.consequence.trim() || undefined}
          aria-describedby={`${base}-cons-help`}
          onChange={(e) => onChange("consequence", e.target.value)}
          className={EDITOR_BOX}
        />
        <p id={`${base}-cons-help`} className={CAPTION}>
          {t("caseReview.branching.consequenceHelp")}
        </p>
      </div>
    </div>
  );
}

function OptionCollapsed({
  label,
  expandLabel,
  deleteLabel,
  unsupportedId,
  unsupported,
  onExpand,
}: {
  label: string;
  expandLabel: string;
  deleteLabel: string;
  unsupportedId: string;
  unsupported: string;
  onExpand: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-eb-lg bg-canvas p-4">
      <button
        type="button"
        onClick={onExpand}
        aria-expanded={false}
        aria-label={`${expandLabel}: ${label}`}
        className={cx("flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-eb-sm text-left", FOCUS_RING)}
      >
        <span className="min-w-0 flex-1 truncate text-[14px] leading-5 font-medium text-ink">{label}</span>
        <ChevronRight aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.333} className="shrink-0 text-ink-secondary" />
      </button>
      <DeleteIcon label={deleteLabel} unsupportedId={unsupportedId} unsupported={unsupported} />
    </div>
  );
}

/** Icon/trash-2 (16, stroke 1.511) — deleting options is not supported by PUT /cases/:id. */
function DeleteIcon({ label, unsupportedId, unsupported }: { label: string; unsupportedId: string; unsupported: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={label}
      aria-describedby={unsupportedId}
      title={`${label} — ${unsupported}`}
      className="flex size-4 shrink-0 cursor-not-allowed items-center justify-center text-ink-secondary"
    >
      <Trash2 aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.511} />
    </button>
  );
}

// ── "Đoạn nguồn được trích" (03.4 / 03.5) ───────────────────────────────────
// GET /cases/:id returns no source citations: the slot stays with "—" and the reason.

function SourcesCard({ uid }: { uid: string }) {
  const { t } = useTranslation();
  return (
    <EditorCard className="gap-[23px]" labelledBy={`${uid}-sources`}>
      <h2 id={`${uid}-sources`} className={CARD_TITLE}>
        {t("caseReview.sources.title")}
      </h2>
      <RowList>
        <Row icon={<Link2 aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.333} className="shrink-0 text-link" />}>
          <span className="text-ink-secondary">—</span>
        </Row>
      </RowList>
      <p className={CAPTION}>{t("caseReview.sources.unavailable")}</p>
    </EditorCard>
  );
}

// ── Loading ─────────────────────────────────────────────────────────────────

function EditorSkeleton({ label }: { label: string }) {
  const card = (lines: number[], height?: number) => (
    <div className="flex flex-col gap-6 rounded-eb-xl bg-surface p-5">
      <SkeletonLine width={160} />
      {height !== undefined && <SkeletonBlock height={height} className="w-full rounded-eb-md bg-canvas" />}
      {lines.map((w, i) => (
        <SkeletonLine key={i} width={w} size="sm" />
      ))}
    </div>
  );
  return (
    <SkeletonRegion label={label} className="flex flex-col gap-5">
      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {card([120, 520, 120, 520], 46)}
          {card([], 84)}
          {card([360], 300)}
        </div>
        <div className="flex w-[478px] shrink-0 flex-col gap-5">
          {card([200], 420)}
          {card([300, 260])}
          {card([300, 260])}
        </div>
      </div>
      <SkeletonBlock height={84} className="w-full rounded-eb-xl bg-surface" />
    </SkeletonRegion>
  );
}
