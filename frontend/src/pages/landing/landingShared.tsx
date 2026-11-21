import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "@/components/ds";
import { DISPLAY_FONT } from "@/pages/landing/landingConstants";

/** Section h2: SemiBold 40/50, letter-spacing -1.5%. */
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cx(DISPLAY_FONT, "text-[40px] leading-[50px] font-semibold tracking-[-0.015em] text-ink", className)}>{children}</h2>
  );
}

/** Card h3: SemiBold 22/30, letter-spacing -0.5%. */
export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cx(DISPLAY_FONT, "text-[22px] leading-[30px] font-semibold tracking-[-0.005em] text-ink", className)}>{children}</h3>;
}

/** "Point" rows: Icon/check 18 (stroke 2.09) · gap 12 · Regular 15/24 #202124; rows gap 12. */
export function CheckList({ items, iconClassName, className }: { items: string[]; iconClassName: string; className?: string }) {
  return (
    <ul className={cx("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={2.09} className={cx("shrink-0", iconClassName)} />
          <span className="min-w-0 flex-1 text-[15px] leading-6 font-normal text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
