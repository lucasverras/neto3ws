/**
 * Textos alternativos das fotos do estoque.
 *
 * Regras: descrever o que a foto mostra, em texto corrido no idioma da página,
 * usando só o que o acervo informa (tipo de peça, volume, cavidades). Sem
 * "imagem", sem "foto molde", sem repetir a mesma frase em todas as fotos de um
 * item e sem empilhar palavra-chave.
 */

import { t, type Dictionary } from "@/lib/i18n";
import { cavityLabelLower } from "./normalizeTitle";
import type { StockItemKind } from "./types";

interface AltInput {
  dict: Dictionary;
  subject: string;
  kind: StockItemKind;
  cavities: number | null;
  /** Posição da foto dentro do próprio grupo (molde ou resultado), a partir de 1. */
  position: number;
}

export function generateMoldAlt({ dict, subject, kind, cavities, position }: AltInput): string {
  const tpl = dict.stock.templates;

  if (kind === "collection") {
    return position === 1
      ? t(tpl.altCollectionFirst, { subject })
      : t(tpl.altCollectionNth, { subject, n: position });
  }

  if (position === 1) {
    const cavitySuffix = cavities
      ? t(tpl.altMoldCavitySuffix, { cavities: cavityLabelLower(dict, cavities) })
      : "";
    return t(tpl.altMoldFirst, { subject, cavities: cavitySuffix });
  }
  if (position === 2) {
    return t(tpl.altMoldSecond, { subject });
  }
  return t(tpl.altMoldNth, { subject, n: position });
}

export function generateResultAlt({
  dict,
  subject,
  position,
}: Omit<AltInput, "kind" | "cavities">): string {
  const tpl = dict.stock.templates;
  return position === 1
    ? t(tpl.altResultFirst, { subject })
    : t(tpl.altResultNth, { subject, n: position });
}
