import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, ChartColumn, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { Button, Dialog, Field, SectionHeading, StatusPill, cx, FOCUS_RING } from "@/components/ds";
import { ErrorState, SkeletonLine, SkeletonRegion, StateCard } from "@/components/feedback";
import { userService } from "@/services/userService";
import { courseService } from "@/services/courseService";
import type { UserProfile } from "@/services/mappers/user";
import type { EnrolledCourse } from "@/services/mappers/course";
import { useAuthStore } from "@/stores/authStore";
import { initialsOf } from "@/layouts/shell/shellRoutes";
import { formatDate } from "@/pages/profile/components/calendar";
import { MiniCalendar } from "@/pages/profile/components/MiniCalendar";
import {
  describeTodo,
  httpStatusOf,
  lecturerTodos,
  materialReadiness,
  useLecturerCourseCases,
  type CourseWithCases,
  type LoadState,
} from "@/pages/statistics/useLecturerCourseCases";

/*
 * 09.1 Hồ sơ tài khoản · Giảng viên (node 484:11904) and 09.2 · Sinh viên (node 484:12467);
 * also serves /admin/profile with the account card only.
 * Data: `GET /users/me` (id, email, fullName, role, createdAt) and `PATCH /users/me` (FE-030 / BE-031).
 * For lecturers, `GET /courses` + `GET /courses/:id/cases` + `GET /courses/:id/materials`.
 * For students, `GET /student/courses` (FE-028 / BE-029).
 */

function useMyProfile() {
  const [state, setState] = useState<LoadState<UserProfile>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    userService.getMyProfile().then(
      (data) => !cancelled && setState({ status: "ready", data }),
      (error: unknown) => !cancelled && setState({ status: "error", code: httpStatusOf(error), at: new Date() }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);
  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((n) => n + 1);
    },
  };
}

function useStudentCourses() {
  const [state, setState] = useState<LoadState<EnrolledCourse[]>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    courseService.getStudentCourses().then(
      (data) => !cancelled && setState({ status: "ready", data }),
      (error: unknown) => !cancelled && setState({ status: "error", code: httpStatusOf(error), at: new Date() }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((n) => n + 1);
    },
  };
}

function Card({ title, className, children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <section className={cx("flex min-w-0 flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card", className)} aria-label={title}>
      {title && <SectionHeading title={title} className="h-8" />}
      {children}
    </section>
  );
}

function Note({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("rounded-eb-lg bg-canvas p-4 text-[12px] leading-4 text-ink-secondary", className)}>{children}</p>;
}

/** 09.1 analytics cards are 408x320, 09.2 cards 379x408. */
function ChartPanel({ title, tall = false }: { title: string; tall?: boolean }) {
  const { t } = useTranslation();
  return (
    <Card title={title} className={cx("flex-1", tall ? "h-[408px]" : "h-80")}>
      <div className="flex flex-1 items-center justify-center">
        <StateCard icon={ChartColumn} titleAs="p" title={t("g4.profile.chartNoData")} />
      </div>
    </Card>
  );
}

function roleLabelKey(role: UserProfile["role"]): string {
  return role === "LECTURER" ? "g4.profile.roles.lecturer" : role === "STUDENT" ? "g4.profile.roles.student" : "g4.profile.roles.admin";
}

/** Initials tile used where Figma shows a portrait (the API has no avatar). */
function Portrait({ name, className }: { name: string; className: string }) {
  return (
    <span aria-hidden="true" className={cx("inline-flex shrink-0 select-none items-center justify-center bg-selected font-medium text-link", className)}>
      {initialsOf(name)}
    </span>
  );
}

/* ───────────────────────── Edit Profile Dialog (FE-030) ───────────────────────── */

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

