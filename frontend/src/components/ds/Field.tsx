import { useId, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ds/shared";

/**
 * Figma `Forms/Field` (page EduBranch AI – Design System, node 226:201) — Type Input | Textarea × State Default | Focus | Error | Disabled.
 *  - Column, gap 8: Label (Roboto Regular 14/20 #202124) / Control / Helper (Regular 12/16 #696A70)
 *  - Control: white, 1px inside stroke #D1D9E8, radius 8, padding 0 12, gap 8
 *      Input: h40, items centred · Textarea: h120, padding 12 12 0 12, items top
 *  - Value Regular 14/20: placeholder #909198, entered text #202124
 *  - Focus: stroke 1.5px #00A5F5 + 0 0 0 3px rgba(0,165,245,.18)
 *  - Error: stroke 1px #FF3535, helper #FF3535
 *  - Disabled: label #909198, control #F3F6FC with stroke #E8EDF6, text #909198
 *  - Optional leading icon 16x16 #696A70 (page EduBranch AI – Screens: book-open 1.7, key-round 1.36)
 * Focus is driven by :focus-within, so the Default/Focus variants are one component.
 */
type FieldBaseProps = {
  /** Visible label. Omit only when a visible heading labels the field; then pass aria-label. */
  label?: ReactNode;
  /** Helper or counter line under the control (e.g. "0/2000 ký tự"). */
  helper?: ReactNode;
  /** Error message: switches to the Error state and replaces the helper. */
  error?: ReactNode;
  leadingIcon?: LucideIcon;
  /** Absolute stroke (px) measured on the Figma icon instance. */
  iconStrokeWidth?: number;
  /** Classes for the outer column (width etc.). Defaults to w-full. */
  className?: string;
};

export type InputFieldProps = FieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & {
    multiline?: false;
    ref?: Ref<HTMLInputElement>;
  };

export type TextareaFieldProps = FieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    multiline: true;
    ref?: Ref<HTMLTextAreaElement>;
  };

export type FieldProps = InputFieldProps | TextareaFieldProps;

const CONTROL =
  "flex w-full gap-2 rounded-eb-md border px-3 transition-[box-shadow,border-color]";

const VALUE =
  "min-w-0 flex-1 appearance-none bg-transparent p-0 text-[14px] leading-5 outline-none placeholder:text-ink-muted disabled:cursor-not-allowed";

export function Field(props: FieldProps) {
  const autoId = useId();
  const { label, helper, error, leadingIcon: Icon, iconStrokeWidth = 1.7, className, id, disabled } = props;
  const inputId = id ?? `field-${autoId}`;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);
  const below = hasError ? error : helper;

  const controlState = disabled
    ? "border-line-soft bg-canvas text-ink-muted"
    : hasError
      ? "border-error bg-surface text-ink focus-within:shadow-eb-focus"
      : "border-line-strong bg-surface text-ink focus-within:border-accent focus-within:shadow-[inset_0_0_0_0.5px_var(--color-accent),var(--shadow-eb-focus)]";

  const describedBy = below ? helperId : undefined;
  const icon = Icon ? (
    <Icon aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={iconStrokeWidth} className="shrink-0 text-ink-secondary" />
  ) : null;

  let control: ReactNode;
  if (props.multiline) {
    const { label: _l, helper: _h, error: _e, leadingIcon: _i, iconStrokeWidth: _s, className: _c, multiline: _m, ref, ...rest } = props;
    control = (
      <div className={cx(CONTROL, "h-[120px] items-start pt-3", controlState)}>
        {icon && <span className="flex h-5 items-center">{icon}</span>}
        <textarea
          {...rest}
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cx(VALUE, "h-full resize-none self-stretch pb-3")}
        />
      </div>
    );
  } else {
    const { label: _l, helper: _h, error: _e, leadingIcon: _i, iconStrokeWidth: _s, className: _c, multiline: _m, ref, ...rest } = props;
    control = (
      <div className={cx(CONTROL, "h-10 items-center", controlState)}>
        {icon}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cx(VALUE, "h-5")}
        />
      </div>
    );
  }

  return (
    <div className={cx("flex w-full flex-col gap-2", className)}>
      {label && (
        <label htmlFor={inputId} className={cx("self-start text-[14px] leading-5 font-normal", disabled ? "text-ink-muted" : "text-ink")}>
          {label}
        </label>
      )}
      {control}
      {below && (
        <p id={helperId} className={cx("text-[12px] leading-4 font-normal", hasError ? "text-error" : "text-ink-secondary")}>
          {below}
        </p>
      )}
    </div>
  );
}
