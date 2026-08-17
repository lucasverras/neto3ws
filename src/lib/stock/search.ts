/**
 * Busca instantânea do estoque.
 *
 * Sem dependência nova: o catálogo tem ~40 itens, então um filtro por tokens
 * sobre `searchText` (já normalizado no build) resolve com folga e roda a cada
 * tecla sem debounce perceptível.
 */

import type { CategoryKey } from "./taxonomy";
import type { StockItem } from "./types";

/** "2 Cavidades" e "cavidade" precisam bater no mesmo item. */
export function normalizeQuery(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const HAYSTACK = new WeakMap<StockItem, string>();

function haystackFor(item: StockItem): string {
  let value = HAYSTACK.get(item);
  if (value === undefined) {
    value = normalizeQuery(item.searchText);
    HAYSTACK.set(item, value);
  }
  return value;
}

/**
 * Todos os termos precisam aparecer (AND), o que faz "copo 2 cavidades"
 * funcionar como o usuário espera.
 */
export function searchStock(items: StockItem[], query: string): StockItem[] {
  const terms = normalizeQuery(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return items;
  return items.filter((item) => {
    const haystack = haystackFor(item);
    return terms.every((term) => haystack.includes(term));
  });
}

/** Filtra pela chave estável, não pelo nome traduzido. */
export function filterByCategory(items: StockItem[], category: CategoryKey | null): StockItem[] {
  if (!category) return items;
  return items.filter((item) => item.categoryKey === category);
}
