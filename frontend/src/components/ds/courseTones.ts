/** Course thumbnail fills seen on page EduBranch AI – Screens (02.1 Course Card / Course overview). */
export type CourseThumbnailTone = "subtle" | "primary" | "review";

/** subtle = bg/selected + text/link, primary = action/primary + white, review = mode/review-bg + mode/review-text. */
export const THUMBNAIL_TONES: Record<CourseThumbnailTone, { box: string; icon: string }> = {
  subtle: { box: "bg-selected", icon: "text-link" },
  primary: { box: "bg-primary", icon: "text-ink-inverse" },
  review: { box: "bg-mode-review-bg", icon: "text-mode-review-text" },
};
