/** Tipos do catálogo de estoque. */

/**
 * Uma foto do acervo já com derivativos WebP gerados.
 *
 * `type` distingue a foto do molde da foto da peça injetada. Hoje é preenchido
 * pela curadoria manual (src/lib/stock/curation.json); nenhuma foto é
 * classificada por heurística — na dúvida, ela fica como "mold".
 */
export type StockImageType = "mold" | "result";

export interface StockImage {
  /** Nome do arquivo original sem extensão: "01", "02"… */
  name: string;
  /** Prefixo das URLs públicas: "/estoque/copo-250ml-2-cavidades/01" */
  base: string;
  /** Dimensões do original (orientação EXIF já aplicada) — evitam CLS. */
  width: number;
  height: number;
  /** Larguras realmente geradas, para montar o srcset sem mentir. */
  widths: number[];
  /** Cor dominante, usada como placeholder enquanto a foto carrega. */
  color: string;
  type: StockImageType;
  alt: string;
}

/** Molde específico ou galeria agrupada (ex.: "Automotivos"). */
export type StockItemKind = "mold" | "collection";

export interface StockItem {
  slug: string;
  /** Pasta de 1º nível: moldes-injecao-plastica, porta-moldes, estampos… */
  segment: string;
  segmentLabel: string;
  kind: StockItemKind;
  /** H1 e nome do card: "Molde para Copo 250 ml – 2 Cavidades" */
  title: string;
  /** Nome curto do card, sem o prefixo "Molde para": "Copo 250 ml" */
  shortTitle: string;
  /** Trecho em minúsculas usado em alts e descrições: "copo de 250 ml" */
  subject: string;
  category: string;
  categorySlug: string;
  /** Só quando o nome da pasta informa — nunca inferido de foto. */
  cavities: number | null;
  volume: string | null;
  partWeight: string | null;
  summary: string | null;
  cover: StockImage;
  images: StockImage[];
  moldImages: StockImage[];
  resultImages: StockImage[];
  /** Termos normalizados para a busca instantânea. */
  searchText: string;
}

export interface StockCategory {
  name: string;
  slug: string;
  count: number;
}
