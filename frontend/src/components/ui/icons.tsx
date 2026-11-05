/**
 * EduBranch AI — Icon set (stroke icons, Lucide style, 24px grid).
 * The Figma Design System uses Lucide icons; these are the subset the MVP screens need.
 * Icons inherit `currentColor` and are decorative unless a `title` is given.
 */
import React from "react";

type IconProps = { size?: number; className?: string; title?: string; strokeWidth?: number };

function make(paths: React.ReactNode) {
  return function Icon({ size = 18, className = "", title, strokeWidth = 2 }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
      >
        {title && <title>{title}</title>}
        {paths}
      </svg>
    );
  };
}

export const IconBook = make(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>);
export const IconCases = make(<><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><circle cx="12" cy="13" r="2" /><path d="M12 15v3" /></>);
export const IconMessage = make(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);
export const IconChart = make(<><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>);
export const IconBell = make(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>);
export const IconHelp = make(<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>);
export const IconLogOut = make(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>);
export const IconPlus = make(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const IconUpload = make(<><path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></>);
export const IconFile = make(<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></>);
export const IconTrash = make(<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>);
export const IconRetry = make(<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>);
export const IconArrowRight = make(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>);
export const IconArrowLeft = make(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>);
export const IconBranch = make(<><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /><path d="M6 9v6" /></>);
export const IconSearch = make(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);
export const IconEdit = make(<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>);
export const IconX = make(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
export const IconCheck = make(<path d="M20 6 9 17l-5-5" />);
export const IconAlert = make(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>);
export const IconEye = make(<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>);
export const IconLock = make(<><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
export const IconMail = make(<><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>);
export const IconFileSearch = make(<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><path d="M14 2v6h6" /><circle cx="11.5" cy="14.5" r="2.5" /><path d="M13.3 16.3 15 18" /></>);
export const IconFlag = make(<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22v-7" /></>);
export const IconHistory = make(<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>);
export const IconLink = make(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>);
export const IconShield = make(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />);
export const IconCompass = make(<><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></>);

/** Brand mark used in the app shell (Figma "logo" tile: blue square with branch glyph). */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <IconBranch size={Math.round(size * 0.55)} strokeWidth={2.2} />
    </span>
  );
}
