import { useId, useState, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Eye, EyeOff, Search } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { PATHS } from "@/routes/paths";
import { cx, FOCUS_RING } from "@/components/ds";

/**
 * Building blocks shared by the auth frames on Figma page EduBranch AI – Screens
 * (00.3 Đăng nhập, 00.4/00.5 Đăng ký, 10.1 Đăng nhập quản trị).
 *
 * Frame 1440x1024: row, padding 20 84 20 20, gap 84, items centred.
 *  - "Product showcase" 690 fixed x fill height, radius 20, clips, padding-top 64,
 *    linear gradient #2B4F80 → #1474C6 → #00A6F6 (Figma transform → CSS 101deg, stops 0 / 43.5 / 87%).
 *    Brand (logo 26 + Roboto Regular 22/28 white, gap 8) · 64 · title Medium 28/36 (560 wide)
 *    · 16 · subtitle Regular 16/24. The device mockup ("Product preview", 690x734 at y 250,
 *    top 12% faded by a mask) is a static illustration exported from the frame.
 *  - Form column fills (562), content centred vertically.
 * The auth inputs/buttons are detached frames in Figma (h44, Roboto 15/22) — not
 * `Forms/Field` (h40, 14/20) or `Actions/Button` (h40, Medium 14/20) — hence local pieces.
 */
const SHOWCASE_GRADIENT = "bg-[linear-gradient(101deg,#2b4f80_0%,#1474c6_43.5%,#00a6f6_87%)]";

export function AuthSplitLayout({ showcaseImage, children }: { showcaseImage: string; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-8 lg:gap-12 xl:gap-16">
        <aside
          className={cx(
            "relative hidden h-[720px] w-[480px] shrink-0 flex-col items-center justify-between overflow-hidden rounded-[20px] p-6 text-ink-inverse shadow-eb-card xl:flex xl:w-[540px] 2xl:w-[600px]",
            SHOWCASE_GRADIENT,
          )}
        >
          {/* Top text block: logo + title + subtitle */}
          <div className="flex flex-col items-center pt-3 text-center">
            <Link
              to={PATHS.HOME}
              title={`${t("g1.brand")} — ${t("common.backHome")}`}
              className={cx("flex items-center gap-2 transition-transform hover:scale-[1.02] focus:outline-none", FOCUS_RING)}
            >
              <LogoMark size={26} />
              <span className="text-[20px] leading-7 font-normal">{t("g1.brand")}</span>
            </Link>
            <h2 className="mt-5 max-w-[460px] text-center text-[22px] leading-8 font-medium sm:text-[24px] sm:leading-9">
              {t("g1.showcase.title")}
            </h2>
            <p className="mt-2 max-w-[440px] text-center text-[13px] leading-5 font-normal text-white/90 sm:text-[14px] sm:leading-6">
              {t("g1.showcase.subtitle")}
            </p>
          </div>

          {/* Full device mockups container: scaled to fit completely with all bottom details visible */}
          <div className="relative mt-4 flex w-full flex-1 items-end justify-center overflow-hidden pb-1">
            <img
              src={showcaseImage}
              alt=""
              aria-hidden="true"
              className="max-h-[460px] w-auto max-w-full select-none object-contain object-bottom pointer-events-none drop-shadow-md"
            />
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center py-6">{children}</main>
      </div>
    </div>
  );
}

/** "Form heading": column gap 16, centred. */
export function AuthFormHeading({ title, subtitle }: { title: ReactNode; subtitle: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-center gap-3 pb-6 text-center sm:gap-4 sm:pb-8">
      <Link
        to={PATHS.HOME}
        title={`${t("g1.brand")} — ${t("common.backHome")}`}
        className={cx("flex items-center gap-2 pb-2 sm:pb-3 transition-transform hover:scale-[1.02] focus:outline-none", FOCUS_RING)}
      >
        <LogoMark size={26} />
        <span className="text-[22px] leading-7 font-normal text-ink">{t("g1.brand")}</span>
      </Link>
      <h1 className="text-[26px] leading-8 font-medium tracking-normal text-ink sm:text-[28px] sm:leading-9">{title}</h1>
      <p className="w-full text-[15px] leading-6 font-normal text-ink-secondary sm:text-[16px]">{subtitle}</p>
    </div>
  );
}

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & {
  label: ReactNode;
  className?: string;
};

