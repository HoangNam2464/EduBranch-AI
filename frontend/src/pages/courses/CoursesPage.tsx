/**
 * CoursesPage — Giảng viên · Quản lý khóa học (Figma page EduBranch AI – Screens: 02.1 list + details,
 * 02.2 create dialog, 02.3 archive dialog; states 01.1 / 01.2 / 01.3 / 01.8).
 * Courses are archived, never deleted (PO C1-B / OPD-014): PATCH /courses/:id/archive.
 *
 * Real data only: GET /courses (the signed-in lecturer's courses); per-course figures from
 * GET /courses/:id/materials and GET /courses/:id/cases (see courseInsights.ts); the lecturer
 * name comes from the auth store (courses are always the signed-in lecturer's own).
 * Figma fields without an API source are not rendered (attempt count "Lượt làm bài").
 */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { Archive, Ban, BookOpen, Check, ChevronRight, CircleAlert, CircleCheck, Clock, Copy, FileText, GitBranch, Plus, RotateCw, X, type LucideIcon } from "lucide-react";
import {
  Button,
  CourseCard,
  CourseOverview,
  Dialog,
  Field,
  FilterControl,
  Pagination,
  ResultCount,
  SearchField,
  Toast,
  ToastRegion,
  cx,
  FOCUS_RING,
  type CourseNoteTone,
} from "@/components/ds";
import { CourseListSkeleton, EmptyState, ErrorState, NoResultsState } from "@/components/feedback";
import { useAuthStore } from "@/stores/authStore";
import { initialsOf } from "@/layouts/shell/shellRoutes";
import { courseService } from "@/services/courseService";
import { PATHS, buildPath } from "@/routes/paths";
import type { Course } from "@/types";
import { courseVisual, loadCourseInsights, summarize, type CourseInsights, type CourseSummary } from "@/pages/courses/courseInsights";

type StatusFilter = "all" | "active" | "inactive";
const PAGE_SIZES = [10, 20, 50];

/**
 * Backend reason for a failed request (`response.data.message`). 5xx bodies carry no usable
 * reason, so only 4xx messages are shown; otherwise the caller falls back to its own copy.
 */
function apiErrorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const status = error.response?.status ?? 0;
  if (status < 400 || status >= 500) return undefined;
  const message = (error.response?.data as { message?: unknown } | undefined)?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.every((m) => typeof m === "string")) return message.join(" ");
  return undefined;
}

// ── Card figures ─────────────────────────────────────────────────────────────

function cardNote(s: CourseSummary, t: (k: string, o?: Record<string, unknown>) => string): { note?: string; tone: CourseNoteTone } {
  if (s.failed > 0) return { note: t("g2.courses.note.failedFiles", { count: s.failed }), tone: "error" };
  if (s.inProgress > 0) return { note: t("g2.courses.note.processingFiles", { count: s.inProgress }), tone: "info" };
  if (s.reviewed > 0) return { note: t("g2.courses.note.reviewedCases", { count: s.reviewed }), tone: "warning" };
  if (s.drafts > 0) return { note: t("g2.courses.note.draftCases", { count: s.drafts }), tone: "warning" };
  return { tone: "neutral" };
}

// ── Details panel pieces (02.1 "Course Details") ─────────────────────────────

/** "Resource" row: 56 tall, 40x40 tile + two text lines, 1px white bottom stroke. */
function ResourceRow({
  icon: Icon,
  iconStroke,
  tileClass,
  iconClass,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  iconStroke: number;
  tileClass: string;
  iconClass: string;
  title: string;
  subtitle: string;
  action: ReactNode;
}) {
  return (
    <li className="flex h-14 items-center gap-2 border-b border-surface">
      <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-eb-md", tileClass)}>
        <Icon aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={iconStroke} className={iconClass} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[14px] leading-5 text-ink" title={title}>
          {title}
        </span>
        <span className="truncate text-[12px] leading-4 text-ink-muted">{subtitle}</span>
      </span>
      {action}
    </li>
  );
}

/** 32x32 white "Download" chevron link of the resource rows. */
function ChevronLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cx("flex size-8 shrink-0 items-center justify-center rounded-eb-md bg-surface text-ink-secondary transition-colors hover:bg-surface-hover", FOCUS_RING)}
    >
      <ChevronRight aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.33} />
    </Link>
  );
}

