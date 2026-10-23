/** Limites e rótulos do painel. Tudo em português brasileiro. */

import type { StockStatus } from "@/lib/stock/types";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Limite do arquivo ORIGINAL escolhido pelo dono, antes da compressão. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export const MAX_IMAGES_PER_ITEM = 60;

/**
 * Larguras geradas no upload, iguais às do acervo em arquivo.
 *
 * Só são gravadas as que cabem na foto enviada — o original nunca é ampliado,
 * exatamente como no pipeline do build. Uma foto de 900 px sobe em 400 e 800.
 */
export const UPLOAD_WIDTHS = [400, 800, 1400] as const;

/** Qualidade do WebP gerado no navegador. */
export const UPLOAD_QUALITY = 0.82;

export const MAX_TEXT_LENGTH = 180;
export const MAX_SUMMARY_LENGTH = 1200;
export const MAX_NOTES_LENGTH = 2000;

/** Tentativas de login na mesma origem antes do bloqueio temporário. */
export const LOGIN_MAX_ATTEMPTS = 8;

export interface StatusMeta {
  label: string;
  /** Frase curta que explica a consequência, mostrada no formulário. */
  hint: string;
  /** Classe do selo na lista. */
  className: string;
  public: boolean;
}

export const STATUS_META: Record<StockStatus, StatusMeta> = {
  published: {
    label: "Publicado",
    hint: "Aparece no catálogo do site, nos três idiomas.",
    className: "border-teal/40 bg-teal/15 text-teal",
    public: true,
  },
  draft: {
    label: "Rascunho",
    hint: "Ainda não aparece no site. Você pode terminar depois.",
    className: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    public: false,
  },
  hidden: {
    label: "Oculto",
    hint: "Temporariamente fora do catálogo. Nada é perdido.",
    className: "border-white/20 bg-white/5 text-white/60",
    public: false,
  },
  sold: {
    label: "Vendido",
    hint: "Indisponível para novas negociações. Pode ser reativado a qualquer momento.",
    className: "border-white/20 bg-white/10 text-white/70",
    public: false,
  },
  archived: {
    label: "Arquivado",
    hint: "Guardado no histórico, fora do site e fora da lista principal.",
    className: "border-white/15 bg-transparent text-white/45",
    public: false,
  },
};

export const KIND_LABELS = {
  mold: "Molde individual",
  collection: "Coleção / galeria",
} as const;

export const IMAGE_TYPE_LABELS = {
  mold: "Fotos do molde",
  result: "Fotos da peça produzida",
} as const;
