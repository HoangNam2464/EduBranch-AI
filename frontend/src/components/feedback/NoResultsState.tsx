import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, type LucideIcon } from "lucide-react";
import { StateCard, StatePanel } from "@/components/feedback/StateCard";

/**
 * 01.8 — search returned nothing.
 * Card tone "empty": icon box #DFEDF9, Icon/search 20 stroke 1.6 #2A4E7F,
 * Secondary SM "Xóa tìm kiếm" with Icon/x (stroke 1.33, #202124).
 * Description quotes the keyword with typographic quotes: “Blockchain”.
 */
export interface NoResultsStateProps {
  /** The search keyword, shown inside the description. */
  keyword: string;
  /** Shows the "Xóa tìm kiếm" button when provided. */
  onClear?: () => void;
  /** Defaults to `states.noResults.title`. */
  title?: ReactNode;
  /** Defaults to `states.noResults.description` with the keyword interpolated. */
  description?: ReactNode;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  /** Wrap the card in the "List state" panel (default true). */
  framed?: boolean;
  className?: string;
}

export function NoResultsState({
  keyword,
  onClear,
  title,
  description,
  icon = Search,
  iconStrokeWidth = 1.6,
  framed = true,
  className = "",
}: NoResultsStateProps) {
  const { t } = useTranslation();
  const card = (
    <StateCard
      tone="empty"
      icon={icon}
      iconStrokeWidth={iconStrokeWidth}
      title={title ?? t("states.noResults.title")}
      description={description ?? t("states.noResults.description", { keyword })}
      actionVariant="secondary"
      action={
        onClear
          ? { label: t("states.noResults.clear"), icon: X, iconStrokeWidth: 1.33, onClick: onClear }
          : undefined
      }
      className={framed ? "" : className}
    />
  );

  if (!framed) return <div role="status">{card}</div>;
  return (
    <StatePanel role="status" className={className}>
      {card}
    </StatePanel>
  );
}
