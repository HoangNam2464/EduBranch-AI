import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ds";
import { EmptyState } from "@/components/feedback";

/**
 * White section card of the admin screens (Figma page EduBranch AI – Screens, section 10).
 *  - "dashboard" (10.2): radius 16, padding 24, column gap 16; header "Titles" column gap 2:
 *    title Regular 16/24 #202124 + subtitle Regular 12/16 #909198.
 *  - "page" (10.5–10.10): radius 18, padding 20, column gap 20; title Regular 16/24 #202124.
 *    10.7 lists put a Regular 12/16 #696A70 subtitle 16px below the title (`subtitleTone="secondary"`).
 */
export interface AdminPanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  variant?: "dashboard" | "page";
  subtitleTone?: "muted" | "secondary";
  /** Column gap class when the instance differs from the variant default (gap-4 dashboard, gap-5 page). */
  gap?: string;
  className?: string;
  children?: ReactNode;
}

export function AdminPanel({
  title,
  subtitle,
  variant = "page",
  subtitleTone = "muted",
  gap,
  className,
  children,
}: AdminPanelProps) {
  const titleId = useId();
  const dashboard = variant === "dashboard";
  return (
    <section
      aria-labelledby={titleId}
      className={cx(
        "flex min-w-0 flex-col bg-surface shadow-eb-card",
        dashboard ? "rounded-[16px] p-6" : "rounded-eb-xl p-5",
        gap ?? (dashboard ? "gap-4" : "gap-5"),
        className,
      )}
    >
      {subtitle && subtitleTone === "muted" ? (
        <div className="flex flex-col gap-0.5">
          <h2 id={titleId} className="text-[16px] leading-6 font-normal tracking-normal text-ink">
            {title}
          </h2>
          <p className="text-[12px] leading-4 text-ink-muted">{subtitle}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 id={titleId} className="text-[16px] leading-6 font-normal tracking-normal text-ink">
            {title}
          </h2>
          {subtitle && <p className="text-[12px] leading-4 text-ink-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Body of a section whose data the backend does not provide yet: the shared
 * empty state (frame 01.2 card, unframed), centred in the remaining space.
 * Narrow cards pass no description (the state card keeps its text on one line).
 */
export interface AdminNoDataProps {
  icon: LucideIcon;
  title?: ReactNode;
  description?: ReactNode | false;
  className?: string;
}

export function AdminNoData({ icon, title, description, className }: AdminNoDataProps) {
  const { t } = useTranslation();
  return (
    <div className={cx("flex flex-1 items-center justify-center", className)}>
      <EmptyState
        framed={false}
        icon={icon}
        iconStrokeWidth={1.7}
        title={title ?? t("g6.noData.title")}
        description={description === false ? undefined : (description ?? t("g6.noData.description"))}
      />
    </div>
  );
}