const CONTROL =
  "flex h-11 w-full items-center gap-3 rounded-eb-md border border-line-strong bg-surface px-[14px] transition-[box-shadow,border-color] focus-within:border-accent focus-within:shadow-eb-focus";

const VALUE =
  "h-[22px] min-w-0 flex-1 appearance-none bg-transparent p-0 text-[15px] leading-[22px] font-normal text-ink outline-none placeholder:text-ink-muted";

/** Label Regular 14/20 · gap 8 · input h44, 1px #D1D9E8, radius 8, padding 0 14, value 15/22. */
export function AuthTextField({ label, className, id, ...rest }: AuthInputProps) {
  const autoId = useId();
  const inputId = id ?? `auth-${autoId}`;
  return (
    <div className={cx("flex w-full min-w-0 flex-col gap-2", className)}>
      <label htmlFor={inputId} className="self-start text-[14px] leading-5 font-normal text-ink">
        {label}
      </label>
      <div className={CONTROL}>
        <input {...rest} id={inputId} className={VALUE} />
      </div>
    </div>
  );
}

export type AuthSelectOption = {
  value: string;
  label: string;
  category?: string;
};

export type AuthSelectProps = {
  label: ReactNode;
  id?: string;
  className?: string;
  options: (string | AuthSelectOption)[];
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  disabled?: boolean;
};