function InviteCodeSection({ courseId, active }: { courseId: string; active: boolean }) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (!errorToast) return;
    const timer = window.setTimeout(() => setErrorToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [errorToast]);

  useEffect(() => {
    let unmounted = false;
    setLoading(true);
    courseService
      .getInviteCode(courseId)
      .then((res) => {
        if (!unmounted) {
          setCode(res.inviteCode);
          setIsActive(res.isActive);
        }
      })
      .catch(() => {
        if (!unmounted) {
          setErrorToast(t("g2.courses.details.loadError"));
        }
      })
      .finally(() => {
        if (!unmounted) setLoading(false);
      });
    return () => {
      unmounted = true;
    };
  }, [courseId, t]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorToast(t("g2.courses.details.copyError"));
    }
  };

  const handleRotate = async () => {
    setActionLoading(true);
    try {
      const res = await courseService.rotateInviteCode(courseId);
      setCode(res.inviteCode);
      setIsActive(res.isActive);
    } catch {
      setErrorToast(t(code ? "g2.courses.details.rotateError" : "g2.courses.details.createError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable = async () => {
    setActionLoading(true);
    try {
      const res = await courseService.disableInviteCode(courseId);
      setCode(res.inviteCode);
      setIsActive(res.isActive);
    } catch {
      setErrorToast(t("g2.courses.details.disableError"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-2.5 rounded-[14px] bg-canvas p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] leading-5 font-normal text-ink">{t("g2.courses.details.inviteCode")}</h4>
        {code && !isActive && (
          <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning-text">
            {t("g2.courses.details.codeDisabled")}
          </span>
        )}
      </div>
      <p className="text-[12px] leading-4 text-ink-secondary">{t("g2.courses.details.inviteCodeHelp")}</p>

      {loading ? (
        <div className="h-10 animate-pulse rounded-eb-sm bg-surface-muted" />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-eb-sm border border-line bg-surface px-3 py-2">
            <span
              className={cx(
                "font-mono text-[16px] tracking-wider",
                code
                  ? isActive
                    ? "font-semibold text-primary"
                    : "text-ink-muted line-through"
                  : "text-[13px] text-ink-muted italic font-normal",
              )}
            >
              {code ?? t("g2.courses.details.noCodeYet")}
            </span>
            {isActive && code && (
              <button
                type="button"
                onClick={handleCopy}
                disabled={!isActive}
                className={cx("flex items-center gap-1 rounded-eb-xs px-2 py-1 text-[12px] text-link hover:underline", FOCUS_RING)}
                aria-label={t("g2.courses.details.copyCode")}
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-accent" />
                    <span>{t("g2.courses.details.codeCopied")}</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>{t("g2.courses.details.copyCode")}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {active && (
            <div className="flex items-center gap-2 pt-1">
              {!code ? (
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={Plus}
                  onClick={handleRotate}
                  disabled={actionLoading}
                >
                  {t("g2.courses.details.createCode")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={RotateCw}
                    onClick={handleRotate}
                    disabled={actionLoading}
                  >
                    {t(isActive ? "g2.courses.details.rotateCode" : "g2.courses.details.enableCode")}
                  </Button>
                  {isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={Ban}
                      onClick={handleDisable}
                      disabled={actionLoading}
                    >
                      {t("g2.courses.details.disableCode")}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {errorToast && (
        <ToastRegion>
          <Toast
            type="error"
            title={t("g2.common.error", "Lỗi")}
            message={errorToast}
            onClose={() => setErrorToast(null)}
            closeLabel={t("g2.courses.archiveDialog.closeToast")}
          />
        </ToastRegion>
      )}
    </section>
  );
}

function CourseDetails({
  course,
  index,
  insights,
  lecturerName,
  lecturerInitials,
  onClose,
}: {
  course: Course;
  index: number;
  insights: CourseInsights | undefined;
  lecturerName: string;
  lecturerInitials: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const visual = courseVisual(index);
  const summary = insights ? summarize(insights) : undefined;
  const materialsPath = buildPath(PATHS.LECTURER.COURSE_MATERIALS, { courseId: course.id });
  const casesPath = buildPath(PATHS.LECTURER.COURSE_CASES, { courseId: course.id });
  const statusLabel = t(course.active ? "g2.courses.statusActive" : "g2.courses.statusInactive");

  const attention: ReactNode[] = [];
  if (insights) {
    for (const m of insights.materials) {
      if (m.processingStatus === "FAILED") {
        attention.push(
          <ResourceRow
            key={m.id}
            icon={CircleAlert}
            iconStroke={1.5}
            tileClass="bg-error-bg"
            iconClass="text-error-text"
            title={m.originalFilename}
            subtitle={t("g2.courses.details.failedFile")}
            action={
              <Button variant="secondary" size="sm" to={materialsPath}>
                {t("g2.courses.details.retry")}
              </Button>
            }
          />,
        );
      } else if (m.processingStatus === "PENDING" || m.processingStatus === "PROCESSING") {
        attention.push(
          <ResourceRow
            key={m.id}
            icon={Clock}
            iconStroke={1.51}
            tileClass="bg-warning-bg"
            iconClass="text-warning-text"
            title={m.originalFilename}
            subtitle={t(m.processingStatus === "PENDING" ? "g2.courses.details.pendingFile" : "g2.courses.details.processingFile")}
            action={<ChevronLink to={materialsPath} label={t("g2.courses.details.openMaterials")} />}
          />,
        );
      }
    }
    for (const c of insights.cases) {
      if (c.status !== "DRAFT" && c.status !== "REVIEWED") continue;
      attention.push(
        <ResourceRow
          key={c.id}
          icon={GitBranch}
          iconStroke={1.5}
          tileClass="bg-selected"
          iconClass="text-link"
          title={c.title}
          subtitle={t(c.status === "DRAFT" ? "g2.courses.details.draftCase" : "g2.courses.details.reviewedCase")}
          action={
            <Button variant="secondary" size="sm" to={buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: c.id })}>
              {t("g2.courses.details.view")}
            </Button>
          }
        />,
      );
    }
  }

  return (
    <aside aria-labelledby="course-details-title" className="flex w-[424px] shrink-0 flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card">
      <div className="flex h-8 items-center justify-between">
        <h2 id="course-details-title" className="text-[16px] leading-6 font-normal tracking-normal text-ink">
          {t("g2.courses.details.title")}
        </h2>
        <div className="flex items-center gap-5">
          <Link
            to={materialsPath}
            className={cx(
              "flex h-8 items-center justify-center rounded-eb-md border border-[#E5E7EB] bg-canvas px-3 text-[12px] leading-4 text-[#111827] transition-colors hover:bg-surface-hover",
              FOCUS_RING,
            )}
          >
            {t("g2.courses.details.open")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("g2.courses.details.close")}
            className={cx("flex size-4 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary", FOCUS_RING)}
          >
            <X aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.33} />
          </button>
        </div>
      </div>

      <CourseOverview
        variant="panel"
        title={course.name}
        titleAs="h3"
        code={course.courseCode ?? ""}
        coverIcon={visual.icon}
        coverIconStrokeWidth={visual.stroke}
        coverTone="primary"
        instructorName={lecturerName}
        instructorInitials={lecturerInitials}
        statuses={[{ label: statusLabel, tone: course.active ? "success" : "neutral" }]}
        stats={
          summary
            ? [
                { label: t("g2.courses.details.statAttempts"), value: "—" },
                { label: t("g2.courses.details.statDocuments"), value: summary.documents },
                { label: t("g2.courses.details.statCases"), value: summary.cases },
              ]
            : []
        }
      >
        {attention.length > 0 && (
          <section className="flex flex-col gap-3 rounded-[14px] bg-canvas p-4">
            <h4 className="text-[14px] leading-5 font-normal text-ink">{t("g2.courses.details.attention")}</h4>
            <ul className="flex flex-col gap-3">{attention.slice(0, 3)}</ul>
          </section>
        )}

        <section className="flex flex-col gap-2.5 rounded-[14px] bg-canvas p-4">
          <h4 className="text-[14px] leading-5 font-normal text-ink">{t("g2.courses.details.about")}</h4>
          <p className="text-[14px] leading-5 text-ink-secondary">{course.description || t("g2.courses.details.noDescription")}</p>
          <hr className="h-px border-0 bg-line-soft" />
          <h4 className="text-[14px] leading-5 font-normal text-ink">{t("g2.courses.details.info")}</h4>
          <ul className="flex flex-col gap-2">
            {[
              course.courseCode ? t("g2.courses.details.infoCode", { code: course.courseCode }) : null,
              t(course.active ? "g2.courses.details.infoStatusActive" : "g2.courses.details.infoStatusInactive"),
              lecturerName ? t("g2.courses.details.infoLecturer", { name: lecturerName }) : null,
            ]
              .filter((line): line is string => Boolean(line))
              .map((line) => (
                <li key={line} className="flex items-center gap-2 text-[14px] leading-5 text-ink-secondary">
                  <CircleCheck aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0 text-accent" />
                  {line}
                </li>
              ))}
          </ul>
        </section>

        <InviteCodeSection courseId={course.id} active={course.active} />

        <section className="flex flex-col gap-3 rounded-[14px] bg-canvas p-4">
          <h4 className="text-[14px] leading-5 font-normal text-ink">{t("g2.courses.details.goTo")}</h4>
          <ul className="flex flex-col gap-3">
            <ResourceRow
              icon={FileText}
              iconStroke={1.7}
              tileClass="bg-selected"
              iconClass="text-link"
              title={t("g2.courses.details.materials")}
              subtitle={summary ? t("g2.courses.details.materialsSummary", { total: summary.documents, ready: summary.ready, failed: summary.failed }) : ""}
              action={<ChevronLink to={materialsPath} label={t("g2.courses.details.materials")} />}
            />
            <ResourceRow
              icon={GitBranch}
              iconStroke={1.5}
              tileClass="bg-selected"
              iconClass="text-link"
              title={t("g2.courses.details.cases")}
              subtitle={summary ? t("g2.courses.details.casesSummary", { total: summary.cases, published: summary.published, drafts: summary.drafts }) : ""}
              action={<ChevronLink to={casesPath} label={t("g2.courses.details.cases")} />}
            />
          </ul>
        </section>
      </CourseOverview>
    </aside>
  );
}

// ── 02.2 Create course dialog ────────────────────────────────────────────────

function CreateCourseDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (course: Course) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; code?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t("g2.courses.createDialog.nameRequired");
    if (!code.trim()) next.code = t("g2.courses.createDialog.codeRequired");
    setErrors(next);
    if (next.name || next.code) return;
    setSaving(true);
    try {
      const course = await courseService.createCourse({
        name: name.trim(),
        courseCode: code.trim().toUpperCase(),
        description: description.trim() || undefined,
      });
      onCreated(course);
    } catch {
      setErrors({ form: t("g2.courses.createDialog.failed") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={560}
      title={t("g2.courses.createDialog.title")}
      description={t("g2.courses.createDialog.description")}
      actions={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("g2.common.cancel")}
          </Button>
          <Button variant="primary" size="md" type="submit" form="create-course-form" disabled={saving}>
            {t("g2.courses.createDialog.submit")}
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
      <form id="create-course-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label={t("g2.courses.createDialog.name")}
          placeholder={t("g2.courses.createDialog.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={200}
          required
        />
        <Field
          label={t("g2.courses.createDialog.code")}
          placeholder={t("g2.courses.createDialog.codePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={errors.code}
          maxLength={20}
          required
        />
        <Field
          multiline
          label={t("g2.courses.createDialog.about")}
          placeholder={t("g2.courses.createDialog.aboutPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
        {errors.form && (
          <p role="alert" className="text-[12px] leading-4 text-error-text">
            {errors.form}
          </p>
        )}
      </form>
    </Dialog>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function CoursesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const lecturerName = user?.fullName ?? "";
  const lecturerInitials = initialsOf(lecturerName);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [insights, setInsights] = useState<Record<string, CourseInsights>>({});

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsClosed, setDetailsClosed] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [toArchive, setToArchive] = useState<Course | null>(null);
  /** Id of the course whose archive request is running (one request at a time). */
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archived, setArchived] = useState<Course | null>(null);
  /** Course whose dialog is currently open; a late response for another course must not touch it. */
  const openArchiveId = useRef<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The success toast dismisses itself after a few seconds (and on close).
  useEffect(() => {
    if (!archived) return;
    const timer = window.setTimeout(() => setArchived(null), 6000);
    return () => window.clearTimeout(timer);
  }, [archived]);

  function openArchive(course: Course) {
    openArchiveId.current = course.id;
    setArchiveError(null);
    setToArchive(course);
  }

  function closeArchive() {
    openArchiveId.current = null;
    setToArchive(null);
  }

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setCourses(await courseService.getMyCourses());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    courseService
      .getMyCourses()
      .then((list) => !cancelled && setCourses(list))
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (status === "all" || (status === "active") === c.active) &&
          (!keyword || c.name.toLowerCase().includes(keyword) || (c.courseCode ?? "").toLowerCase().includes(keyword)),
      ),
    [courses, status, keyword],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selected = detailsClosed ? null : (pageItems.find((c) => c.id === selectedId) ?? pageItems[0] ?? null);

  // Figures for the visible cards (N+1 calls per page: the course API has no aggregate counts).
  const missing = pageItems.filter((c) => !insights[c.id]).map((c) => c.id).join(",");
  useEffect(() => {
    if (!missing) return;
    let cancelled = false;
    void Promise.allSettled(missing.split(",").map(async (id) => [id, await loadCourseInsights(id)] as const)).then((results) => {
      if (cancelled) return;
      const loaded = Object.fromEntries(results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])));
      setInsights((prev) => ({ ...prev, ...loaded }));
    });
    return () => {
      cancelled = true;
    };
  }, [missing]);

  async function confirmArchive() {
    const course = toArchive;
    if (!course || archivingId) return;
    setArchivingId(course.id);
    setArchiveError(null);
    try {
      const result = await courseService.archiveCourse(course.id);
      if (!mounted.current) return;
      // GET /courses lists active courses only, so the archived course (is_active false) leaves the list.
      setCourses((prev) => (result.active ? prev.map((c) => (c.id === course.id ? { ...c, ...result } : c)) : prev.filter((c) => c.id !== course.id)));
      setSelectedId((id) => (id === course.id ? null : id));
      setArchived(course);
      if (openArchiveId.current === course.id) closeArchive();
    } catch (error: unknown) {
      if (!mounted.current || openArchiveId.current !== course.id) return;
      setArchiveError(apiErrorMessage(error) ?? t("g2.courses.archiveDialog.failed"));
    } finally {
      if (mounted.current) setArchivingId(null);
    }
  }

  const archiveSummary = toArchive ? (insights[toArchive.id] ? summarize(insights[toArchive.id]) : undefined) : undefined;
  const showDetails = !loading && !loadError && selected !== null;

  let listBody: ReactNode;
  if (loading) {
    listBody = <CourseListSkeleton loadingLabel={t("states.loading.courseList")} />;
  } else if (loadError) {
    listBody = <ErrorState title={t("states.error.courses.title")} description={t("states.error.courses.description")} onRetry={() => void loadCourses()} />;
  } else if (courses.length === 0) {
    listBody = (
      <EmptyState
        icon={BookOpen}
        title={t("states.empty.courses.title")}
        description={t("states.empty.courses.description")}
        action={{ label: t("states.empty.courses.action"), icon: Plus, onClick: () => setCreateOpen(true) }}
      />
    );
  } else if (filtered.length === 0) {
    listBody = (
      <NoResultsState
        keyword={search.trim()}
        title={t("states.noResults.courses.title")}
        description={t("states.noResults.courses.description", { keyword: search.trim() })}
        onClear={() => {
          setSearch("");
          setStatus("all");
        }}
      />
    );
  } else {
    listBody = (
      <>
        <ul className="flex flex-col gap-4">
          {pageItems.map((course) => {
            const index = courses.indexOf(course);
            const visual = courseVisual(index);
            const ins = insights[course.id];
            const s = ins ? summarize(ins) : undefined;
            const note = s ? cardNote(s, t) : { tone: "neutral" as const };
            return (
              <li key={course.id} className="group relative">
                <CourseCard
                  title={course.name}
                  code={course.courseCode ?? ""}
                  statusLabel={t(course.active ? "g2.courses.statusActive" : "g2.courses.statusInactive")}
                  statusTone={course.active ? "success" : "neutral"}
                  instructorName={lecturerName}
                  instructorInitials={lecturerInitials}
                  thumbnailIcon={visual.icon}
                  thumbnailIconStrokeWidth={visual.stroke}
                  thumbnailTone={visual.tone}
                  documentsLabel={s ? t("g2.courses.documentsReady", { ready: s.ready, total: s.documents }) : ""}
                  casesLabel={s ? (s.cases > 0 ? t("g2.courses.cases", { count: s.cases }) : t("g2.courses.noCases")) : ""}
                  note={note.note}
                  noteTone={note.tone}
                  selected={selected?.id === course.id}
                  onSelect={() => {
                    setSelectedId(course.id);
                    setDetailsClosed(false);
                  }}
                />
                {/* Archive stays out of the resting card (Figma draws none); it appears on hover/focus. */}
                <button
                  type="button"
                  onClick={() => openArchive(course)}
                  aria-label={t("g2.courses.archiveAction", { name: course.name })}
                  className={cx(
                    "absolute top-[68px] left-[123px] z-10 flex size-6 cursor-pointer items-center justify-center rounded-eb-sm bg-surface text-error-text opacity-0 transition-opacity",
                    "group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
                    FOCUS_RING,
                  )}
                >
                  <Archive aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.51} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between rounded-eb-xl bg-surface p-5 shadow-eb-card">
          <ResultCount
            leadingLabel={t("g2.courses.resultLeading")}
            trailingLabel={t("g2.courses.resultTrailing", { count: filtered.length })}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeLabel={t("g2.courses.pageSizeLabel")}
          />
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
            labels={{
              nav: t("g2.courses.paginationNav"),
              previous: t("g2.courses.previousPage"),
              next: t("g2.courses.nextPage"),
              page: (n) => t("g2.courses.pageN", { page: n }),
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex items-start gap-5">
      <section aria-labelledby="course-list-title" className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex h-[72px] items-center justify-between rounded-eb-xl bg-surface p-5 shadow-eb-card">
          <h2 id="course-list-title" className="text-[16px] leading-6 font-normal tracking-normal text-ink">
            {t("g2.courses.listTitle")}
          </h2>
          <div className="flex items-center gap-3">
            <SearchField
              label={t("g2.courses.searchLabel")}
              placeholder={t("g2.courses.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <FilterControl
              label={t("g2.courses.statusFilterLabel")}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StatusFilter);
                setPage(1);
              }}
              options={[
                { value: "all", label: t("g2.courses.statusAll") },
                { value: "active", label: t("g2.courses.statusActive") },
                { value: "inactive", label: t("g2.courses.statusInactive") },
              ]}
            />
            <Button variant="primary" size="sm" leadingIcon={Plus} onClick={() => setCreateOpen(true)}>
              {t("g2.courses.create")}
            </Button>
          </div>
        </div>
        {listBody}
      </section>

      {showDetails && selected && (
        <CourseDetails
          course={selected}
          index={courses.indexOf(selected)}
          insights={insights[selected.id]}
          lecturerName={lecturerName}
          lecturerInitials={lecturerInitials}
          onClose={() => setDetailsClosed(true)}
        />
      )}

      {/* Mounted only while open, so every opening starts with an empty form. */}
      {createOpen && (
      <CreateCourseDialog
        open
        onClose={() => setCreateOpen(false)}
        onCreated={(course) => {
          setCreateOpen(false);
          setCourses((prev) => [course, ...prev]);
          setSelectedId(course.id);
          setDetailsClosed(false);
          setPage(1);
        }}
      />
      )}

      {/* 02.3: archive confirmation (PO C1-B / OPD-014: courses are archived, never deleted). */}
      <Dialog
        open={toArchive !== null}
        onClose={closeArchive}
        type="destructive"
        title={t("g2.courses.archiveDialog.title")}
        description={
          toArchive && (
            <>
              {t("g2.courses.archiveDialog.message")}
              <br />
              {archiveSummary
                ? t("g2.courses.archiveDialog.summaryCounts", {
                    code: toArchive.courseCode ?? "",
                    name: toArchive.name,
                    documents: archiveSummary.documents,
                    cases: archiveSummary.cases,
                  })
                : t("g2.courses.archiveDialog.summary", { code: toArchive.courseCode ?? "", name: toArchive.name })}
            </>
          )
        }
        cancelLabel={t("g2.common.cancel")}
        confirmLabel={t(archivingId !== null && archivingId === toArchive?.id ? "g2.courses.archiveDialog.pending" : "g2.courses.archiveDialog.confirm")}
        onConfirm={() => void confirmArchive()}
        confirmDisabled={archivingId !== null}
      >
        {archiveError && (
          <p role="alert" className="text-[12px] leading-4 text-error-text">
            {archiveError}
          </p>
        )}
      </Dialog>

      {archived && (
        <ToastRegion>
          <Toast
            type="success"
            title={t("g2.courses.archiveDialog.successTitle")}
            message={t("g2.courses.archiveDialog.successMessage", { code: archived.courseCode ?? "", name: archived.name })}
            onClose={() => setArchived(null)}
            closeLabel={t("g2.courses.archiveDialog.closeToast")}
          />
        </ToastRegion>
      )}
    </div>
  );
}
