/**
 * MaterialsPage — Giảng viên · Chi tiết khóa học — Tài liệu môn học
 * (Figma page EduBranch AI – Screens: 02.4 page, 02.5 upload dialog, 02.6 delete dialog).
 * Route: /lecturer/courses/:courseId/materials
 *
 * Real data only: GET /courses/:id, GET /courses/:id/materials, GET /courses/:id/cases,
 * POST /courses/:id/materials (upload + synchronous AI ingestion), DELETE /materials/:id.
 * Not rendered because the API has no source for them: indexing progress percentage and the
 * "Thử lại" (re-index) action of failed files.
 */
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, CircleAlert, CircleCheck, Clock, CloudUpload, Database, File, FileText, GitBranch, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { Button, CaseStatusBadge, CourseOverview, Dialog, cx, FOCUS_RING, type CaseStatus as CaseBadgeStatus } from "@/components/ds";
import { ErrorState, SkeletonBlock, SkeletonRegion } from "@/components/feedback";
import { useAuthStore } from "@/stores/authStore";
import { initialsOf } from "@/layouts/shell/shellRoutes";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { courseService } from "@/services/courseService";
import { materialService } from "@/services/materialService";
import { PATHS, buildPath } from "@/routes/paths";
import type { Course, TeachingMaterial } from "@/types";
import { courseVisual, formatFileSize, loadCourseInsights, summarize, type CourseInsights } from "@/pages/courses/courseInsights";

const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPTED = [".pdf", ".docx"];

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

// ── 02.4 left column ─────────────────────────────────────────────────────────

function FeatureLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] leading-5 text-ink-secondary">{label}</p>
      {children}
    </div>
  );
}

// ── 02.4 uploaded material row ───────────────────────────────────────────────

function MaterialRow({ material, courseId, onDelete }: { material: TeachingMaterial; courseId: string; onDelete: () => void }) {
  const { t } = useTranslation();
  const ext = extensionOf(material.originalFilename).slice(1).toUpperCase();
  const size = formatFileSize(material.sizeBytes, t);
  const status = material.processingStatus;
  const meta =
    status === "FAILED"
      ? t("g2.materials.statusFailed")
      : status === "COMPLETED" && material.chunkCount !== undefined
        ? `${t("g2.materials.chunks", { count: material.chunkCount })} · ${size}`
        : size;
  const sourcesPath = buildPath(PATHS.LECTURER.MATERIAL_SOURCES, { courseId, materialId: material.id });

  let indicator: ReactNode = null;
  if (status === "COMPLETED") {
    indicator = <CircleCheck role="img" aria-label={t("g2.materials.statusDone")} size={16} absoluteStrokeWidth strokeWidth={0.85} className="text-success" />;
  } else if (status === "PENDING") {
    indicator = (
      <span className="flex items-center gap-1 text-[12px] leading-4 text-warning-text">
        <Clock aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.51} />
        {t("g2.materials.statusPending")}
      </span>
    );
  } else if (status === "PROCESSING") {
    indicator = (
      <span className="flex items-center gap-1 text-[12px] leading-4 font-medium text-accent">
        <LoaderCircle aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.33} className="motion-safe:animate-spin" />
        {t("g2.materials.statusProcessing")}
      </span>
    );
  }

  return (
    <li className="border-b border-canvas">
      {/* Figma draws the first row hovered: canvas fill, 8px inset, trash replaces the status. */}
      <div className="group/row flex h-[67px] items-center gap-3 rounded-[10px] py-2.5 hover:bg-canvas hover:px-2 has-[:focus-visible]:bg-canvas has-[:focus-visible]:px-2">
        <span aria-hidden="true" className="flex size-10 shrink-0 flex-col items-center justify-center rounded-eb-md bg-selected text-link">
          <File size={17} absoluteStrokeWidth strokeWidth={1.5} />
          <span className="text-[7px] leading-2 font-bold">{ext}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link to={sourcesPath} title={material.originalFilename} aria-label={t("g2.materials.openSources", { name: material.originalFilename })} className={cx("truncate text-[14px] leading-5 text-ink hover:text-link", FOCUS_RING)}>
            {material.originalFilename}
          </Link>
          <span className={cx("truncate text-[12px] leading-4", status === "FAILED" ? "text-error" : "text-ink-muted")} title={material.processingError}>
            {meta}
          </span>
        </span>
        <span className="flex shrink-0 items-center group-hover/row:hidden group-has-[:focus-visible]/row:hidden">{indicator}</span>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("g2.materials.delete", { name: material.originalFilename })}
          className={cx(
            "hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-eb-md bg-canvas text-ink-secondary hover:bg-surface-hover group-hover/row:flex group-has-[:focus-visible]/row:flex",
            FOCUS_RING,
          )}
        >
          <Trash2 aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.51} />
        </button>
      </div>
    </li>
  );
}

