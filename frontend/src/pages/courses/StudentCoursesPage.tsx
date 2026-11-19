/**
 * Student · "Khóa học của tôi" — Figma 07.3, with the "Tham gia lớp học" dialog 07.4 (?join=true).
 *
 * Real data: GET /student/courses returns enrolled courses for the authenticated student.
 * Joining: POST /courses/enroll with { inviteCode }.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { BookOpen, Calendar, ChevronRight, KeyRound, School, X } from "lucide-react";
import { Button, Dialog, Field, Toast, cx, FOCUS_RING } from "@/components/ds";
import { EmptyState, ErrorState } from "@/components/feedback";
import { PATHS, buildPath, withQuery } from "@/routes/paths";
import { Card, CardTitle } from "@/pages/branching/components/parts";
import { courseService } from "@/services/courseService";
import type { EnrolledCourse } from "@/services/mappers/course";

export function StudentCoursesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const joinOpen = params.get("join") === "true";

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getStudentCourses();
      setCourses(data);
    } catch {
      setError(t("g5.courses.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
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

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setJoinError(t("g5.courses.error.invalidCode"));
      return;
    }

    setJoining(true);
    setJoinError(null);
    try {
      const enrolled = await courseService.enrollCourse(trimmed);
      setCourses((prev) => [enrolled, ...prev.filter((c) => c.id !== enrolled.id)]);
      closeJoin();
      setToastMessage(t("g5.courses.joinSuccess"));
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        if (status === 400) {
          setJoinError(t("g5.courses.error.invalidCode"));
        } else if (status === 404) {
          setJoinError(t("g5.courses.error.notFound"));
        } else if (status === 409) {
          if (msg === "Course is archived") {
            setJoinError(t("g5.courses.error.archived"));
          } else {
            setJoinError(t("g5.courses.error.alreadyEnrolled"));
          }
        } else if (status === 410) {
          setJoinError(t("g5.courses.error.disabled"));
        } else {
          setJoinError(t("g5.courses.error.generic"));
        }
      } else {
        setJoinError(t("g5.courses.error.generic"));
      }
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {toastMessage && (
        <Toast
          type="success"
          title={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <Card className="gap-5">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="py-1">{t("g5.courses.listTitle")}</CardTitle>
          <Button size="sm" leadingIcon={KeyRound} iconStrokeWidth={1.36} onClick={openJoin}>
            {t("g5.courses.join")}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 animate-pulse rounded-eb-lg bg-surface-muted" />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title={t("states.serverError.title")}
            description={error}
            onRetry={loadCourses}
            className="self-center"
          />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            framed={false}
            title={t("g5.courses.emptyTitle")}
            description={t("g5.courses.emptyBody")}
            action={{ label: t("g5.courses.join"), onClick: openJoin }}
            className="self-center"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between rounded-eb-lg border border-line bg-surface p-5 transition-shadow hover:shadow-eb-card"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-eb-md bg-selected text-link">
                      <School size={20} />
                    </span>
                    {course.courseCode && (
                      <span className="rounded-eb-xs bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                        {course.courseCode}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-[16px] leading-6 font-medium text-ink" title={course.name}>
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-secondary">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  {course.enrolledAt ? (
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <Calendar size={13} />
                      {t("g5.courses.enrolledAt", { date: formatDate(course.enrolledAt) })}
                    </span>
                  ) : (
                    <span />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    trailingIcon={ChevronRight}
                    to={buildPath(PATHS.STUDENT.DESK)}
                  >
                    {t("g5.courses.viewCases")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog
        open={joinOpen}
        onClose={closeJoin}
        title={t("g5.courses.joinTitle")}
        description={t("g5.courses.joinDescription")}
        actions={
          <>
            <Button variant="secondary" size="md" onClick={closeJoin} disabled={joining}>
              {t("g5.common.cancel")}
            </Button>
            <Button size="md" onClick={handleJoinSubmit} disabled={joining || !code.trim()}>
              {t("g5.courses.joinSubmit")}
            </Button>
          </>
        }
      >
        <button
          type="button"
          onClick={closeJoin}
          aria-label={t("g5.common.close")}
          className={cx("absolute top-6 right-6 flex size-5 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary", FOCUS_RING)}
        >
          <X aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.33} />
        </button>

        <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3 pt-2">
          {joinError && (
            <div
              role="alert"
              className="rounded-eb-sm border border-error-border bg-error-bg p-3 text-[13px] leading-5 text-error-text"
            >
              {joinError}
            </div>
          )}
          <Field
            label={t("g5.courses.codeLabel")}
            leadingIcon={KeyRound}
            iconStrokeWidth={1.36}
            placeholder={t("g5.courses.codePlaceholder")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={32}
            autoFocus
            required
          />
        </form>
      </Dialog>
    </div>
  );
}
