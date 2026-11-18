import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "@/components/brand/LogoMark";
import { PublicButton } from "@/components/ds/PublicButton";
import { LanguageSwitcher } from "@/components/ds/LanguageSwitcher";
import { ThemeToggle } from "@/components/ds/ThemeToggle";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Figma `EB/Public Nav` (page 05, node 455:358) — Active None | "Cách hoạt động" | "Câu hỏi".
 *  - 1440x72, white, 1px bottom stroke #E1E8F5, padding 0 120, gap 40, items centred
 *  - Logo: EB/Logo Mark 32x32 + brand Roboto Medium 16/24 #202124, gap 10
 *  - Links gap 32: Roboto Regular 14/20 #696A70; the active link is Medium 14/20 #2A4E7F
 *  - Spacer fills; actions gap 12: EB/Button Ghost MD + Primary MD
 */
export interface PublicNavLink {
  label: ReactNode;
  /** Router path or in-page anchor ("#faq"). Anchors render as <a>. */
  to: string;
  active?: boolean;
}

export interface PublicNavAction {
  label: ReactNode;
  to?: string;
  onClick?: () => void;
}

export interface PublicNavProps {
  brandName: ReactNode;
  /** Where the logo goes (default "/"). */
  homeTo?: string;
  links: PublicNavLink[];
  /** Ghost action, e.g. "Đăng nhập". */
  secondaryAction?: PublicNavAction;
  /** Primary action, e.g. "Đăng ký". */
  primaryAction?: PublicNavAction;
  /** Accessible name of the <nav>. */
  ariaLabel?: string;
  className?: string;
}

export function PublicBrand({ brandName, homeTo = "/" }: { brandName: ReactNode; homeTo?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    if (window.location.pathname === homeTo) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      to={homeTo}
      onClick={handleClick}
      title="EduBranch AI — Về trang chủ"
      className={cx("flex shrink-0 items-center gap-2.5 rounded-eb-sm transition-opacity hover:opacity-90", FOCUS_RING)}
    >
      <LogoMark size={32} />
      <span className="text-[16px] leading-6 font-medium text-ink">{brandName}</span>
    </Link>
  );
}

function NavAnchor({ to, active, children, className }: { to: string; active?: boolean; children: ReactNode; className: string }) {
  if (to.startsWith("#") || /^[a-z]+:/i.test(to)) {
    return (
      <a href={to} aria-current={active ? "page" : undefined} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} aria-current={active ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}

export function PublicNav({ brandName, homeTo, links, secondaryAction, primaryAction, ariaLabel, className }: PublicNavProps) {
  return (
    <header className={cx("w-full border-b border-line bg-page", className)}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-10 px-6 sm:px-8 lg:px-12">
        <PublicBrand brandName={brandName} homeTo={homeTo} />
        <nav aria-label={ariaLabel} className="flex items-center gap-8">
          {links.map((link, index) => (
            <NavAnchor
              key={index}
              to={link.to}
              active={link.active}
              className={cx(
                "rounded-eb-sm text-[14px] leading-5 whitespace-nowrap transition-colors",
                link.active ? "font-medium text-primary" : "font-normal text-ink-secondary hover:text-ink",
                FOCUS_RING,
              )}
            >
              {link.label}
            </NavAnchor>
          ))}
        </nav>
        <div aria-hidden="true" className="flex-1" />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {(secondaryAction || primaryAction) && (
            <div className="flex items-center gap-2.5 border-l border-line pl-3">
              {secondaryAction && (
                <PublicButton variant="ghost" size="md" to={secondaryAction.to} onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </PublicButton>
              )}
              {primaryAction && (
                <PublicButton variant="primary" size="md" to={primaryAction.to} onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </PublicButton>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