// ── 02.5 upload dialog ───────────────────────────────────────────────────────

interface QueuedFile {
  key: string;
  file: File;
  error?: "invalidType" | "tooLarge" | "failed";
  progress?: number;
  done?: boolean;
}

function UploadDialog({ courseId, onClose, onUploaded }: { courseId: string; onClose: () => void; onUploaded: () => void }) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const valid = queue.filter((q) => !q.error && !q.done);

  function add(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file, i): QueuedFile => ({
      key: `${Date.now()}-${i}-${file.name}`,
      file,
      error: !ACCEPTED.includes(extensionOf(file.name)) ? "invalidType" : file.size > MAX_BYTES ? "tooLarge" : undefined,
    }));
    setQueue((prev) => [...prev, ...next]);
  }

  async function upload() {
    setUploading(true);
    let anyUploaded = false;
    for (const item of valid) {
      const update = (patch: Partial<QueuedFile>) => setQueue((prev) => prev.map((q) => (q.key === item.key ? { ...q, ...patch } : q)));
      update({ progress: 0 });
      try {
        await materialService.uploadMaterial(courseId, item.file, (percent) => update({ progress: percent }));
        update({ done: true, progress: undefined });
        anyUploaded = true;
      } catch {
        update({ error: "failed", progress: undefined });
      }
    }
    setUploading(false);
    if (anyUploaded) onUploaded();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      width={560}
      title={t("g2.materials.uploadDialog.title")}
      description={t("g2.materials.uploadDialog.description")}
      actions={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("g2.common.cancel")}
          </Button>
          <Button variant="primary" size="md" onClick={() => void upload()} disabled={valid.length === 0 || uploading}>
            {t("g2.materials.uploadDialog.submit", { count: valid.length })}
          </Button>
        </>
      }
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("g2.common.close")}
        className={cx("absolute top-6 right-6 flex size-5 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary", FOCUS_RING)}
      >
        <X aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.33} />
      </button>
      <div className="flex flex-col gap-3">
        <input ref={inputRef} type="file" multiple accept={ACCEPTED.join(",")} className="sr-only" tabIndex={-1} onChange={(e: ChangeEvent<HTMLInputElement>) => { add(e.target.files); e.target.value = ""; }} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e: DragEvent) => e.preventDefault()}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            add(e.dataTransfer.files);
          }}
          className={cx("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-eb-lg border-[1.5px] border-dashed border-line-strong bg-canvas p-6", FOCUS_RING)}
        >
          <CloudUpload aria-hidden="true" size={28} absoluteStrokeWidth strokeWidth={1.09} className="text-link" />
          <span className="text-[14px] leading-5 font-medium text-ink">{t("g2.materials.uploadDialog.dropTitle")}</span>
          <span className="text-[12px] leading-4 text-ink-secondary">{t("g2.materials.uploadDialog.dropHint")}</span>
        </button>
        {queue.length > 0 && (
          <ul className="flex flex-col gap-3">
            {queue.map((q) => {
              const size = formatFileSize(q.file.size, t);
              const failed = Boolean(q.error);
              const line = q.error
                ? t(`g2.materials.uploadDialog.${q.error}`)
                : q.done
                  ? t("g2.materials.uploadDialog.uploaded", { size })
                  : q.progress !== undefined
                    ? t("g2.materials.uploadDialog.uploading", { size, percent: q.progress })
                    : t("g2.materials.uploadDialog.ready", { size });
              return (
                <li key={q.key} className={cx("flex items-center gap-3 rounded-eb-lg border px-3 py-2.5", failed ? "border-error-border bg-error-bg" : "border-line-soft bg-surface")}>
                  <span className={cx("flex size-9 shrink-0 items-center justify-center rounded-eb-md", failed ? "bg-surface" : "bg-selected")}>
                    {failed ? (
                      <CircleAlert aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.5} className="text-error" />
                    ) : (
                      <FileText aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} className="text-link" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[14px] leading-5 font-medium text-ink">{q.file.name}</span>
                    <span className={cx("text-[12px] leading-4", failed ? "text-error" : "text-ink-secondary")}>{line}</span>
                    {q.progress !== undefined && (
                      <span className="mt-0.5 h-1 rounded-[2px] bg-surface-muted">
                        <span className="block h-1 rounded-[2px] bg-accent" style={{ width: `${q.progress}%` }} />
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => setQueue((prev) => prev.filter((x) => x.key !== q.key))}
                    aria-label={t("g2.materials.uploadDialog.remove", { name: q.file.name })}
                    className={cx("flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary disabled:cursor-not-allowed", FOCUS_RING)}
                  >
                    <X aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.33} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function MaterialsPage() {
  const { courseId = "" } = useParams<{ courseId: string }>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const lecturerName = user?.fullName ?? "";

  const [course, setCourse] = useState<Course | null>(null);
  const [insights, setInsights] = useState<CourseInsights | null>(null);
  const [courseIndex, setCourseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [uploadExpanded, setUploadExpanded] = useState(true);
  const [casesExpanded, setCasesExpanded] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TeachingMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useShellTitle(course?.name);

  useEffect(() => {
    let cancelled = false;
    Promise.all([courseService.getCourseById(courseId), loadCourseInsights(courseId), courseService.getMyCourses()])
      .then(([c, ins, mine]) => {
        if (cancelled) return;
        setCourse(c);
        setInsights(ins);
        // Same decorative cover as the course's card on 02.1 (position in the lecturer's list).
        setCourseIndex(Math.max(0, mine.findIndex((m) => m.id === c.id)));
        setLoadError(false);
      })
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [courseId, reloadKey]);

  const refreshMaterials = useCallback(async () => {
    const materials = await materialService.getMaterialsByCourse(courseId);
    setInsights((prev) => (prev ? { ...prev, materials } : prev));
  }, [courseId]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await materialService.deleteMaterial(toDelete.id);
      setInsights((prev) => (prev ? { ...prev, materials: prev.materials.filter((m) => m.id !== toDelete.id) } : prev));
      setToDelete(null);
    } catch {
      setDeleteError(t("g2.materials.deleteDialog.failed"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <SkeletonRegion className="flex gap-5">
        <SkeletonBlock width={379} height={604} className="rounded-eb-xl bg-surface" />
        <SkeletonBlock height={544} className="flex-1 rounded-eb-xl bg-surface" />
      </SkeletonRegion>
    );
  }
  if (loadError || !course || !insights) {
    return <ErrorState title={t("g2.materials.loadError")} onRetry={() => { setLoading(true); setReloadKey((k) => k + 1); }} />;
  }

  const s = summarize(insights);
  const visual = courseVisual(courseIndex);
  const indexedPercent = s.documents > 0 ? (s.ready / s.documents) * 100 : 0;
  const steps: Array<[string, string]> = [
    [t("g2.materials.step1"), t("g2.materials.step1Hint")],
    [t("g2.materials.step2"), t("g2.materials.stepAuto")],
    [t("g2.materials.step3"), t("g2.materials.stepAuto")],
    [t("g2.materials.step4"), t("g2.materials.step4Hint")],
  ];

  return (
    <div className="flex items-start gap-5">
      {/* ── Course information (379) ── */}
      <div className="flex w-[379px] shrink-0 flex-col gap-5">
        <section className="rounded-eb-xl bg-surface p-5 shadow-eb-card">
          <CourseOverview
            variant="sidebar"
            title={course.name}
            code={course.courseCode ?? ""}
            coverIcon={visual.icon}
            coverIconStrokeWidth={visual.stroke}
            coverTone="primary"
            instructorName={lecturerName}
            instructorInitials={initialsOf(lecturerName)}
            statuses={[{ label: t(course.active ? "g2.courses.statusActive" : "g2.courses.statusInactive"), tone: course.active ? "success" : "neutral" }]}
            stats={[
              { label: t("g2.materials.statDocuments"), value: t("g2.materials.statDocumentsValue", { count: s.documents }) },
              { label: t("g2.materials.statCases"), value: t("g2.materials.statCasesValue", { count: s.cases }) },
            ]}
          >
            <div className="flex flex-col gap-4 rounded-[13px] bg-canvas p-4">
              <h3 className="text-[14px] leading-5 font-normal text-ink">{t("g2.materials.about")}</h3>
              <p className="text-[14px] leading-5 text-ink-secondary">{course.description || t("g2.courses.details.noDescription")}</p>
            </div>
          </CourseOverview>
        </section>

        <section className="flex flex-col gap-[18px] rounded-eb-xl bg-surface p-5 shadow-eb-card">
          <h2 className="text-[16px] leading-6 font-normal tracking-normal text-ink">{t("g2.materials.indexing")}</h2>
          <div className="flex flex-col gap-4 rounded-[13px] bg-canvas p-4">
            <FeatureLine label={t("g2.materials.formats")}>
              <span className="flex gap-1.5">
                {["PDF", "DOCX"].map((f) => (
                  <span key={f} className="rounded-2xl bg-surface px-2 py-0.5 text-[14px] leading-5 text-ink">
                    {f}
                  </span>
                ))}
              </span>
            </FeatureLine>
            <hr className="h-px border-0 bg-surface" />
            <FeatureLine label={t("g2.materials.maxSize")}>
              <p className="text-[14px] leading-5 text-ink">{t("g2.materials.maxSizeValue")}</p>
            </FeatureLine>
            <hr className="h-px border-0 bg-surface" />
            <FeatureLine label={t("g2.materials.indexStatus")}>
              <p className="flex items-center justify-between text-[14px] leading-5 text-ink">
                {t("g2.materials.indexStatusValue", { ready: s.ready, total: s.documents })}
                <Database aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={2} className="text-link" />
              </p>
            </FeatureLine>
          </div>
        </section>
      </div>

      {/* ── Learning content (777) ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card">
          <h2 className="text-[16px] leading-6 font-normal tracking-normal text-ink">{t("g2.materials.sectionTitle", { count: s.documents })}</h2>
          <div className="flex flex-col gap-2">
            <div className={cx("flex flex-col gap-4 rounded-eb-lg border border-selected px-4", uploadExpanded ? "bg-canvas py-4" : "h-14 justify-center")}>
              <div className="flex items-center gap-[18px]">
                <h3 className="min-w-0 flex-1 text-[16px] leading-6 font-normal text-ink">{t("g2.materials.uploadSection")}</h3>
                <span className="flex items-center gap-1.5 rounded-2xl bg-selected px-[9px] py-[3px] text-[12px] leading-4 text-link">
                  <FileText aria-hidden="true" size={10} absoluteStrokeWidth strokeWidth={1.7} />
                  {t("g2.materials.formatsChip")}
                </span>
                <button
                  type="button"
                  aria-expanded={uploadExpanded}
                  aria-label={t(uploadExpanded ? "g2.materials.collapse" : "g2.materials.expand")}
                  onClick={() => setUploadExpanded((v) => !v)}
                  className={cx("flex size-[18px] cursor-pointer items-center justify-center rounded-eb-sm text-ink", FOCUS_RING)}
                >
                  {uploadExpanded ? (
                    <ChevronUp aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.5} />
                  ) : (
                    <ChevronDown aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} className="text-control-icon" />
                  )}
                </button>
              </div>
              {uploadExpanded && (
                <div className="flex gap-4">
                  <div className="flex w-[284px] shrink-0 flex-col self-start rounded-[9px] bg-surface p-2">
                    <p className="h-[35px] pl-3 text-[12px] leading-4 text-ink-secondary">{t("g2.materials.pipeline")}</p>
                    <hr className="h-px border-0 bg-canvas" />
                    <ol className="flex flex-col gap-1 py-2">
                      {steps.map(([title, hint], i) => (
                        <li key={title} className={cx("flex h-11 items-center gap-3 rounded-eb-md px-3", i === 0 && "border border-selected bg-canvas")}>
                          <CircleCheck aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0 text-link" />
                          <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink">{title}</span>
                          <span className="text-[10px] leading-[14px] text-ink-muted">{hint}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[9px] bg-surface p-4">
                    <p className="text-[12px] leading-4 text-ink-secondary">{t("g2.materials.newUpload")}</p>
                    <hr className="h-px border-0 bg-canvas" />
                    <div className="flex h-[248px] flex-col items-center justify-center gap-2.5 rounded-eb-lg border-[1.5px] border-dashed border-line-strong bg-canvas">
                      <CloudUpload aria-hidden="true" size={32} absoluteStrokeWidth strokeWidth={1.09} className="text-link" />
                      <p className="text-[14px] leading-5 font-medium text-ink">{t("g2.materials.dropTitle")}</p>
                      <p className="text-[12px] leading-4 text-ink-secondary">{t("g2.materials.dropHint")}</p>
                      <Button variant="primary" size="sm" leadingIcon={Upload} onClick={() => setUploadOpen(true)}>
                        {t("g2.materials.choose")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={cx("flex flex-col rounded-eb-lg border border-selected px-4", casesExpanded && "pb-4")}>
              <div className="flex h-14 items-center gap-[18px]">
                <h3 className="min-w-0 flex-1 text-[16px] leading-6 font-normal text-ink">{t("g2.materials.casesSection", { count: s.cases })}</h3>
                <span className="flex items-center gap-1.5 rounded-2xl bg-canvas px-[9px] py-[3px] text-[12px] leading-4 text-ink-secondary">
                  <GitBranch aria-hidden="true" size={10} absoluteStrokeWidth strokeWidth={1.5} className="text-link" />
                  {t("g2.materials.casesChip", { count: s.cases })}
                </span>
                <button
                  type="button"
                  aria-expanded={casesExpanded}
                  aria-label={t(casesExpanded ? "g2.materials.collapse" : "g2.materials.expand")}
                  onClick={() => setCasesExpanded((v) => !v)}
                  className={cx("flex size-[18px] cursor-pointer items-center justify-center rounded-eb-sm text-control-icon", FOCUS_RING)}
                >
                  {casesExpanded ? (
                    <ChevronUp aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} />
                  ) : (
                    <ChevronDown aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} />
                  )}
                </button>
              </div>
              {casesExpanded &&
                (insights.cases.length === 0 ? (
                  <p className="text-[14px] leading-5 text-ink-secondary">{t("g2.materials.noCases")}</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {insights.cases.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3">
                        <Link to={buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: c.id })} className={cx("truncate text-[14px] leading-5 text-ink hover:text-link", FOCUS_RING)}>
                          {c.title}
                        </Link>
                        <CaseStatusBadge status={c.status.toLowerCase() as CaseBadgeStatus}>{t(`g2.materials.caseStatus.${c.status}`)}</CaseStatusBadge>
                      </li>
                    ))}
                  </ul>
                ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-1 rounded-eb-xl bg-surface p-5">
          <div className="flex h-6 items-center justify-between gap-3">
            <h2 className="text-[16px] leading-6 font-normal tracking-normal text-ink">{t("g2.materials.uploadedTitle", { count: s.documents })}</h2>
            {s.documents > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-[12px] leading-4 text-ink-secondary">{t("g2.materials.indexedSummary", { ready: s.ready, total: s.documents })}</span>
                <span aria-hidden="true" className="h-1 w-20 rounded-[2px] bg-line">
                  <span className="block h-1 rounded-[2px] bg-primary" style={{ width: `${indexedPercent}%` }} />
                </span>
              </span>
            )}
          </div>
          {insights.materials.length === 0 ? (
            <p className="py-4 text-[14px] leading-5 text-ink-secondary">{t("g2.materials.noMaterials")}</p>
          ) : (
            <ul>
              {insights.materials.map((m) => (
                <MaterialRow
                  key={m.id}
                  material={m}
                  courseId={courseId}
                  onDelete={() => {
                    setDeleteError(null);
                    setToDelete(m);
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {uploadOpen && <UploadDialog courseId={courseId} onClose={() => setUploadOpen(false)} onUploaded={() => void refreshMaterials()} />}

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        type="destructive"
        title={t("g2.materials.deleteDialog.title")}
        description={
          toDelete && (
            <>
              {t("g2.materials.deleteDialog.message")}
              <br />
              {t("g2.materials.deleteDialog.summary", { name: toDelete.originalFilename, count: toDelete.chunkCount ?? 0 })}
            </>
          )
        }
        cancelLabel={t("g2.common.cancel")}
        confirmLabel={t("g2.materials.deleteDialog.confirm")}
        onConfirm={() => void confirmDelete()}
        confirmDisabled={deleting}
      >
        {deleteError && (
          <p role="alert" className="text-[12px] leading-4 text-error-text">
            {deleteError}
          </p>
        )}
      </Dialog>
    </div>
  );
}
