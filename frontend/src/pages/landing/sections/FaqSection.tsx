import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronDown, Database, GraduationCap, Mail, Search, SquarePen, type LucideIcon } from "lucide-react";
import { cx, FOCUS_RING, publicButtonClassName } from "@/components/ds";
import { NoResultsState } from "@/components/feedback";
import { CardTitle, SectionTitle } from "@/pages/landing/landingShared";
import { LANDING_ANCHORS } from "@/pages/landing/landingConstants";

/**
 * "Câu hỏi thường gặp · #cau-hoi" (580:8810): column gap 40, padding 96 104, items centred.
 *  - Header (720, gap 20): H2 + Regular 18/28 centred (gap 16) · search 560 (padding 14 18, radius 14,
 *    1px #D1D9E8, Regular 15/24, Icon/search 20 @1.6) · popular topics (label 12/16, pills: white,
 *    1px #E1E8F5, padding 6 12, Medium 12/16 #2A4E7F)
 *  - Groups: 2-column grid, gap 20, cards stretch per row. Card: white, radius 16, padding 24, gap 12;
 *    header = 40px tile + H3 + "n câu hỏi"; questions padding 22 0 with a 1px #E1E8F5 divider,
 *    Medium 18/26 + Icon/chevron-down 20 @1.7; answer Regular 15/24 #696A70, 40px right padding.
 *  - Contact block: white, radius 28, padding 40 48, gap 32.
 * Searching filters the questions (every typed word must appear); topics fill the search.
 */
interface Question {
  q: string;
  a: string;
}
interface Group {
  title: string;
  questions: Question[];
}

const GROUP_ICONS: { icon: LucideIcon; stroke: number }[] = [
  { icon: BookOpen, stroke: 1.7 },
  { icon: SquarePen, stroke: 1.51 },
  { icon: GraduationCap, stroke: 1.36 },
  { icon: Database, stroke: 2 },
];

const SUPPORT_EMAIL = "support@edubranch.ai";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function FaqSection() {
  const { t } = useTranslation();
  const searchId = useId();
  const groups = t("g1.landing.faq.groups", { returnObjects: true }) as Group[];
  const topics = t("g1.landing.faq.topics", { returnObjects: true }) as string[];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set(["0-0"]));

  const filtered = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return groups.map((group, gi) => ({
      ...group,
      gi,
      items: group.questions
        .map((question, qi) => ({ ...question, key: `${gi}-${qi}` }))
        .filter(({ q, a }) => {
          if (!words.length) return true;
          const haystack = normalize(`${q} ${a}`);
          return words.every((w) => haystack.includes(w));
        }),
    }));
  }, [groups, query]);
  const visibleGroups = filtered.filter((g) => g.items.length > 0);

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section id={LANDING_ANCHORS.faq} className="w-full scroll-mt-[72px] py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 sm:px-8 lg:px-12">
        <div className="flex w-[720px] max-w-full flex-col items-center gap-5">
        <div className="flex w-full flex-col gap-4 text-center">
          <SectionTitle>{t("g1.landing.faq.title")}</SectionTitle>
          <p className="text-[18px] leading-7 font-normal text-ink-secondary">{t("g1.landing.faq.subtitle")}</p>
        </div>
        <div className="flex w-[560px] items-center gap-3 rounded-[14px] border border-line-strong bg-surface px-[18px] py-[14px] focus-within:border-accent focus-within:shadow-eb-focus">
          <label htmlFor={searchId} className="sr-only">
            {t("g1.landing.faq.searchLabel")}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("g1.landing.faq.searchPlaceholder")}
            className="h-6 min-w-0 flex-1 appearance-none bg-transparent text-[15px] leading-6 text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
          />
          <Search aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.6} className="shrink-0 text-ink-muted" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] leading-4 text-ink-secondary">{t("g1.landing.faq.popular")}</span>
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setQuery(topic)}
              aria-pressed={normalize(query) === normalize(topic)}
              className={cx(
                "cursor-pointer rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] leading-4 font-medium text-primary hover:bg-canvas",
                FOCUS_RING,
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {visibleGroups.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
          {visibleGroups.map((group) => {
            const { icon: Icon, stroke } = GROUP_ICONS[group.gi];
            return (
              <article key={group.title} className="flex flex-col gap-3 rounded-[16px] bg-surface p-6 shadow-eb-card">
                <header className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-eb-lg bg-primary-subtle">
                    <Icon aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={stroke} className="text-primary" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <CardTitle>{group.title}</CardTitle>
                    <p className="text-[12px] leading-4 text-ink-muted">{t("g1.landing.faq.count", { count: group.questions.length })}</p>
                  </div>
                </header>
                <div className="flex flex-col">
                  {group.items.map((item, index) => {
                    const expanded = open.has(item.key);
                    const panelId = `faq-${searchId}-${item.key}`;
                    return (
                      <div
                        key={item.key}
                        className={cx("flex flex-col gap-3 py-[22px]", index < group.items.length - 1 && "border-b border-line")}
                      >
                        <h4 className="m-0">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-controls={panelId}
                            onClick={() => toggle(item.key)}
                            className={cx("flex w-full cursor-pointer items-center gap-4 rounded-eb-sm text-left", FOCUS_RING)}
                          >
                            <span className="min-w-0 flex-1 text-[18px] leading-[26px] font-medium tracking-normal text-ink">{item.q}</span>
                            <ChevronDown
                              aria-hidden="true"
                              size={20}
                              absoluteStrokeWidth
                              strokeWidth={1.7}
                              className={cx("shrink-0 text-ink-secondary transition-transform", expanded && "rotate-180")}
                            />
                          </button>
                        </h4>
                        <div id={panelId} hidden={!expanded} className="pr-10">
                          <p className="text-[15px] leading-6 text-ink-secondary">{item.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <NoResultsState keyword={query} onClear={() => setQuery("")} className="w-full" />
      )}

      <div className="flex w-full items-center gap-8 rounded-[28px] bg-surface px-12 py-10 shadow-eb-card">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-[16px] bg-primary-subtle">
          <Mail aria-hidden="true" size={24} absoluteStrokeWidth strokeWidth={1.7} className="text-primary" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <CardTitle>{t("g1.landing.faq.contact.title")}</CardTitle>
          <p className="text-[15px] leading-6 text-ink-secondary">
            {t("g1.landing.faq.contact.before")}
            <a href={`mailto:${SUPPORT_EMAIL}`} className={cx("rounded-eb-sm font-medium text-link hover:underline", FOCUS_RING)}>
              {SUPPORT_EMAIL}
            </a>
            {t("g1.landing.faq.contact.after")}
          </p>
        </div>
        <a href={`mailto:${SUPPORT_EMAIL}`} className={publicButtonClassName("secondary", "md")}>
          {t("g1.landing.faq.contact.action")}
        </a>
      </div>
      </div>
    </section>
  );
}
