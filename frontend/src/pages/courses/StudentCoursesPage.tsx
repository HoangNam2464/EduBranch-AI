/**
 * Student · "Khóa học của tôi" — Figma 07.3, with "Tham gia lớp học" dialog (07.4).
 *
 * FE-028 / Jira: EBA-92 / OPD-001 -> A:
 * - AC-1: Chỉ hiển thị các khóa học sinh viên đã tham gia và các case ở trạng thái PUBLISHED.
 * - AC-2: Tham gia lớp học bằng mã mời gọi API BE-029; hiển thị thông báo lỗi rõ ràng
 *         khi mã sai (404/400), hết hạn (410), hoặc đã tham gia (409).
 * - AC-3: Tuyệt đối không cho phép duyệt hoặc tìm kiếm khóa học mà sinh viên chưa tham gia.
 * - AC-4: Hỗ trợ đầy đủ trạng thái Loading (Skeleton), EmptyState và ErrorState.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, KeyRound, AlertCircle, X, FolderKanban } from "lucide-react";
import { Button, Dialog, Field, cx, FOCUS_RING } from "@/components/ds";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/feedback";
import { PATHS, withQuery } from "@/routes/paths";
import { Card, CardTitle } from "@/pages/branching/components/parts";
import { courseService } from "@/services/courseService";
import type { Course } from "@/types";

export function StudentCoursesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const joinOpen = params.get("join") === "true";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Join Class Modal states
  const [code, setCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getStudentCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err?.message || t("g5.courses.errorTitle"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEnrolledCourses();
  }, []);

  const openJoin = () => {
    setJoinError(null);
    setCode("");
    navigate(withQuery(PATHS.STUDENT.COURSES, { join: true }));
  };

  const closeJoin = () => {
    setJoinError(null);
    setCode("");
    navigate(PATHS.STUDENT.COURSES);
  };

  const handleJoinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setJoinError(t("g5.courses.joinErrorInvalid"));
      return;
    }

    setJoinLoading(true);
    setJoinError(null);

    try {
      await courseService.joinCourseByInviteCode(trimmed);
      closeJoin();
      await fetchEnrolledCourses();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 400) {
        setJoinError(t("g5.courses.joinErrorInvalid"));
      } else if (status === 410) {
        setJoinError(t("g5.courses.joinErrorExpired"));
      } else if (status === 409) {
        setJoinError(t("g5.courses.joinErrorAlreadyJoined"));
      } else {
        setJoinError(t("g5.courses.joinErrorGeneric"));
      }
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Action */}
      <Card className="gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="py-1">{t("g5.courses.listTitle")}</CardTitle>
            <p className="text-[13px] leading-5 text-ink-secondary">
              {t("g5.courses.enrolledSummary", { count: courses.length })}
            </p>
          </div>
          <Button size="sm" leadingIcon={KeyRound} iconStrokeWidth={1.36} onClick={openJoin}>
            {t("g5.courses.join")}
          </Button>
        </div>

        {/* Content Body: Loading vs Error vs Empty vs List */}
        {loading ? (
          <div className="flex flex-col gap-4 py-3">
            <SkeletonBlock className="h-24 w-full rounded-eb-lg" />
            <SkeletonBlock className="h-24 w-full rounded-eb-lg" />
            <SkeletonBlock className="h-24 w-full rounded-eb-lg" />
          </div>
        ) : error ? (
          <ErrorState
            icon={AlertCircle}
            title={t("g5.courses.errorTitle")}
            description={error}
            onRetry={fetchEnrolledCourses}
          />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            framed={false}
            title={t("g5.courses.emptyTitle")}
            description={t("g5.courses.emptyBody")}
            action={{
              label: t("g5.courses.join"),
              onClick: openJoin,
            }}
            className="self-center py-6"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-eb-lg border border-line-subtle bg-surface p-4 shadow-xs transition-shadow hover:shadow-eb-card"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-eb-xs bg-accent-subtle px-2 py-0.5 text-[11px] font-semibold text-accent-text">
                      {c.courseCode || t("g5.courses.courseCode", { code: c.id.slice(0, 6).toUpperCase() })}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-ink line-clamp-1">{c.name}</h3>
                  {c.description && (
                    <p className="text-[13px] leading-5 text-ink-secondary line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3">
                  <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
                    <FolderKanban size={14} className="text-accent" />
                    {t("g5.courses.publishedCases")}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    to={withQuery(PATHS.STUDENT.DESK, { courseId: c.id })}
                  >
                    {t("g5.courses.viewCases")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Join Class by Invite Code Dialog (Figma 07.4) */}
      <Dialog
        open={joinOpen}
        onClose={closeJoin}
        width={480}
        title={t("g5.courses.joinTitle")}
        description={t("g5.courses.joinDescription")}
        actions={
          <>
            <Button variant="secondary" size="md" disabled={joinLoading} onClick={closeJoin}>
              {t("g5.common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!code.trim() || joinLoading}
              onClick={() => void handleJoinSubmit()}
            >
              {joinLoading ? t("g5.courses.joinLoading") : t("g5.courses.joinSubmit")}
            </Button>
          </>
        }
      >
        <button
          type="button"
          onClick={closeJoin}
          aria-label={t("g5.common.close")}
          className={cx(
            "absolute top-6 right-6 flex size-5 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary hover:text-ink",
            FOCUS_RING
          )}
        >
          <X aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.33} />
        </button>

        <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4 pt-3">
          <Field
            label={t("g5.courses.codeLabel")}
            placeholder={t("g5.courses.codePlaceholder")}
            value={code}
            disabled={joinLoading}
            onChange={(e) => {
              setJoinError(null);
              setCode(e.target.value.toUpperCase());
            }}
            autoFocus
          />

          {joinError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-eb-md bg-error-bg p-3 text-[13px] leading-5 text-error-text"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{joinError}</span>
            </div>
          )}
        </form>
      </Dialog>
    </div>
  );
}
