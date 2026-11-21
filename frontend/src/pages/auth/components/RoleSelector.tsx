import { useTranslation } from "react-i18next";
import { cx, FOCUS_RING } from "@/components/ds";

export type RegisterRole = "STUDENT" | "LECTURER";

/**
 * "Role selector" on frames 00.4 / 00.5: label Medium 12/16 · gap 8 · row of two
 * `Learning/Option Card` instances (gap 12, each fills) with the key box removed,
 * padding 12 16 and the label centred (Regular 15/22).
 *  - Selected: #DFEDF9, 1.5px inside stroke #2A4E7F, radius 12 (49px tall)
 *  - Default:  white, 1px inside stroke #D1D9E8 (48px tall, centred in the row)
 * The DS `OptionCard` always renders the key box and 16px padding, so the keyless variant
 * lives here until the DS component supports it (reported to the lead).
 */
export function RoleSelector({ value, onChange }: { value: RegisterRole; onChange: (role: RegisterRole) => void }) {
  const { t } = useTranslation();
  const roles: { id: RegisterRole; label: string }[] = [
    { id: "STUDENT", label: t("g1.register.roleStudent") },
    { id: "LECTURER", label: t("g1.register.roleLecturer") },
  ];
  return (
    <div className="flex flex-col gap-2">
      <span id="register-role-label" className="text-[12px] leading-4 font-medium text-ink">
        {t("g1.register.roleLabel")}
      </span>
      <div role="radiogroup" aria-labelledby="register-role-label" className="flex items-center gap-3">
        {roles.map((r) => {
          const selected = r.id === value;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(r.id)}
              className={cx(
                "flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-eb-lg border text-center text-[15px] leading-[22px] font-normal text-ink transition-colors",
                // Chrome floors a 1.5px border to 1px: draw 1px + 0.5px inset ring and add the 0.5px to the padding (as DS OptionCard).
                selected
                  ? "border-primary bg-selected px-[16.5px] py-[12.5px] shadow-[inset_0_0_0_0.5px_var(--color-primary)]"
                  : "border-line-strong bg-surface px-4 py-3 hover:bg-canvas",
                FOCUS_RING,
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
