/**
 * Formas usadas pelo painel.
 *
 * Diferente do `StockItem` que vai para o site: aqui os textos vêm crus, por
 * idioma, porque o formulário precisa editar cada campo — e não a versão já
 * resolvida com fallback.
 */

import type { Locale } from "@/lib/i18n";
import type { CategoryKey, SegmentKey } from "@/lib/stock/taxonomy";
import type { StockImageType, StockItemKind, StockStatus } from "@/lib/stock/types";

export type LocalizedText = Partial<Record<Locale, string>>;

export interface AdminImage {
  id: string;
  type: StockImageType;
  source: "legacy" | "storage";
  /** Referências cruas, como estão no banco. Voltam intactas ao salvar. */
  variants: { w: number; ref: string }[];
  /** URL pronta para exibir no painel (a menor variante serve de miniatura). */
  thumbUrl: string;
  width: number;
  height: number;
  color: string;
  isCover: boolean;
  sortOrder: number;
  fileName: string | null;
  alt: LocalizedText;
}

export interface AdminItem {
  id: string;
  slug: string;
  segment: SegmentKey;
  categoryKey: CategoryKey;
  kind: StockItemKind;
  status: StockStatus;
  featured: boolean;
  sortOrder: number;
  cavities: number | null;
  volume: string | null;
  partWeight: string | null;
  name: LocalizedText;
  title: LocalizedText;
  subject: LocalizedText;
  summary: LocalizedText;
  internalNotes: string;
  institutional: boolean;
  legacySource: string | null;
  createdAt: string;
  updatedAt: string;
  /** Rótulos já resolvidos em português, para a lista e o cabeçalho. */
  displayTitle: string;
  categoryLabel: string;
  segmentLabel: string;
  images: AdminImage[];
}

export interface AdminStats {
  total: number;
  published: number;
  draft: number;
  hiddenOrSold: number;
  archived: number;
  withoutPhotos: number;
  withResult: number;
  recentlyUpdated: number;
}

export interface AuditEntry {
  id: number;
  action: string;
  itemSlug: string | null;
  userEmail: string | null;
  createdAt: string;
  details: Record<string, unknown>;
}
