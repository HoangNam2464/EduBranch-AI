import { useTranslation } from "react-i18next";
import { PublicButton, cx } from "@/components/ds";
import { PATHS } from "@/routes/paths";
import { CardTitle, CheckList } from "@/pages/landing/landingShared";

/**
 * "Theo vai trò" (499:4861): row gap 24, padding 56 104 48 104. Two cards (fill, 400 tall,
 * radius 28, padding 48, gap 20): lecturer = white + 1px #E1E8F5, checks #2A4E7F, Primary button;
 * student = #DFEDF9, checks #00A5F5, Secondary button. Points have 4px top padding, the
 * action 12px top padding.
 */
interface RoleCopy {
  title: string;
  desc: string;
  points: string[];
  action: string;
}

export function RolesSection() {
  const { t } = useTranslation();
  const lecturer = t("g1.landing.roles.lecturer", { returnObjects: true }) as RoleCopy;
  const student = t("g1.landing.roles.student", { returnObjects: true }) as RoleCopy;
  return (
    <section className="w-full pt-14 pb-12">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 sm:px-8 lg:px-12">
        <RoleCard
          copy={lecturer}
          className="border border-line bg-surface shadow-eb-card hover:shadow-eb-hover transition-shadow"
          iconClassName="text-primary"
          variant="primary"
          to={`${PATHS.AUTH.REGISTER}?role=lecturer`}
        />
        <RoleCard
          copy={student}
          className="bg-primary-subtle shadow-eb-card hover:shadow-eb-hover transition-shadow"
          iconClassName="text-accent"
          variant="secondary"
          to={`${PATHS.AUTH.REGISTER}?role=student`}
        />
      </div>
    </section>
  );
}

function RoleCard({
  copy,
  className,
  iconClassName,
  variant,
  to,
}: {
  copy: RoleCopy;
  className: string;
  iconClassName: string;
  variant: "primary" | "secondary";
  to: string;
}) {
  return (
    <article className={cx("flex h-[400px] min-w-0 flex-1 flex-col gap-5 rounded-[28px] p-12", className)}>
      <CardTitle>{copy.title}</CardTitle>
      <p className="text-[15px] leading-6 font-normal text-ink-secondary">{copy.desc}</p>
      <CheckList items={copy.points} iconClassName={iconClassName} className="pt-1" />
      <div className="flex pt-3">
        <PublicButton variant={variant} to={to}>
          {copy.action}
        </PublicButton>
      </div>
    </article>
  );
}
