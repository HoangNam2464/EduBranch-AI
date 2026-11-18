/**
 * RagSourceInspectorPage — Giảng viên · Đoạn trích của tài liệu (Figma page 08, 02.7, node 483:11148).
 * Route: /lecturer/courses/:courseId/materials/:materialId/rag
 *
 * Layout (content area, the shell draws sidebar/header/footer):
 *  - Row gap 20: left column (fills, 777 at 1440) + right column 379.
 *  - Left: 3 summary cards (grid, gap 20, white radius 12, padding 20, gap 12) →
 *    "Đoạn trích đã lập chỉ mục" card → "Tài liệu khác trong khóa (n)" card (white radius 18, padding 20).
 *  - Right: "Thông tin tài liệu" card → "Cách AI dùng nguồn" card (white radius 18, padding 20, gap 20).
 *
 * Real data only. The material (GET /materials/:id) is the primary request: the page shows a
 * page-level error only when it fails. The course (GET /courses/:id) and the other documents
 * (GET /courses/:id/materials) load independently and fail inside their own Figma slot.
 * No backend source: indexed chunk texts (no chunk endpoint) and the page count → the slots stay,
 * with "—" / an empty-state message.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CloudUpload, Database, FileText, RotateCcw, type LucideIcon } from "lucide-react";
import { AiOriginBadge, Button, ProcessingBadge, SectionHeading, cx, FOCUS_RING } from "@/components/ds";
import { EmptyState, ErrorState, SkeletonBadge, SkeletonBlock, SkeletonLine, SkeletonRegion, StateCard } from "@/components/feedback";
import { isValidDate } from "@/components/feedback/stateFormat";
import { courseService } from "@/services/courseService";
import { materialService } from "@/services/materialService";
import { PATHS, buildPath } from "@/routes/paths";
import type { Course, ProcessingStatus, TeachingMaterial } from "@/types";
import { formatFileSize } from "@/pages/courses/courseInsights";

type BadgeStatus = "pending" | "processing" | "completed" | "failed";
const toBadgeStatus = (status: ProcessingStatus): BadgeStatus => status.toLowerCase() as BadgeStatus;

type Load<T> = { state: "loading" } | { state: "error"; code?: number; at: Date } | { state: "ready"; data: T };

function errorCodeOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

const pad2 = (value: number): string => String(value).padStart(2, "0");

/** "20/10/2026" — upload date as shown in the Figma "Tải lên" row. */
function formatUploadDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isValidDate(date) ? `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}` : null;
}

function fileTypeOf(material: TeachingMaterial): string {
  const dot = material.originalFilename.lastIndexOf(".");
  if (dot !== -1 && dot < material.originalFilename.length - 1) {
    return material.originalFilename.slice(dot + 1).toUpperCase();
  }
  return material.mimeType;
}

/** Loads one request (`load` must be memoised); `reload` restarts it. Stale responses are ignored. */
function useLoad<T>(load: () => Promise<T>): [Load<T>, () => void] {
  const [result, setResult] = useState<Load<T>>({ state: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setResult({ state: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ state: "error", code: errorCodeOf(error), at: new Date() });
      });
    return () => {
      cancelled = true;
    };
  }, [load, reloadKey]);
  const reload = () => {
    setResult({ state: "loading" });
    setReloadKey((k) => k + 1);
  };
  return [result, reload];
}

/** Figma 02.7 summary card: white, radius 12, padding 20, column gap 12; icon tile 40 #DFEDF9 radius 8. */
function SummaryCard({ icon: Icon, iconStrokeWidth, label, value, hint }: { icon: LucideIcon; iconStrokeWidth: number; label: string; value: ReactNode; hint: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-eb-lg bg-surface p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-eb-md bg-primary-subtle">
          <Icon size={20} absoluteStrokeWidth strokeWidth={iconStrokeWidth} className="text-primary" />
        </span>
        <p className="text-[15px] leading-[22px] text-ink-secondary">{label}</p>
      </div>
      <p className="text-[22px] leading-7 text-ink">{value}</p>
      <p className="truncate text-[12px] leading-4 text-ink-muted">{hint}</p>
    </div>
  );
}

/** White section card of 02.7: radius 18, padding 20, column gap 20 (16 for the chunk card). */
function SectionCard({ labelledBy, gap = "gap-5", children }: { labelledBy: string; gap?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={labelledBy} className={cx("flex min-w-0 flex-col rounded-eb-xl bg-surface p-5 shadow-eb-card", gap)}>
      {children}
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] leading-4 text-ink-secondary">{label}</dt>
      <dd className="min-w-0 text-[14px] leading-5 font-medium text-ink">{children}</dd>
    </div>
  );
}

/** Figma "Icon tile": 36x36 #DFEDF9 radius 8 with Icon/file-text 18 stroke 1.7 #2A4E7F. */
function FileTile() {
  return (
    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-eb-md bg-selected">
      <FileText size={18} absoluteStrokeWidth strokeWidth={1.7} className="text-link" />
    </span>
  );
}

