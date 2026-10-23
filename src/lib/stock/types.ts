/** Tipos do catálogo de estoque. */

import type { CategoryKey, SegmentKey } from "./taxonomy";

/**
 * Uma foto do acervo distingue a foto do molde da foto da peça injetada.
 * É preenchido por escolha humana — na curadoria do acervo legado ou no
 * painel. Nenhuma foto é classificada por heurística: na dúvida, fica "mold".
 */
export type StockImageType = "mold" | "result";

/** Uma largura que REALMENTE existe para a foto. */
export interface StockVariant {
  /** URL pronta para uso em `src`/`srcset`. */
  url: string;
  width: number;
}

export interface StockImage {
  /** Chave estável: uuid no banco, `<slug>/<arquivo>` no acervo em arquivo. */
  id: string;
  /** Nome do arquivo original sem extensão: "01", "02"… */
  name: string;
  /**
   * URL usada quando o navegador não aproveita o srcset — sempre existe.
   *
   * Foto do acervo legado tem a escada de WebP gerada no build; foto enviada
   * pelo painel tem as variantes que o upload realmente gravou. Por isso
   * `src` e `variants` são explícitos em vez de montados por convenção: o
   * site nunca aponta para um arquivo que não existe.
   */
  src: string;
  /** Variantes existentes, da menor para a maior. Pode ter uma só. */
  variants: StockVariant[];
  /** Dimensões do original (orientação EXIF já aplicada) — evitam CLS. */
  width: number;
  height: number;
  /** Cor dominante, usada como placeholder enquanto a foto carrega. */
  color: string;
  type: StockImageType;
  /** Já no idioma da página. */
  alt: string;
}

/** Molde específico ou galeria agrupada (ex.: "Automotivos"). */
export type StockItemKind = "mold" | "collection";

/**
 * Estados possíveis de um item.
 *
 * Só `published` aparece no site. Os demais existem apenas no painel — a
 * regra é a mesma no catálogo, na busca, na página de detalhe, nos links
 * relacionados e no sitemap.
 */
export const STOCK_STATUSES = ["published", "draft", "hidden", "sold", "archived"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export function isStockStatus(value: string): value is StockStatus {
  return (STOCK_STATUSES as readonly string[]).includes(value);
}

export interface StockItem {
  /** uuid do banco. No catálogo em arquivo, é o próprio slug. */
  id: string;
  slug: string;
  /** Pasta de 1º nível: moldes-injecao-plastica, porta-moldes, estampos… */
  segment: SegmentKey;
  /** Rótulo do segmento no idioma da página. */
  segmentLabel: string;
  kind: StockItemKind;
  status: StockStatus;
  /** H1 e nome do card: "Molde para Copo 250 ml – 2 Cavidades" */
  title: string;
  /** Nome curto, sem o prefixo "Molde para": "Copo 250 ml – 2 Cavidades" */
  shortTitle: string;
  /** Trecho em minúsculas usado em alts e descrições: "copo de 250 ml" */
  subject: string;
  /** Chave estável — vai para a URL e não muda com o idioma. */
  categoryKey: CategoryKey;
  /** Nome da categoria no idioma da página. */
  category: string;
  /** Só quando o acervo informa — nunca inferido de foto. */
  cavities: number | null;
  volume: string | null;
  partWeight: string | null;
  /** Item em destaque no catálogo (aparece primeiro). */
  featured: boolean;
  /** Ordem definida pelo dono no painel. Vale no painel e no site. */
  sortOrder: number;
  summary: string | null;
  cover: StockImage;
  images: StockImage[];
  moldImages: StockImage[];
  resultImages: StockImage[];
  /** ISO 8601. Null no catálogo em arquivo, que não versiona alteração. */
  updatedAt: string | null;
  /** Termos normalizados para a busca instantânea, no idioma da página. */
  searchText: string;
}

export interface StockCategory {
  key: CategoryKey;
  name: string;
  count: number;
}

export interface StockTotals {
  items: number;
  photos: number;
  categories: number;
  withResult: number;
}

export interface Catalog {
  items: StockItem[];
  institutional: StockItem | null;
  categories: StockCategory[];
  totals: StockTotals;
  /**
   * Mensagem de falha ao ler o catálogo.
   *
   * Erro NUNCA é confundido com "estoque vazio": quem renderiza decide entre
   * "nenhum molde cadastrado" e "deu ruim aqui", e o segundo caso precisa
   * aparecer como erro de verdade.
   */
  error: string | null;
  /** De onde o catálogo veio — aparece no painel e nos relatórios. */
  source: "supabase" | "files";
}
