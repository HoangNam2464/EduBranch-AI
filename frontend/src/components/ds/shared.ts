/** Helpers shared by the design-system components (Figma page 02 / page 08). */

/** Joins class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Visible keyboard focus used by every interactive DS element. */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
