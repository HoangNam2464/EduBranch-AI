/**
 * CasesPage — Giảng viên · Quản lý Case Study (Figma page EduBranch AI – Screens)
 * - 03.1 Quản lý Case Study [483:14030]: status + learning-mode analytics, case library grid
 * - 03.2 Đang sinh case nháp [483:14338]: progress dialog while POST /cases/generate runs
 * - 03.3 Sinh case thất bại [483:14666]: error toast with the real failure
 * Routes: /lecturer/cases and /lecturer/courses/:courseId/cases (course preselected).
 *
 * Data: GET /courses (lecturer's courses) → GET /courses/:id/cases per course
 * (no lecturer-wide endpoint yet) → GET /cases/:id for the node count of visible
 * Branching cards. Generation requests arrive from AI Studio (07.7) as router state.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Database, GitBranch, Plus } from "lucide-react";
import { isAxiosError } from "axios";
import { Button, FilterControl, Pagination, ResultCount, SearchField, StatusTabs, Toast, ToastRegion } from "@/components/ds";
import {
  EmptyState,
  ErrorState,
  NoResultsState,
  SkeletonBlock,
  SkeletonLine,
  SkeletonRegion,
} from "@/components/feedback";
import { caseService, type GenerateCaseRequest } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import { materialService } from "@/services/materialService";
import { useAuthStore } from "@/stores/authStore";
import { initialsOf } from "@/layouts/shell/shellRoutes";
import { PATHS, buildPath } from "@/routes/paths";
import type { Case, CaseStatus, Course, TeachingMaterial } from "@/types";
import { CASE_STATUSES, STATUS_TAB_TONE } from "@/pages/cases/caseUi";
import { CaseModePanel, CaseStatusPanel } from "@/pages/cases/components/CaseAnalytics";
import { CaseLibraryCard } from "@/pages/cases/components/CaseLibraryCard";
import { GenerationDialog } from "@/pages/cases/components/GenerationDialog";

/** Router state AI Studio (07.7) passes when the lecturer clicks "Sinh bản nháp". */
export interface CaseGenerationState {
  generate: { request: GenerateCaseRequest; materialCount: number };
}

const PAGE_SIZES = [10, 20, 50];
type StatusFilter = "ALL" | CaseStatus;

function isGenerationState(state: unknown): state is CaseGenerationState {
  return typeof state === "object" && state !== null && "generate" in state;
}

