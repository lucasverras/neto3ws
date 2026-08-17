"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StockCard } from "./StockCard";
import { trackEvent } from "@/lib/analytics";
import { t, type Dictionary, type Locale } from "@/lib/i18n";
import { filterByCategory, searchStock } from "@/lib/stock/search";
import type { CategoryKey } from "@/lib/stock/taxonomy";
import type { StockCategory, StockItem } from "@/lib/stock/types";

const PAGE_SIZE = 24;
/** Só as primeiras fotos da primeira dobra saem do lazy loading. */
const PRIORITY_COUNT = 4;

/**
 * Query string como fonte externa. O snapshot do servidor é vazio de
 * propósito: o HTML estático sai com o catálogo inteiro (bom para o
 * rastreador) e o filtro de /estoque?categoria=… só entra na hidratação.
 */
function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function useCategoryFromUrl(categories: StockCategory[]): CategoryKey | null {
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => window.location.search,
    () => ""
  );
  return useMemo(() => {
    const slug = new URLSearchParams(search).get("categoria");
    if (!slug) return null;
    return categories.find((entry) => entry.key === slug)?.key ?? null;
  }, [search, categories]);
}

export function StockBrowser({
  items,
  categories,
  locale,
  dict,
}: {
  items: StockItem[];
  categories: StockCategory[];
  locale: Locale;
  dict: Dictionary;
}) {
  const d = dict.stock.browser;
  const [query, setQuery] = useState("");
  // `undefined` = ainda vale o que veio na URL; `null` = usuário escolheu "Todos".
  const [chosenCategory, setChosenCategory] = useState<CategoryKey | null | undefined>(undefined);
  const urlCategory = useCategoryFromUrl(categories);
  const category = chosenCategory === undefined ? urlCategory : chosenCategory;

  /** Filtro e busca sempre rodam sobre o catálogo inteiro, não sobre a página. */
  const filtered = useMemo(
    () => searchStock(filterByCategory(items, category), query),
    [items, category, query]
  );

  // A paginação é derivada do filtro atual: mudou o filtro, volta à primeira
  // página sem precisar de um efeito que dispara render em cascata.
  const filterKey = JSON.stringify([query, category]);
  const [page, setPage] = useState({ key: filterKey, size: PAGE_SIZE });
  const visible = page.key === filterKey ? page.size : PAGE_SIZE;

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Um evento por pausa de digitação, não um por tecla.
  useEffect(() => {
    if (query.trim().length < 2) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      trackEvent("stock_search", { query: query.trim(), results: filtered.length });
    }, 800);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query, filtered.length]);

  const onSelectCategory = useCallback((key: CategoryKey | null) => {
    setChosenCategory(key);
    trackEvent("stock_filter", { category: key ?? "todos" });
  }, []);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <section aria-labelledby="catalogo-heading" className="relative bg-ink pb-24 md:pb-32">
      <Container>
        <h2 id="catalogo-heading" className="sr-only">
          {d.srHeading}
        </h2>

        {/* Bloco de controles fixo no fluxo, não sticky: o header do site é
            `fixed`, e uma barra grudada no topo passaria por baixo dele. */}
        <div className="border-y border-white/10 py-6">
          <div className="flex flex-col gap-5">
            <label className="relative block w-full lg:max-w-md">
              <span className="sr-only">{d.searchLabel}</span>
              <Search
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={d.searchPlaceholder}
                enterKeyHint="search"
                className="h-12 w-full rounded-full border border-white/15 bg-white/[0.04] pl-11 pr-11 font-body text-[15px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-teal focus-visible:ring-1 focus-visible:ring-teal"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={d.clearSearch}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={15} strokeWidth={1.75} />
                </button>
              )}
            </label>

            {/* Rola na horizontal no mobile sem estourar a página; a partir de
                lg quebra em linhas alinhadas à esquerda. */}
            <div
              role="group"
              aria-label={d.filterLabel}
              className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:-mx-10 md:px-10 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              <CategoryChip
                label={d.all}
                count={items.length}
                active={category === null}
                onClick={() => onSelectCategory(null)}
              />
              {categories.map((entry) => (
                <CategoryChip
                  key={entry.key}
                  label={entry.name}
                  count={entry.count}
                  active={category === entry.key}
                  onClick={() => onSelectCategory(entry.key)}
                />
              ))}
            </div>
          </div>
        </div>

        <p aria-live="polite" className="pt-8 font-body text-[13px] text-white/45">
          {filtered.length === 0
            ? d.empty
            : `${filtered.length} ${filtered.length === 1 ? d.countOne : d.countMany}${
                category
                  ? ` · ${categories.find((entry) => entry.key === category)?.name ?? ""}`
                  : ""
              }`}
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <p className="font-display text-xl font-medium text-white">
              {d.emptyTitle}
            </p>
            <p className="mx-auto mt-3 max-w-md font-body text-[15px] leading-relaxed text-white/55">
              {d.emptyText}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onSelectCategory(null);
              }}
              className="mt-6 inline-flex items-center rounded-full border border-white/20 px-6 py-2.5 font-body text-[13px] text-white transition-colors hover:border-teal hover:text-teal"
            >
              {d.clearFilters}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
            {shown.map((item, index) => (
              <StockCard
                key={item.slug}
                item={item}
                locale={locale}
                dict={dict}
                priority={index < PRIORITY_COUNT}
              />
            ))}
          </div>
        )}

        {remaining > 0 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setPage({ key: filterKey, size: visible + PAGE_SIZE })}
              className="inline-flex items-center rounded-xl border border-white/20 px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors duration-300 hover:border-teal hover:bg-teal hover:text-white focus-visible:ring-2"
            >
              {d.loadMore}
            </button>
            <span className="font-body text-[13px] text-white/40">
              {t(d.showing, { shown: shown.length, total: filtered.length })}
            </span>
          </div>
        )}
      </Container>
    </section>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 font-body text-[13px] outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors duration-200 focus-visible:ring-2 ${
        active
          ? "border-teal bg-teal text-white"
          : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"
      }`}
    >
      {label}
      <span className={active ? "text-white/70" : "text-white/30"}>{count}</span>
    </button>
  );
}
