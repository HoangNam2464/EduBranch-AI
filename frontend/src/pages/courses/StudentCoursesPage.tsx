/**
 * Student · "Khóa học của tôi" — Figma 07.3, with the "Tham gia lớp học" dialog 07.4 (?join=true).
 *
 * Gap (reported, not faked): the database has no enrolment table and the gateway no
 * "my courses" / "join by class code" endpoint (GET /courses is LECTURER-only). The list
 * therefore shows its empty state, the two summary cards (cases per course, lecturers) are not
 * rendered, and the join dialog cannot submit a code.
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, KeyRound, X } from "lucide-react";
import { Button, Dialog, Field, cx, FOCUS_RING } from "@/components/ds";
import { EmptyState } from "@/components/feedback";
import { PATHS, withQuery } from "@/routes/paths";
import { Card, CardTitle } from "@/pages/branching/components/parts";

export function StudentCoursesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const joinOpen = params.get("join") === "true";
  const [code, setCode] = useState("");

  const openJoin = () => navigate(withQuery(PATHS.STUDENT.COURSES, { join: true }));
  const closeJoin = () => navigate(PATHS.STUDENT.COURSES);

  return (
    <div className="flex flex-col gap-5">
      <Card className="gap-5">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="py-1">{t("g5.courses.listTitle")}</CardTitle>
          <Button size="sm" leadingIcon={KeyRound} iconStrokeWidth={1.36} onClick={openJoin}>
            {t("g5.courses.join")}
          </Button>
        </div>
        <EmptyState icon={BookOpen} framed={false} title={t("g5.courses.emptyTitle")} description={t("g5.courses.emptyBody")} className="self-center" />
      </Card>

      <Dialog
        open={joinOpen}
        onClose={closeJoin}
        title={t("g5.courses.joinTitle")}
        description={t("g5.courses.joinDescription")}
        actions={
          <>
            <Button variant="secondary" size="md" onClick={closeJoin}>
              {t("g5.common.cancel")}
            </Button>
            <Button size="md" disabled aria-describedby="join-unavailable">
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
        <Field
          className="pt-2"
          label={t("g5.courses.codeLabel")}
          leadingIcon={KeyRound}
          iconStrokeWidth={1.36}
          placeholder={t("g5.courses.codePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={20}
          required
          helper={<span id="join-unavailable">{t("g5.courses.joinUnavailable")}</span>}
        />
      </Dialog>
    </div>
  );
}