export function CasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: routeCourseId } = useParams<{ courseId: string }>();
  const user = useAuthStore((s) => s.user);
  const initials = initialsOf(user?.fullName);

  const [courses, setCourses] = useState<Course[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [nodeCounts, setNodeCounts] = useState<Record<string, number>>({});

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [courseFilter, setCourseFilter] = useState(routeCourseId ?? "");
  const [chartCourse, setChartCourse] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const [materials, setMaterials] = useState<TeachingMaterial[] | null>(null);

  const [generating, setGenerating] = useState<{ materialCount: number } | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const generationStarted = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const myCourses = await courseService.getMyCourses();
      setCourses(myCourses);
      setCases(await caseService.getCasesByCourses(myCourses.map((c) => c.id)));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setCourseFilter(routeCourseId ?? "");
  }, [routeCourseId]);

  // 03.2 / 03.3: run the generation request handed over by AI Studio, once.
  useEffect(() => {
    if (generationStarted.current || !isGenerationState(location.state)) return;
    generationStarted.current = true;
    const { request, materialCount } = location.state.generate;
    navigate(location.pathname, { replace: true, state: null });
    setGenerationError(null);
    setGenerating({ materialCount });
    caseService
      .generateCase(request)
      .then((created) => navigate(buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: created.id })))
      .catch((error: unknown) => {
        const status = isAxiosError(error) ? error.response?.status ?? 0 : 0;
        const message = isAxiosError(error) ? (error.response?.data as { message?: unknown } | undefined)?.message : undefined;
        // 5xx carries no usable reason ("Internal server error"); 4xx messages explain the request problem.
        setGenerationError(status > 0 && status < 500 && typeof message === "string" ? message : t("g3.generation.failedDescription"));
      })
      .finally(() => setGenerating(null));
  }, [location.state, location.pathname, navigate, t]);

  // Material readiness notice for the selected course (03.1 "AI source notice").
  useEffect(() => {
    if (!courseFilter) {
      setMaterials(null);
      return;
    }
    let active = true;
    materialService
      .getMaterialsByCourse(courseFilter)
      .then((list) => active && setMaterials(list))
      .catch(() => active && setMaterials(null));
    return () => {
      active = false;
    };
  }, [courseFilter]);

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const courseOptions = useMemo(
    () => [{ value: "", label: t("g3.list.allCourses") }, ...courses.map((c) => ({ value: c.id, label: c.name }))],
    [courses, t],
  );

  const scoped = courseFilter ? cases.filter((c) => c.courseId === courseFilter) : cases;
  const keyword = search.trim().toLowerCase();
  const searched = keyword
    ? scoped.filter(
        (c) =>
          c.title.toLowerCase().includes(keyword) || (courseById.get(c.courseId)?.name ?? "").toLowerCase().includes(keyword),
      )
    : scoped;
  const visible = status === "ALL" ? searched : searched.filter((c) => c.status === status);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Node counts of the visible Branching cards (the list endpoint returns no tree).
  const missingCounts = pageItems
    .filter((c) => c.learningMode === "BRANCHING_STUDY" && nodeCounts[c.id] === undefined)
    .map((c) => c.id)
    .join(",");
  useEffect(() => {
    if (!missingCounts) return;
    let active = true;
    for (const id of missingCounts.split(",")) {
      caseService
        .getCaseById(id)
        .then((detail) => active && setNodeCounts((prev) => ({ ...prev, [id]: detail.nodes.length })))
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [missingCounts]);

  const tabItems = [
    { value: "ALL", label: t("g3.list.tabAll", { count: searched.length }), tone: "default" as const },
    ...CASE_STATUSES.filter((s) => s !== "APPROVED").map((s) => ({
      value: s,
      label: t("g3.list.tabStatus", { label: t(`g3.status.${s}`), count: searched.filter((c) => c.status === s).length }),
      tone: STATUS_TAB_TONE[s],
    })),
  ];

  const selectedCourse = courseFilter ? courseById.get(courseFilter) : undefined;
  let notice = t("g3.list.notice");
  if (selectedCourse && materials && materials.length > 0) {
    const ready = materials.filter((m) => m.processingStatus === "COMPLETED").length;
    const failed = materials.filter((m) => m.processingStatus === "FAILED").length;
    const values = { code: selectedCourse.courseCode ?? selectedCourse.name, ready, total: materials.length, failed };
    notice = failed > 0 ? t("g3.list.noticeCourseFailed", values) : t("g3.list.noticeCourse", values);
  }

  const toStudio = () => navigate(PATHS.LECTURER.AI_STUDIO, { state: courseFilter ? { courseId: courseFilter } : undefined });

  let library;
  if (loading) {
    library = (
      <SkeletonRegion label={t("g3.list.loading")}>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-5 rounded-[14px] bg-canvas p-4">
              <SkeletonBlock height={160} />
              <SkeletonLine width="70%" />
              <SkeletonLine width="90%" />
              <SkeletonLine width="50%" size="sm" />
            </div>
          ))}
        </div>
      </SkeletonRegion>
    );
  } else if (loadError) {
    library = <ErrorState framed={false} className="self-center" title={t("g3.list.loadError")} onRetry={() => void load()} />;
  } else if (courses.length === 0) {
    library = (
      <EmptyState
        framed={false}
        className="self-center"
        icon={BookOpen}
        title={t("g3.list.noCoursesTitle")}
        description={t("g3.list.noCoursesDescription")}
        action={{ label: t("g3.list.goToCourses"), to: PATHS.LECTURER.COURSES }}
      />
    );
  } else if (scoped.length === 0) {
    library = (
      <EmptyState
        framed={false}
        className="self-center"
        icon={GitBranch}
        title={t("g3.list.emptyTitle")}
        description={t("g3.list.emptyDescription")}
        action={{ label: t("g3.list.create"), onClick: toStudio }}
      />
    );
  } else if (visible.length === 0) {
    library = <NoResultsState framed={false} className="self-center" keyword={search} onClear={() => { setSearch(""); setStatus("ALL"); }} />;
  } else {
    library = (
      <div id="g3-case-grid" role="tabpanel" className="grid grid-cols-4 gap-4">
        {pageItems.map((item) => (
          <CaseLibraryCard
            key={item.id}
            item={item}
            courseName={courseById.get(item.courseId)?.name ?? ""}
            instructorInitials={initials}
            nodeCount={nodeCounts[item.id]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Analytics cards side by side from 1440; stacked below so legends and the recent list are not squeezed. */}
      <div className="grid gap-5 min-[1440px]:grid-cols-[minmax(0,478fr)_minmax(0,678fr)]">
        <CaseStatusPanel cases={cases} />
        <CaseModePanel cases={cases} courseOptions={courseOptions} courseId={chartCourse} onCourseChange={setChartCourse} />
      </div>

      <section aria-labelledby="g3-library" className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card">
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h2 id="g3-library" className="text-[16px] leading-6 font-normal text-ink">
            {t("g3.list.library")}
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <SearchField
              label={t("g3.list.search")}
              placeholder={t("g3.list.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <StatusTabs
              label={t("g3.list.statusTabs")}
              items={tabItems}
              value={status}
              panelId="g3-case-grid"
              onChange={(v) => {
                setStatus(v as StatusFilter);
                setPage(1);
              }}
            />
            <FilterControl
              variant="dense"
              label={t("g3.list.courseFilter")}
              options={courseOptions}
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
            />
            <Button variant="primary" size="sm" leadingIcon={Plus} iconStrokeWidth={1.7} onClick={toStudio}>
              {t("g3.list.create")}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-[10px] bg-selected px-3.5 py-2.5">
          <Database aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={2} className="shrink-0 text-note-info" />
          <p className="min-w-0 flex-1 text-[14px] leading-5 text-ink">{notice}</p>
          {selectedCourse && (
            <Link
              className="shrink-0 rounded-eb-sm text-[12px] leading-4 font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              to={buildPath(PATHS.LECTURER.COURSE_MATERIALS, { courseId: selectedCourse.id })}
            >
              {t("g3.list.manageMaterials")}
            </Link>
          )}
        </div>

        {library}

        {!loading && !loadError && visible.length > 0 && (
          <div className="flex items-center justify-between">
            <ResultCount
              leadingLabel={t("g3.list.showing")}
              trailingLabel={t("g3.list.ofTotal", { count: visible.length })}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
              pageSizeLabel={t("g3.list.pageSize")}
            />
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
              labels={{
                nav: t("g3.list.pagination"),
                previous: t("g3.list.previous"),
                next: t("g3.list.next"),
                page: (n) => t("g3.list.page", { page: n }),
              }}
            />
          </div>
        )}
      </section>

      <GenerationDialog open={generating !== null} materialCount={generating?.materialCount ?? 0} />
      {generationError && (
        <ToastRegion>
          <Toast
            type="error"
            width={480}
            title={t("g3.generation.failedTitle")}
            message={generationError}
            onClose={() => setGenerationError(null)}
            closeLabel={t("g3.generation.close")}
          />
        </ToastRegion>
      )}
    </div>
  );
}