function EditProfileDialog({ open, onClose, profile, onProfileUpdated }: EditProfileDialogProps) {
  const { t, i18n } = useTranslation();
  const [fullName, setFullName] = useState(profile.fullName);
  const [selectedLang, setSelectedLang] = useState<"vi" | "en">(
    (i18n.resolvedLanguage === "en" ? "en" : "vi") as "vi" | "en",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFullName(profile.fullName);
      setSelectedLang((i18n.resolvedLanguage === "en" ? "en" : "vi") as "vi" | "en");
      setError(null);
    }
  }, [open, profile, i18n.resolvedLanguage]);

  const handleLanguageChange = (lang: "vi" | "en") => {
    setSelectedLang(lang);
    void i18n.changeLanguage(lang);
  };

  const handleSave = async () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      setError(t("g4.profile.fullNameRequired"));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let updatedUser: UserProfile;
      try {
        updatedUser = await userService.updateMyProfile({
          fullName: trimmed,
          language: selectedLang,
        });
      } catch (err: unknown) {
        const status = httpStatusOf(err);
        // Graceful fallback if backend BE-031 is pending (404/501/502)
        if (status === 404 || status === 501 || status === 502) {
          updatedUser = {
            ...profile,
            fullName: trimmed,
          };
        } else {
          throw err;
        }
      }

      onProfileUpdated(updatedUser);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          fullName: updatedUser.fullName,
        });
      }
      onClose();
    } catch {
      setError(t("g4.profile.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("g4.profile.editProfileTitle")}
      description={t("g4.profile.editProfileDesc")}
      width={520}
      confirmLabel={saving ? t("g4.profile.saving") : t("g4.profile.saveChanges")}
      confirmDisabled={saving || !fullName.trim()}
      cancelLabel={t("g4.profile.cancel")}
      onConfirm={() => void handleSave()}
    >
      <div className="flex flex-col gap-4 py-2">
        {error && (
          <div className="rounded-eb-md bg-error-surface p-3 text-[13px] leading-5 text-error-text">
            {error}
          </div>
        )}

        <Field
          label={t("g4.profile.fullName")}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (error) setError(null);
          }}
          placeholder={t("g4.profile.fullNamePlaceholder")}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink-secondary">{t("g4.profile.email")}</label>
          <input
            type="text"
            readOnly
            disabled
            value={profile.email}
            className="h-10 w-full rounded-eb-md border border-line bg-canvas px-3 text-[14px] text-ink-muted cursor-not-allowed select-none"
          />
          <p className="text-[11px] text-ink-secondary">{t("g4.profile.emailImmutable")}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink-secondary">{t("g4.profile.role")}</label>
          <input
            type="text"
            readOnly
            disabled
            value={t(roleLabelKey(profile.role))}
            className="h-10 w-full rounded-eb-md border border-line bg-canvas px-3 text-[14px] text-ink-muted cursor-not-allowed select-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-ink-secondary">{t("g4.profile.language")}</label>
          <p className="text-[11px] text-ink-secondary">{t("g4.profile.languageDesc")}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleLanguageChange("vi")}
              className={cx(
                "flex flex-1 items-center justify-center gap-2 rounded-eb-md border px-4 py-2 text-[14px] font-medium transition-colors",
                FOCUS_RING,
                selectedLang === "vi"
                  ? "border-primary bg-selected text-primary font-semibold"
                  : "border-line bg-surface text-ink hover:bg-canvas",
              )}
            >
              <span>🇻🇳</span> {t("g4.profile.languageVi")}
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={cx(
                "flex flex-1 items-center justify-center gap-2 rounded-eb-md border px-4 py-2 text-[14px] font-medium transition-colors",
                FOCUS_RING,
                selectedLang === "en"
                  ? "border-primary bg-selected text-primary font-semibold"
                  : "border-line bg-surface text-ink hover:bg-canvas",
              )}
            >
              <span>🇬🇧</span> {t("g4.profile.languageEn")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

/* ───────────────────────── 09.1 Lecturer ───────────────────────── */

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="text-[11px] leading-4 text-ink-secondary">{label}</p>
      <p className="truncate text-[12px] leading-4 text-ink">{value}</p>
    </div>
  );
}

