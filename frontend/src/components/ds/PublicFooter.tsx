import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicBrand } from "@/components/ds/PublicNav";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Figma `EB/Public Footer` (page 05, node 455:359).
 *  - 1440 wide, #F3F6FC, padding 56 120 32, column gap 40
 *  - Top row gap 64: brand column 360 (logo + Regular 14/20 #696A70 description, gap 12),
 *    spacer, then 160-wide link columns (gap 12): heading Medium 14/20 #202124,
 *    links Regular 14/20 #696A70
 *  - Bottom row: 1px top stroke #E1E8F5, padding-top 20, gap 16: copyright (fills) and
 *    contact e-mail, both Regular 12/16 #696A70
 */
export interface PublicFooterLink {
  label: ReactNode;
  /** Router path, in-page anchor ("#faq") or URL. */
  to: string;
}

export interface PublicFooterColumn {
  title: ReactNode;
  links: PublicFooterLink[];
}

export interface PublicFooterProps {
  brandName: ReactNode;
  homeTo?: string;
  description: ReactNode;
  columns: PublicFooterColumn[];
  copyright: ReactNode;
  contactEmail?: string;
  className?: string;
}

const LINK = cx("rounded-eb-sm text-[14px] leading-5 font-normal text-ink-secondary hover:text-ink", FOCUS_RING);

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  if (to.startsWith("#") || /^[a-z]+:/i.test(to)) {
    return (
      <a href={to} className={LINK}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={LINK}>
      {children}
    </Link>
  );
}

export function PublicFooter({ brandName, homeTo, description, columns, copyright, contactEmail, className }: PublicFooterProps) {
  return (
    <footer className={cx("w-full border-t border-line bg-canvas", className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 pt-14 pb-8 sm:px-8 lg:px-12">
        <div className="flex items-start gap-16">
          <div className="flex w-[360px] shrink-0 flex-col items-start gap-3">
            <PublicBrand brandName={brandName} homeTo={homeTo} />
            <p className="text-[14px] leading-5 font-normal text-ink-secondary">{description}</p>
          </div>
          <div aria-hidden="true" className="flex-1" />
          {columns.map((column, index) => (
            <nav key={index} className="flex w-40 shrink-0 flex-col items-start gap-3" aria-label={typeof column.title === "string" ? column.title : undefined}>
              <p className="text-[14px] leading-5 font-medium text-ink">{column.title}</p>
              {column.links.map((link, linkIndex) => (
                <FooterLink key={linkIndex} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-line pt-5">
          <p className="min-w-0 flex-1 text-[12px] leading-4 font-normal text-ink-secondary">{copyright}</p>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className={cx("rounded-eb-sm text-[12px] leading-4 font-normal text-ink-secondary hover:text-ink", FOCUS_RING)}>
              {contactEmail}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
