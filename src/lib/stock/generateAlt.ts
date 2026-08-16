/**
 * Textos alternativos das fotos do estoque.
 *
 * Regras: descrever o que a foto mostra, em português corrido, usando só o que
 * o acervo realmente informa (tipo de peça, volume, cavidades). Sem "imagem",
 * sem "foto molde", sem repetir a mesma frase em todas as fotos de um item e
 * sem empilhar palavra-chave.
 */

import { cavityLabelLower } from "./normalizeTitle";
import type { StockItemKind } from "./types";

interface AltInput {
  subject: string;
  kind: StockItemKind;
  cavities: number | null;
  /** Posição da foto dentro do próprio grupo (molde ou resultado), a partir de 1. */
  position: number;
}

export function generateMoldAlt({ subject, kind, cavities, position }: AltInput): string {
  if (kind === "collection") {
    if (position === 1) {
      return `Moldes de injeção plástica para ${subject} no estoque da 3WS Moldes`;
    }
    return `Molde de injeção para ${subject} — item ${position} do acervo da 3WS`;
  }

  const cavitySuffix = cavities ? ` com ${cavityLabelLower(cavities)}` : "";

  if (position === 1) {
    return `Molde de injeção plástica para ${subject}${cavitySuffix}`;
  }
  if (position === 2) {
    return `Detalhe do molde de injeção para ${subject} no estoque da 3WS Moldes`;
  }
  return `Molde de injeção para ${subject} — vista ${position}`;
}

export function generateResultAlt({ subject, position }: Omit<AltInput, "kind" | "cavities">): string {
  if (position === 1) {
    return `Peça plástica produzida pelo molde para ${subject}`;
  }
  return `Peça plástica injetada a partir do molde para ${subject} — detalhe ${position}`;
}
