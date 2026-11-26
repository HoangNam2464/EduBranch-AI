/** Shared classes for the 40×40 buttons in the shell header (Figma EB/Header Actions and 10.8 Back). */
export const HEADER_FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
export const HEADER_ICON_BUTTON = `relative flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-subtle text-primary hover:bg-primary-subtle-hover ${HEADER_FOCUS}`;
/** Figma 10.8 "Back": no fill at rest, ink chevron; hover/pressed surfaces from tokens. */
export const HEADER_BACK_BUTTON = `flex size-10 shrink-0 items-center justify-center rounded-[10px] text-ink hover:bg-surface-hover active:bg-selected ${HEADER_FOCUS}`;
