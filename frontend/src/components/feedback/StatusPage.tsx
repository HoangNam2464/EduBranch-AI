import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { StateButton, type StateAction } from "@/components/feedback/StateButton";

/**
 * Full-page status layout of frames 01.4 (403), 01.5 (404) and 01.7 (500).
 * No sidebar, header, footer or logo. White page; the "Status page" block is
 * centred: 640 wide, radius 18, padding 96 top/bottom and 40 left/right, gap 16.
 *  - Icon tile 72x72, radius 18, icon 32px (tone sets fill + stroke colour)
 *  - Code: Roboto Medium 28/36 #2A4E7F
 *  - Title: Roboto Regular 20/28 #202124
 *  - Description: Roboto Regular 14/20 #696A70, 520 wide, centred
 *  - Optional meta line: Roboto Regular 12/16 #909198 (404 path, 500 incident id)
 *  - Actions row gap 12: Secondary MD then Primary MD (height 40, padding 0 16)
 *  - Optional help line: Roboto Regular 12/16 #909198 with the support mailbox
 */
export type StatusTone = "warning" | "info" | "error";

const toneStyles: Record<StatusTone, { tile: string; icon: string }> = {
  /* 403: tile #FFF1DE, Icon/lock stroke #B86800 (no token for this shade). */
  warning: { tile: "bg-warning-bg", icon: "text-[#B86800]" },
  /* 404: tile #DFEDF9, Icon/compass stroke #2A4E7F. */
  info: { tile: "bg-selected", icon: "text-primary" },
  /* 500: tile #FFE5E5, Icon/circle-alert stroke #D11F1F. */
  error: { tile: "bg-error-bg", icon: "text-error-text" },
};

export interface StatusPageProps {
  icon: LucideIcon;
  /** Icon stroke in px as measured in Figma. */
  iconStrokeWidth?: number;
  tone: StatusTone;
  code: string;
  title: ReactNode;
  description: ReactNode;
  meta?: ReactNode;
  secondaryAction?: StateAction;
  primaryAction?: StateAction;
  help?: ReactNode;
}

export function StatusPage({
  icon: Icon,
  iconStrokeWidth = 1.5,
  tone,
  code,
  title,
  description,
  meta,
  secondaryAction,
  primaryAction,
  help,
}: StatusPageProps) {
  const styles = toneStyles[tone];
  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-5 pt-2">
      <div className="flex w-[640px] max-w-full flex-col items-center gap-4 rounded-eb-xl px-10 py-24">
        <div className={`flex size-[72px] shrink-0 items-center justify-center rounded-eb-xl ${styles.tile}`}>
          <Icon aria-hidden="true" size={32} absoluteStrokeWidth strokeWidth={iconStrokeWidth} className={styles.icon} />
        </div>
        <p className="text-[28px] leading-9 font-medium text-primary">{code}</p>
        <h1 className="text-center text-xl leading-7 font-normal tracking-normal text-ink">{title}</h1>
        <p className="w-[520px] max-w-full text-center text-sm leading-5 text-ink-secondary">{description}</p>
        {meta && <p className="text-center text-[12px] leading-4 break-words text-ink-muted">{meta}</p>}
        {(secondaryAction || primaryAction) && (
          <div className="flex flex-wrap justify-center gap-3">
            {secondaryAction && <StateButton action={secondaryAction} variant="secondary" size="md" />}
            {primaryAction && <StateButton action={primaryAction} variant="primary" size="md" />}
          </div>
        )}
        {help && <p className="text-center text-[12px] leading-4 text-ink-muted">{help}</p>}
      </div>
    </main>
  );
}
