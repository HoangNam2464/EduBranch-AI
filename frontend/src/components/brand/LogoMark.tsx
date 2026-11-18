import { useId } from "react";

/**
 * EduBranch logo mark — exported 1:1 from Figma component `EB/Logo Mark`
 * (28×28, navy gradient tile with a white and a sky branch).
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const gradientId = `eb-logo-${useId().replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M21.6562 0H6.34375C2.84019 0 0 2.84019 0 6.34375V21.6562C0 25.1598 2.84019 28 6.34375 28H21.6562C25.1598 28 28 25.1598 28 21.6562V6.34375C28 2.84019 25.1598 0 21.6562 0Z"
        fill={`url(#${gradientId})`}
      />
      <path d="M14 22.4219V17.5C14 13.6719 18.4844 14.2188 18.4844 10.3906" stroke="#00A5F5" strokeWidth="3.0625" strokeLinecap="round" />
      <path d="M14 22.4219V17.5C14 13.125 9.51562 13.6719 9.51562 6.83594" stroke="white" strokeWidth="3.0625" strokeLinecap="round" />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A4E7F" />
          <stop offset="1" stopColor="#1B3253" />
        </linearGradient>
      </defs>
    </svg>
  );
}
