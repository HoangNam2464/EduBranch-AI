import type { ReactNode } from "react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Figma `EB/Social Sign-in` (page 05, node 538:347) — divider + Google / Microsoft buttons.
 *  - Column gap 20 (520 wide in the set; fills the auth card on page 08, frames 00.3–00.5)
 *  - Divider: 1px #E1E8F5 lines either side of a Roboto Regular 12/16 #909198 label, gap 12
 *  - Providers row gap 8; each button fills, #F3F6FC, radius 8, padding 10 16, gap 10,
 *    18px brand logo + Roboto Regular 14/20 #202124 label
 */
export interface SocialSignInProps {
  /** Divider text, e.g. "Hoặc". */
  dividerLabel: ReactNode;
  googleLabel: ReactNode;
  microsoftLabel: ReactNode;
  onGoogle?: () => void;
  onMicrosoft?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SocialSignIn({ dividerLabel, googleLabel, microsoftLabel, onGoogle, onMicrosoft, disabled, className }: SocialSignInProps) {
  return (
    <div className={cx("flex w-full flex-col gap-5", className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="text-[12px] leading-4 font-normal text-ink-muted">{dividerLabel}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
      <div className="flex gap-2">
        <ProviderButton logo={<GoogleLogo />} onClick={onGoogle} disabled={disabled}>
          {googleLabel}
        </ProviderButton>
        <ProviderButton logo={<MicrosoftLogo />} onClick={onMicrosoft} disabled={disabled}>
          {microsoftLabel}
        </ProviderButton>
      </div>
    </div>
  );
}

function ProviderButton({ logo, children, onClick, disabled }: { logo: ReactNode; children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-eb-md bg-canvas px-4 py-2.5 text-[14px] leading-5 font-normal text-ink transition-colors",
        "hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60",
        FOCUS_RING,
      )}
    >
      {logo}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}

/** Google "G", exported 1:1 from the Figma frame "Logo · Google" (18x18). */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false" className="shrink-0">
      <path d="M8.99996 3.5625C10.3275 3.5625 11.5162 4.02 12.4537 4.9125L15.0225 2.34375C13.4625 0.8925 11.4262 0 8.99996 0C5.48246 0 2.44121 2.0175 0.959961 4.9575L3.95246 7.27875C4.66121 5.145 6.65246 3.5625 8.99996 3.5625Z" fill="#EA4335" />
      <path d="M17.6175 9.20625C17.6175 8.6175 17.5612 8.0475 17.475 7.5H9V10.8825H13.8525C13.635 11.9925 13.005 12.9375 12.06 13.575L14.9588 15.825C16.65 14.2575 17.6175 11.94 17.6175 9.20625Z" fill="#4285F4" />
      <path d="M3.94875 10.7213C3.76875 10.1775 3.66375 9.6 3.66375 9C3.66375 8.4 3.765 7.8225 3.94875 7.27875L0.95625 4.9575C0.345 6.1725 0 7.545 0 9C0 10.455 0.345 11.8275 0.96 13.0425L3.94875 10.7213Z" fill="#FBBC05" />
      <path d="M8.99981 18C11.4298 18 13.4736 17.2012 14.9586 15.8212L12.0598 13.5712C11.2536 14.115 10.2148 14.4337 8.99981 14.4337C6.6523 14.4337 4.66105 12.8512 3.94855 10.7175L0.956055 13.0387C2.44105 15.9825 5.48231 18 8.99981 18Z" fill="#34A853" />
    </svg>
  );
}

/** Microsoft four squares, exported 1:1 from the Figma frame "Logo · Microsoft" (18x18). */
function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false" className="shrink-0">
      <path d="M8.57143 0H0V8.57143H8.57143V0Z" fill="#F25022" />
      <path d="M18.0001 0H9.42871V8.57143H18.0001V0Z" fill="#7FBA00" />
      <path d="M8.57143 9.42857H0V18H8.57143V9.42857Z" fill="#00A4EF" />
      <path d="M18.0001 9.42857H9.42871V18H18.0001V9.42857Z" fill="#FFB900" />
    </svg>
  );
}
