/**
 * Categorias do estoque.
 *
 * A categoria é derivada do slug da pasta por regras em ordem de prioridade, e
 * o que sai daqui é uma CHAVE estável (`copos-tacas`), não um texto. A chave
 * vai para a URL (`?categoria=`) e para o dicionário, então trocar de idioma
 * não muda o link e um nome traduzido não vira identidade.
 *
 * Uma pasta nova ("balde-20-litros-2-cavidades") cai na categoria certa sem
 * nenhuma edição de código.
 */

import type { Dictionary } from "@/lib/i18n";

export type CategoryKey = keyof Dictionary["stock"]["categories"];
export type SegmentKey = keyof Dictionary["stock"]["segments"];

interface CategoryRule {
  key: CategoryKey;
  /** Testado contra o slug do item. Primeira regra que casar vence. */
  match: RegExp;
}

const RULES: CategoryRule[] = [
  // Segmentos que já são uma categoria por si só.
  { key: "porta-moldes", match: /porta-molde/ },
  { key: "bases-estampos", match: /estampo/ },
  { key: "moldes-sopro", match: /sopro/ },

  { key: "automotivos", match: /automotiv/ },
  { key: "brinquedos", match: /brinquedo/ },
  { key: "tampas", match: /^tampa|-tampa$/ },
  { key: "bandejas", match: /bandeja/ },
  { key: "copos-tacas", match: /copo|copos|taca|caneca|xicara/ },
  { key: "pratos-saladeiras", match: /prato|saladeira|sopeira/ },
  { key: "vasos-baldes-cestos", match: /vaso|balde|cesto|lixeira/ },
  { key: "vasilhas-potes", match: /vasilha|pote|tigela|marmita/ },
  {
    key: "utilidades-domesticas",
    match: /utilidade|forma|manteigueira|jarra|tabua|saboneteira|cinzeiro|escorredor|peneira/,
  },
];

const FALLBACK_CATEGORY: CategoryKey = "diversos";

export function deriveCategoryKey(slug: string): CategoryKey {
  for (const rule of RULES) {
    if (rule.match.test(slug)) return rule.key;
  }
  return FALLBACK_CATEGORY;
}

const KNOWN_SEGMENTS: SegmentKey[] = [
  "moldes-injecao-plastica",
  "porta-moldes",
  "estampos",
  "moldes-sopro",
];

export function segmentKey(segment: string): SegmentKey {
  return KNOWN_SEGMENTS.includes(segment as SegmentKey) ? (segment as SegmentKey) : "outros";
}

/** Ordem dos chips. Chaves não listadas vão para o fim. */
export const CATEGORY_ORDER: CategoryKey[] = [
  "copos-tacas",
  "pratos-saladeiras",
  "bandejas",
  "vasilhas-potes",
  "utilidades-domesticas",
  "vasos-baldes-cestos",
  "tampas",
  "automotivos",
  "brinquedos",
  "porta-moldes",
  "bases-estampos",
  "moldes-sopro",
  FALLBACK_CATEGORY,
];

export function categoryRank(key: CategoryKey) {
  const index = CATEGORY_ORDER.indexOf(key);
  return index === -1 ? CATEGORY_ORDER.length : index;
}
