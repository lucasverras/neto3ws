/**
 * Categorias do estoque.
 *
 * As categorias não vêm de uma lista fixa de produtos: são derivadas do próprio
 * slug da pasta por regras em ordem de prioridade. Uma pasta nova
 * ("balde-20-litros-2-cavidades") cai automaticamente na categoria certa sem
 * nenhuma edição de código — que é o requisito de extensibilidade do acervo.
 *
 * A curadoria (curation.json) pode sobrescrever caso a caso.
 */

/** Rótulo do segmento, vindo da pasta de 1º nível do acervo. */
export const SEGMENT_LABELS: Record<string, string> = {
  "moldes-injecao-plastica": "Moldes de injeção plástica",
  "porta-moldes": "Porta-moldes",
  estampos: "Bases para estampos",
  "moldes-sopro": "Moldes de sopro",
};

export function segmentLabel(segment: string) {
  return SEGMENT_LABELS[segment] ?? "Ativos industriais";
}

interface CategoryRule {
  category: string;
  /** Testado contra o slug do item. Primeira regra que casar vence. */
  match: RegExp;
}

const RULES: CategoryRule[] = [
  // Segmentos que já são uma categoria por si só.
  { category: "Porta-Moldes", match: /porta-molde/ },
  { category: "Bases para Estampos", match: /estampo/ },
  { category: "Moldes de Sopro", match: /sopro/ },

  { category: "Automotivos", match: /automotiv/ },
  { category: "Brinquedos", match: /brinquedo/ },
  { category: "Tampas", match: /^tampa|-tampa$/ },
  { category: "Bandejas", match: /bandeja/ },
  { category: "Copos e Taças", match: /copo|copos|taca|caneca|xicara/ },
  { category: "Pratos e Saladeiras", match: /prato|saladeira|sopeira/ },
  { category: "Vasos, Baldes e Cestos", match: /vaso|balde|cesto|lixeira/ },
  { category: "Vasilhas e Potes", match: /vasilha|pote|tigela|marmita/ },
  {
    category: "Utilidades Domésticas",
    match: /utilidade|forma|manteigueira|jarra|tabua|saboneteira|cinzeiro|escorredor|peneira/,
  },
];

const FALLBACK_CATEGORY = "Diversos";

export function deriveCategory(slug: string): string {
  for (const rule of RULES) {
    if (rule.match.test(slug)) return rule.category;
  }
  return FALLBACK_CATEGORY;
}

/**
 * Ordem de exibição dos chips. Categorias não listadas vão para o fim, em
 * ordem alfabética — de novo, para que uma categoria nova não exija código.
 */
export const CATEGORY_ORDER = [
  "Copos e Taças",
  "Pratos e Saladeiras",
  "Bandejas",
  "Vasilhas e Potes",
  "Utilidades Domésticas",
  "Vasos, Baldes e Cestos",
  "Tampas",
  "Automotivos",
  "Brinquedos",
  "Porta-Moldes",
  "Bases para Estampos",
  "Moldes de Sopro",
  FALLBACK_CATEGORY,
];

export function categoryRank(category: string) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}