export function RagSourceInspectorPage() {
  const { courseId = "", materialId = "" } = useParams<{ courseId: string; materialId: string }>();
  // Keyed so that opening another document of the course starts from a fresh loading state.
  return <RagSourceInspector key={`${courseId}/${materialId}`} courseId={courseId} materialId={materialId} />;
}

function RagSourceInspector({ courseId, materialId }: { courseId: string; materialId: string }) {
  const { t } = useTranslation();
  const [material, reloadMaterial] = useLoad<TeachingMaterial>(useCallback(() => materialService.getMaterialById(materialId), [materialId]));
  const [course, reloadCourse] = useLoad<Course>(useCallback(() => courseService.getCourseById(courseId), [courseId]));
  const [materials, reloadMaterials] = useLoad<TeachingMaterial[]>(useCallback(() => materialService.getMaterialsByCourse(courseId), [courseId]));

  if (material.state === "loading") return <InspectorSkeleton label={t("ragInspector.loading")} />;

  if (material.state === "error") {
    return (
      <div className="flex flex-1 flex-col">
        <ErrorState
          title={t("ragInspector.error.title")}
          description={t("ragInspector.error.description")}
          onRetry={reloadMaterial}
          errorCode={material.code}
          occurredAt={material.at}
        />
      </div>
    );
  }

  const doc = material.data;
  const uploaded = formatUploadDate(doc.uploadedAt);
  const chunkHint = t(`ragInspector.metrics.chunksHint.${doc.processingStatus}`);

  return (
    <div className="flex items-start gap-5">
      {/* ── Left column ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="grid grid-cols-3 gap-5">
          <SummaryCard
            icon={Database}
            iconStrokeWidth={2}
            label={t("ragInspector.metrics.chunks")}
            value={doc.chunkCount ?? "—"}
            hint={chunkHint}
          />
          <SummaryCard
            icon={FileText}
            iconStrokeWidth={1.7}
            label={t("ragInspector.metrics.pages")}
            value="—"
            hint={t("ragInspector.metrics.pagesUnavailable")}
          />
          <SummaryCard
            icon={CloudUpload}
            iconStrokeWidth={1.088}
            label={t("ragInspector.metrics.size")}
            value={formatFileSize(doc.sizeBytes, t)}
            hint={t("ragInspector.metrics.sizeHint", { type: fileTypeOf(doc) })}
          />
        </div>

        {/* Indexed chunks: no backend API returns chunk texts yet. */}
        <SectionCard labelledBy="rag-chunks-title" gap="gap-4">
          <SectionHeading id="rag-chunks-title" title={t("ragInspector.chunks.title")} />
          <p className="text-[12px] leading-4 text-ink-secondary">{t("ragInspector.chunks.subtitle")}</p>
          <div className="flex justify-center">
            <StateCard
              tone="empty"
              icon={FileText}
              iconStrokeWidth={1.7}
              titleAs="h3"
              title={t("ragInspector.chunks.unavailableTitle")}
              description={t("ragInspector.chunks.unavailableDescription")}
            />
          </div>
        </SectionCard>

        {/* Other documents of the course (GET /courses/:id/materials). */}
        <OtherMaterials courseId={courseId} materialId={doc.id} result={materials} onRetry={reloadMaterials} />
      </div>

      {/* ── Right column ── */}
      <div className="flex w-[379px] shrink-0 flex-col gap-5">
        <SectionCard labelledBy="rag-info-title">
          <SectionHeading id="rag-info-title" title={t("ragInspector.info.title")} />
          <dl className="contents">
            <InfoRow label={t("ragInspector.info.file")}>
              <span className="block truncate" title={doc.originalFilename}>{doc.originalFilename}</span>
            </InfoRow>
            <InfoRow label={t("ragInspector.info.course")}>
              <CourseValue result={course} onRetry={reloadCourse} />
            </InfoRow>
            <InfoRow label={t("ragInspector.info.uploadedAt")}>{uploaded ?? "—"}</InfoRow>
          </dl>
          <ProcessingBadge status={toBadgeStatus(doc.processingStatus)} className="self-start">
            {t(`ragInspector.status.${doc.processingStatus}`)}
          </ProcessingBadge>
          {doc.processingStatus === "FAILED" && (
            <div role="alert" className="flex flex-col gap-0.5 rounded-eb-lg bg-error-bg px-3.5 py-3">
              <p className="text-[12px] leading-4 font-medium text-error-text">{t("ragInspector.info.processingError")}</p>
              <p className="text-[14px] leading-5 break-words text-ink">
                {doc.processingError ?? t("ragInspector.info.processingErrorUnknown")}
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard labelledBy="rag-ai-title">
          <SectionHeading id="rag-ai-title" title={t("ragInspector.howAiUses.title")} />
          <p className="text-[14px] leading-5 text-ink-secondary">{t("ragInspector.howAiUses.description")}</p>
          <AiOriginBadge type="draft" className="self-start">
            {t("ragInspector.howAiUses.badge")}
          </AiOriginBadge>
        </SectionCard>
      </div>
    </div>
  );
}

function CourseValue({ result, onRetry }: { result: Load<Course>; onRetry: () => void }) {
  const { t } = useTranslation();
  if (result.state === "loading") {
    return (
      <span className="flex h-5 items-center" role="status" aria-label={t("ragInspector.courseLoading")}>
        <SkeletonLine width={220} />
      </span>
    );
  }
  if (result.state === "error") {
    return (
      <span role="alert" className="flex items-center justify-between gap-3">
        <span className="font-normal text-error-text">
          {result.code ? t("ragInspector.courseErrorWithCode", { code: result.code }) : t("ragInspector.courseError")}
        </span>
        <Button variant="ghost" size="sm" leadingIcon={RotateCcw} onClick={onRetry}>
          {t("ragInspector.retry")}
        </Button>
      </span>
    );
  }
  const { courseCode, name } = result.data;
  return <>{courseCode ? `${courseCode} · ${name}` : name}</>;
}

function OtherMaterials({ courseId, materialId, result, onRetry }: { courseId: string; materialId: string; result: Load<TeachingMaterial[]>; onRetry: () => void }) {
  const { t } = useTranslation();
  const others = result.state === "ready" ? result.data.filter((item) => item.id !== materialId) : [];
  const title = result.state === "ready" ? t("ragInspector.others.title", { count: others.length }) : t("ragInspector.others.titleNoCount");

  let body: ReactNode;
  if (result.state === "loading") {
    body = (
      <SkeletonRegion label={t("ragInspector.others.loading")} className="flex flex-col gap-5">
        {[0, 1].map((i) => (
          <div key={i} className="flex h-[60px] items-center gap-3 rounded-eb-lg bg-canvas px-3.5">
            <SkeletonBlock width={36} height={36} className="rounded-eb-md bg-selected" />
            <SkeletonLine width={240} className="flex-none" />
            <span className="flex-1" />
            <SkeletonBadge width={48} className="bg-surface" />
          </div>
        ))}
      </SkeletonRegion>
    );
  } else if (result.state === "error") {
    body = (
      <ErrorState
        framed={false}
        title={t("ragInspector.others.errorTitle")}
        description={t("ragInspector.error.description")}
        onRetry={onRetry}
        errorCode={result.code}
        occurredAt={result.at}
      />
    );
  } else if (others.length === 0) {
    body = (
      <EmptyState framed={false} icon={FileText} iconStrokeWidth={1.7} title={t("ragInspector.others.empty")} className="self-center" />
    );
  } else {
    body = (
      <ul className="flex flex-col gap-5">
        {others.map((item) => (
          <li key={item.id}>
            <Link
              to={buildPath(PATHS.LECTURER.MATERIAL_SOURCES, { courseId, materialId: item.id })}
              className={cx("flex items-center gap-3 rounded-eb-lg bg-canvas px-3.5 py-3 transition-colors hover:bg-surface-hover", FOCUS_RING)}
            >
              <FileTile />
              <span className="min-w-0 flex-1 truncate text-[14px] leading-5 font-medium text-ink">{item.originalFilename}</span>
              <ProcessingBadge status={toBadgeStatus(item.processingStatus)}>
                {t(`ragInspector.status.${item.processingStatus}`)}
              </ProcessingBadge>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SectionCard labelledBy="rag-others-title">
      <SectionHeading id="rag-others-title" title={title} />
      {body}
    </SectionCard>
  );
}

/** Loading placeholder in the shape of the 02.7 content. */
function InspectorSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="flex items-start gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="grid grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex h-[148px] flex-col gap-3 rounded-eb-lg bg-surface p-5">
              <div className="flex items-center gap-3">
                <SkeletonBlock width={40} height={40} className="rounded-eb-md bg-selected" />
                <SkeletonLine width={80} />
              </div>
              <div className="flex h-7 items-center"><SkeletonLine width={56} /></div>
              <div className="flex h-4 items-center"><SkeletonLine width={140} size="sm" /></div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-eb-xl bg-surface p-5">
          <div className="flex h-6 items-center"><SkeletonLine width={200} /></div>
          <div className="flex h-4 items-center"><SkeletonLine width={260} size="sm" /></div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 rounded-eb-lg bg-canvas px-3.5 py-3">
              <SkeletonBlock width={36} height={36} className="rounded-eb-md bg-selected" />
              <div className="flex flex-1 flex-col gap-3 py-1">
                <SkeletonLine width={80} />
                <SkeletonLine width={60} size="sm" />
                <SkeletonLine width="90%" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-[379px] shrink-0 flex-col gap-5">
        <div className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5">
          <div className="flex h-6 items-center"><SkeletonLine width={140} /></div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <SkeletonLine width={48} size="sm" />
              <SkeletonLine width={220} />
            </div>
          ))}
          <SkeletonBadge width={56} />
        </div>
        <div className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5">
          <div className="flex h-6 items-center"><SkeletonLine width={160} /></div>
          <SkeletonLine size="sm" />
          <SkeletonLine size="sm" width="70%" />
        </div>
      </div>
    </SkeletonRegion>
  );
}
