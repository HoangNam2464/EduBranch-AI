import type { ReactNode } from "react";

/** Inline form message (no ds/feedback inline-alert component exists yet); token colours only. */
const FORM_MESSAGE_TONES = {
  error: "border-error-border bg-error-bg text-error-text",
  info: "border-primary-subtle-hover bg-info-bg text-info",
} as const;

export type FormMessageTone = keyof typeof FORM_MESSAGE_TONES;

/** Shared by the auth forms (00.3 / 00.4 / 00.5 / 10.1): error → role alert, info → role status. */
export function FormMessage({ tone, children }: { tone: FormMessageTone; children: ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-eb-md border p-4 text-sm ${FORM_MESSAGE_TONES[tone]}`}>
      {children}
    </p>
  );
}