/** Polished custom dropdown for auth forms with generous 16px left padding, search filter, and categorized groups. */
export function AuthSelectField({
  label,
  className,
  id,
  options,
  value,
  onChange,
  placeholder = "-- Chọn một mục --",
  required,
  name,
  disabled,
}: AuthSelectProps) {
  const autoId = useId();
  const inputId = id ?? `auth-select-${autoId}`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: AuthSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter options based on query
  const filtered = query.trim()
    ? normalizedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase()) ||
          (opt.category && opt.category.toLowerCase().includes(query.toLowerCase())),
      )
    : normalizedOptions;

  // Group by category if present
  const hasCategories = normalizedOptions.some((opt) => !!opt.category);
  const grouped: { [cat: string]: AuthSelectOption[] } = {};
  if (hasCategories && !query.trim()) {
    normalizedOptions.forEach((opt) => {
      const cat = opt.category || "Khác";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(opt);
    });
  }

  const handleSelect = (val: string) => {
    onChange?.({ target: { value: val, name: name || inputId } });
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cx("relative flex w-full min-w-0 flex-col gap-2", className)}>
      <label htmlFor={inputId} className="self-start text-[14px] leading-5 font-normal text-ink">
        {label}
      </label>

      {/* Hidden input for HTML form requirement / semantics */}
      <input
        type="hidden"
        id={inputId}
        name={name || inputId}
        value={value || ""}
        required={required}
      />

      {/* Trigger button */}
      <button
        type="button"
        id={`${inputId}-trigger`}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          CONTROL,
          "h-11 cursor-pointer justify-between text-left transition-[box-shadow,border-color]",
          open && "border-accent shadow-eb-focus",
          disabled && "cursor-not-allowed opacity-60",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={cx(
            "min-w-0 flex-1 truncate text-[15px] leading-[22px]",
            selectedOption ? "font-normal text-ink" : "text-ink-muted",
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cx(
            "shrink-0 text-ink-secondary transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Floating Popover Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 flex w-full flex-col overflow-hidden rounded-[10px] border border-line-default bg-surface shadow-lg"
          style={{ boxShadow: "0 12px 32px -4px rgba(32, 33, 36, 0.16), 0 4px 12px -2px rgba(32, 33, 36, 0.08)" }}
        >
          {/* Quick search bar */}
          <div className="flex items-center gap-2.5 border-b border-line-default bg-canvas/60 px-3.5 py-2">
            <Search size={14} className="shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh khoa hoặc đơn vị..."
              className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-muted"
            />
          </div>

          {/* Options list with generous 16px left padding */}
          <div className="max-h-[280px] overflow-y-auto py-1.5 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-4 py-4 text-center text-[13px] text-ink-muted">
                Không tìm thấy khoa phù hợp. Bạn có thể chọn mục <strong>"Đơn vị / Khoa khác..."</strong> ở dưới cùng.
              </div>
            ) : hasCategories && !query.trim() ? (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="flex flex-col">
                  <div className="bg-canvas/50 px-4 pt-2.5 pb-1 text-[11px] font-medium tracking-wide uppercase text-ink-secondary">
                    {category}
                  </div>
                  {items.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <div
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(opt.value)}
                        className={cx(
                          "flex cursor-pointer items-center justify-between px-4 py-2 text-[14px] leading-5 text-ink transition-colors hover:bg-canvas hover:text-accent",
                          isSelected && "bg-selected font-medium text-accent",
                        )}
                      >
                        <span className="truncate pr-2">{opt.label}</span>
                        {isSelected && <Check size={15} className="shrink-0 text-accent" aria-hidden="true" />}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={cx(
                      "flex cursor-pointer items-center justify-between px-4 py-2.5 text-[14px] leading-5 text-ink transition-colors hover:bg-canvas hover:text-accent",
                      isSelected && "bg-selected font-medium text-accent",
                    )}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && <Check size={15} className="shrink-0 text-accent" aria-hidden="true" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Same field with the 18px `Icon/eye` (stroke 1.7, #696A70) toggle at the end. */
export function AuthPasswordField({ label, className, id, ...rest }: Omit<AuthInputProps, "type">) {
  const { t } = useTranslation();
  const autoId = useId();
  const inputId = id ?? `auth-${autoId}`;
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className={cx("flex w-full min-w-0 flex-col gap-2", className)}>
      <label htmlFor={inputId} className="self-start text-[14px] leading-5 font-normal text-ink">
        {label}
      </label>
      <div className={CONTROL}>
        <input {...rest} id={inputId} type={visible ? "text" : "password"} className={VALUE} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("g1.form.hidePassword") : t("g1.form.showPassword")}
          aria-pressed={visible}
          className={cx("flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary hover:text-ink", FOCUS_RING)}
        >
          <Icon aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}

/** "Remember me": 18px checkbox (#F3F6FC, 1px #D1D9E8, radius 4), gap 10, label Regular 15/22. */
export function AuthCheckbox({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <span className="relative flex size-[18px] shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={cx(
            "peer size-[18px] cursor-pointer appearance-none rounded-[4px] border border-line-strong bg-canvas checked:border-primary checked:bg-primary",
            FOCUS_RING,
          )}
        />
        <Check
          aria-hidden="true"
          size={14}
          absoluteStrokeWidth
          strokeWidth={2}
          className="pointer-events-none absolute top-0.5 left-0.5 hidden text-ink-inverse peer-checked:block"
        />
      </span>
      <span className="text-[15px] leading-[22px] font-normal text-ink">{label}</span>
    </label>
  );
}

/** "Primary action": padding-top 16; button h44 #2A4E7F radius 8, label Regular 15/22 white. */
export function AuthSubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <div className="flex w-full flex-col pt-4">
      <button
        type="submit"
        disabled={disabled}
        className={cx(
          "flex h-11 w-full cursor-pointer items-center justify-center rounded-eb-md bg-primary text-[15px] leading-[22px] font-normal text-ink-inverse transition-colors",
          "hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled",
          FOCUS_RING,
        )}
      >
        {children}
      </button>
    </div>
  );
}

/** "Account switch": Regular 15/22 #696A70 prompt + Medium #2A4E7F link, centred. */
export function AuthAccountSwitch({ prompt, linkLabel, to }: { prompt: ReactNode; linkLabel: ReactNode; to: string }) {
  return (
    <p className="w-full text-center text-[15px] leading-[22px] font-normal whitespace-pre-wrap text-ink-secondary">
      {prompt}
      {"  "}
      <Link to={to} className={cx("rounded-eb-sm font-medium text-link hover:underline", FOCUS_RING)}>
        {linkLabel}
      </Link>
    </p>
  );
}
