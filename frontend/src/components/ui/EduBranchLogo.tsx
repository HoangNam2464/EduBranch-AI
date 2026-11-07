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
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.svg"
        alt="EduBranch AI"
        width={size}
        height={size}
        className="rounded-lg object-contain shadow-2xs shrink-0 select-none"
        style={{ width: size, height: size }}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-none block">
            EduBranch AI
          </span>
          {subtitle && (
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

