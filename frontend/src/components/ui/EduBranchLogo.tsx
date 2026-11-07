import React from "react";

interface EduBranchLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export function EduBranchLogo({
  size = 32,
  className = "",
  showText = false,
  subtitle,
}: EduBranchLogoProps) {
  const iconSize = Math.max(16, Math.round(size * 0.55));

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Figma Canonical Brand Symbol: GitBranch on blue tile */}
      <div
        className="flex items-center justify-center rounded-lg bg-[#2563EB] text-white shrink-0 select-none shadow-xs"
        style={{ width: size, height: size }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-semibold text-gray-900 tracking-tight leading-tight block">
            EduBranch AI
          </span>
          {subtitle && (
            <span className="text-xs font-normal text-gray-500 mt-0.5 block">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