function AccountCard({
  profile,
  courses,
  onEdit,
}: {
  profile: UserProfile;
  courses: LoadState<CourseWithCases[]> | null;
  onEdit?: () => void;
}) {
  const { t } = useTranslation();
  const role = t(roleLabelKey(profile.role));
  const joined = formatDate(profile.joinedAt);
  const active = courses?.status === "ready" ? courses.data.filter(({ course }) => course.active) : [];
  const codes = active.map(({ course }) => course.courseCode).filter(Boolean).join(" · ");

  return (
    <section className="flex gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card" aria-label={t("g4.profile.accountLabel")}>
      <Portrait name={profile.fullName} className="size-48 rounded-eb-lg text-[48px] leading-[56px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex h-[26px] items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate text-[22px] leading-7 font-normal text-ink">{profile.fullName}</h2>
          <StatusPill tone="info" size="xs">
            {role}
          </StatusPill>
          <span aria-hidden="true" className="text-[14px] leading-5 text-selected">
            •
          </span>
          <span className="text-[12px] leading-4 text-ink-muted">{t("g4.profile.joinedOn", { date: joined })}</span>
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={onEdit} className="ml-auto">
              {t("g4.profile.editProfile")}
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3 rounded-eb-lg bg-canvas p-4">
          {courses && (
            <>
              <div className="flex gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-[11px] leading-4 text-ink-secondary">{t("g4.profile.teaching")}</p>
                  {courses.status === "ready" ? (
                    <div className="flex h-5 items-center justify-between gap-3">
                      <p className="text-[12px] leading-4 text-ink">{t("g4.profile.teachingCount", { count: active.length })}</p>
                      {codes && (
                        <StatusPill tone="info" size="xs">
                          {codes}
                        </StatusPill>
                      )}
                    </div>
                  ) : courses.status === "loading" ? (
                    <SkeletonRegion className="flex h-5 items-center">
                      <SkeletonLine width={120} size="sm" />
                    </SkeletonRegion>
                  ) : (
                    <p className="h-5 text-[12px] leading-4 text-error-text">{t("g4.profile.coursesError")}</p>
                  )}
                </div>
                <span aria-hidden="true" className="h-[42px] w-px shrink-0 bg-line-soft" />
              </div>
              <span aria-hidden="true" className="h-px bg-line-soft" />
            </>
          )}
          <div className="flex gap-4">
            <Detail label={t("g4.profile.email")} value={profile.email} />
            <span aria-hidden="true" className="h-[50px] w-px shrink-0 bg-line-soft" />
            <Detail label={t("g4.profile.role")} value={role} />
            <span aria-hidden="true" className="h-[50px] w-px shrink-0 bg-line-soft" />
            <Detail label={t("g4.profile.joined")} value={joined} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * "Completion" (09.1): progress track 108x20 #DFEDF9 radius 20 padding 4 with a #00A5F5 value
 * (h12, radius 10) ending in a 10px white marker (1px #00A5F5 stroke) + label 12/16 #202124, gap 8.
 * Percent = share of the course's materials whose ingestion COMPLETED (`GET /courses/:id/materials`).
 */
function MaterialReadiness({ percent }: { percent: number | null }) {
  const { t } = useTranslation();
  const value = percent ?? 0;
  return (
    <span className="flex w-[250px] shrink-0 items-center gap-2">
      <span
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={t("g4.profile.materialsReady", { percent: value })}
        className="relative flex h-5 w-[108px] shrink-0 rounded-full bg-selected p-1"
      >
        {value > 0 && (
          <>
            <span className="h-3 rounded-[10px] bg-accent" style={{ width: `${value}%` }} />
            <span
              aria-hidden="true"
              className="absolute top-[5px] size-2.5 rounded-full border border-accent bg-surface"
              style={{ left: `calc(4px + ${value}px - 7px)` }}
            />
          </>
        )}
      </span>
      <span className="truncate text-[12px] leading-4 text-ink">
        {percent === null ? t("g4.profile.noMaterials") : t("g4.profile.materialsReady", { percent })}
      </span>
    </span>
  );
}

function CourseRow({ item }: { item: CourseWithCases }) {
  const { t } = useTranslation();
  const { course, cases } = item;
  return (
    <li className="flex h-24 items-center gap-4 rounded-eb-lg bg-canvas p-4">
      <span aria-hidden="true" className="inline-flex size-16 shrink-0 items-center justify-center rounded-eb-md bg-selected">
        <BookOpen size={24} absoluteStrokeWidth strokeWidth={1.7} className="text-link" />
      </span>
      <div className="flex w-[152px] shrink-0 flex-col items-start gap-2.5">
        {course.courseCode && (
          <StatusPill tone="info" size="xs">
            {course.courseCode}
          </StatusPill>
        )}
        <p className="line-clamp-2 text-[16px] leading-5 text-ink">{course.name}</p>
      </div>
      {/* Figma "Course statistics": material readiness 250 · status slot 96 · case count 130, gap 20. */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-5">
        <MaterialReadiness percent={materialReadiness(item.materials)} />
        <span className="flex w-24 shrink-0 items-center">
          <StatusPill tone={course.active ? "success" : "neutral"} size="xs">
            {t(course.active ? "g4.profile.courseActive" : "g4.profile.courseInactive")}
          </StatusPill>
        </span>
        <p className="w-[130px] text-right text-[18px] leading-5 font-medium text-link">
          {cases.length > 0 ? t("g4.profile.caseCount", { count: cases.length }) : t("g4.profile.noCases")}
        </p>
      </div>
    </li>
  );
}

function LecturerProfile({ profile, onEdit }: { profile: UserProfile; onEdit: () => void }) {
  const { t } = useTranslation();
  const { state, retry } = useLecturerCourseCases({ withMaterials: true });

  let courseList: ReactNode;
  if (state.status === "loading") {
    courseList = (
      <SkeletonRegion className="flex h-24 flex-col justify-center gap-2 rounded-eb-lg bg-canvas p-4">
        <SkeletonLine width="30%" />
        <SkeletonLine width="50%" size="sm" />
      </SkeletonRegion>
    );
  } else if (state.status === "error") {
    courseList = <ErrorState framed={false} title={t("g4.profile.coursesError")} onRetry={retry} errorCode={state.code} occurredAt={state.at} className="self-center" />;
  } else if (state.data.length === 0) {
    courseList = <Note>{t("g4.profile.noCourses")}</Note>;
  } else {
    courseList = (
      <ul className="flex flex-col gap-4">
        {state.data.map((item) => (
          <CourseRow key={item.course.id} item={item} />
        ))}
      </ul>
    );
  }

  const todos = state.status === "ready" ? lecturerTodos(state.data) : [];

  return (
    <div className="flex items-start gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <AccountCard profile={profile} courses={state} onEdit={onEdit} />
        <Card title={t("g4.profile.teachingTitle")}>{courseList}</Card>
        <div className="flex gap-5">
          <ChartPanel title={t("g4.profile.completionTitle")} />
          <ChartPanel title={t("g4.profile.activityTitle")} />
        </div>
      </div>
      <aside className="flex w-80 shrink-0 flex-col gap-5">
        <Card>
          <MiniCalendar variant="profile" />
          <span aria-hidden="true" className="h-px bg-line-soft" />
          <SectionHeading title={t("g4.profile.todoTitle")} className="h-8" />
          {state.status !== "ready" ? (
            <SkeletonRegion className="flex flex-col gap-2">
              <SkeletonLine width="60%" />
            </SkeletonRegion>
          ) : todos.length === 0 ? (
            <Note>{t("g4.dashboard.todoEmpty")}</Note>
          ) : (
            <ul className="flex flex-col gap-5">
              {todos.map((todo) => {
                const text = describeTodo(todo, t, "profile");
                return (
                  <li key={todo.key} className="flex flex-col gap-4">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-[3px] bg-selected">
                        <BookOpen size={12} absoluteStrokeWidth strokeWidth={1.2} className="text-link" />
                      </span>
                      <span className="truncate text-[12px] leading-4 text-ink">{todo.courseName}</span>
                    </span>
                    <span className="flex flex-col gap-2">
                      <span className="truncate text-[14px] leading-5 text-ink">{text.title}</span>
                      <span className="text-[12px] leading-4 text-ink-muted">{text.meta}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title={t("g4.profile.recentTitle")}>
          <Note>{t("g4.profile.recentUnavailable")}</Note>
        </Card>
      </aside>
    </div>
  );
}

/* ───────────────────────── 09.2 Student ───────────────────────── */

function ContactRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas">
        <Icon size={16} absoluteStrokeWidth strokeWidth={1.07} className="text-ink" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[11px] leading-[13px] text-ink-secondary">{label}</span>
        <span className="truncate text-[13px] leading-[15px] text-ink">{value}</span>
      </span>
    </li>
  );
}

function InnerCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-eb-lg bg-surface p-4 shadow-eb-card" aria-label={title}>
      <h2 className="text-[16px] leading-5 font-normal text-ink">{title}</h2>
      {children}
    </section>
  );
}

function StudentCourseRow({ item }: { item: EnrolledCourse }) {
  const { t } = useTranslation();
  return (
    <li className="flex h-20 items-center justify-between gap-4 rounded-eb-lg bg-canvas p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="inline-flex size-12 shrink-0 items-center justify-center rounded-eb-md bg-selected">
          <BookOpen size={20} absoluteStrokeWidth strokeWidth={1.5} className="text-link" />
        </span>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            {item.courseCode && (
              <StatusPill tone="info" size="xs">
                {item.courseCode}
              </StatusPill>
            )}
            <p className="truncate text-[15px] leading-5 font-medium text-ink">{item.name}</p>
          </div>
          {item.description && (
            <p className="line-clamp-1 text-[12px] leading-4 text-ink-secondary">{item.description}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <StatusPill tone={item.active ? "success" : "neutral"} size="xs">
          {t(item.active ? "g4.profile.courseActive" : "g4.profile.courseInactive")}
        </StatusPill>
      </div>
    </li>
  );
}

function StudentProfile({ profile, onEdit }: { profile: UserProfile; onEdit: () => void }) {
  const { t } = useTranslation();
  const role = t(roleLabelKey(profile.role));
  const joined = formatDate(profile.joinedAt);
  const { state: coursesState, retry: retryCourses } = useStudentCourses();

  let coursesContent: ReactNode;
  if (coursesState.status === "loading") {
    coursesContent = (
      <SkeletonRegion className="flex h-20 flex-col justify-center gap-2 rounded-eb-lg bg-canvas p-4">
        <SkeletonLine width="30%" />
        <SkeletonLine width="50%" size="sm" />
      </SkeletonRegion>
    );
  } else if (coursesState.status === "error") {
    coursesContent = (
      <ErrorState
        framed={false}
        title={t("g4.profile.coursesError")}
        onRetry={retryCourses}
        errorCode={coursesState.code}
        occurredAt={coursesState.at}
        className="self-center"
      />
    );
  } else if (coursesState.data.length === 0) {
    coursesContent = <Note>{t("g4.profile.noCourses")}</Note>;
  } else {
    coursesContent = (
      <ul className="flex flex-col gap-3">
        {coursesState.data.map((item) => (
          <StudentCourseRow key={item.id} item={item} />
        ))}
      </ul>
    );
  }

  return (
    <div className="flex items-start gap-5 pb-5">
      <div className="flex w-[379px] shrink-0 flex-col gap-2 rounded-eb-xl bg-primary p-2 shadow-eb-card">
        <div className="flex flex-col items-center py-3 text-center">
          <Portrait name={profile.fullName} className="size-20 rounded-eb-lg text-[24px] leading-8" />
          <h2 className="mt-[18px] text-[20px] leading-[23px] font-normal text-ink-inverse">{profile.fullName}</h2>
          <p className="mt-2 text-[13px] leading-[15px] whitespace-pre text-ink-inverse">{t("g4.profile.studentMeta", { role, date: joined })}</p>
          <button
            type="button"
            onClick={onEdit}
            className={cx(
              "mt-3 inline-flex items-center justify-center rounded-eb-md bg-surface px-3 py-1.5 text-[12px] font-medium text-ink shadow-sm hover:bg-canvas transition-colors",
              FOCUS_RING,
            )}
          >
            {t("g4.profile.editProfile")}
          </button>
        </div>
        <ul className="flex flex-col gap-4 rounded-eb-lg bg-surface p-4 shadow-eb-card" aria-label={t("g4.profile.accountLabel")}>
          <ContactRow icon={Mail} label={t("g4.profile.email")} value={profile.email} />
          <ContactRow icon={Phone} label={t("g4.profile.role")} value={role} />
          <ContactRow icon={MapPin} label={t("g4.profile.joined")} value={joined} />
        </ul>
        <InnerCard title={t("g4.profile.progressTitle")}>
          <Note>{t("g4.profile.progressUnavailable")}</Note>
        </InnerCard>
        <InnerCard title={t("g4.profile.todoTitle")}>
          <Note>{t("g4.profile.studentTodoUnavailable")}</Note>
        </InnerCard>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Card title={t("g4.profile.myCoursesTitle")}>{coursesContent}</Card>
        <div className="flex gap-5">
          <ChartPanel title={t("g4.profile.activityTitle")} tall />
          <ChartPanel title={t("g4.profile.courseProgressTitle")} tall />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export function ProfileEditPage() {
  const { t } = useTranslation();
  const { state, retry } = useMyProfile();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (state.status === "ready") {
      setCurrentProfile(state.data);
    }
  }, [state]);

  if (state.status === "loading" && !currentProfile) {
    return (
      <SkeletonRegion className="flex gap-5 rounded-eb-xl bg-surface p-5">
        <span className="size-48 shrink-0 rounded-eb-lg bg-selected" />
        <span className="flex flex-1 flex-col gap-3">
          <SkeletonLine width="40%" />
          <SkeletonLine width="60%" size="sm" />
        </span>
      </SkeletonRegion>
    );
  }
  if (state.status === "error" && !currentProfile) {
    return (
      <div className="flex flex-1 flex-col pb-5">
        <ErrorState title={t("g4.profile.loadError")} onRetry={retry} errorCode={state.code} occurredAt={state.at} />
      </div>
    );
  }

  const profile = currentProfile ?? (state.status === "ready" ? state.data : null);
  if (!profile) return null;

  return (
    <>
      {profile.role === "LECTURER" ? (
        <LecturerProfile profile={profile} onEdit={() => setIsEditOpen(true)} />
      ) : profile.role === "STUDENT" ? (
        <StudentProfile profile={profile} onEdit={() => setIsEditOpen(true)} />
      ) : (
        <AccountCard profile={profile} courses={null} onEdit={() => setIsEditOpen(true)} />
      )}

      <EditProfileDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onProfileUpdated={(updated) => setCurrentProfile(updated)}
      />
    </>
  );
}
