/**
 * Slug de pasta → texto legível.
 *
 * O acervo nomeia as pastas sem acento e sem espaço ("copo-250ml-2-cavidades").
 * `parseSlug` extrai apenas o que o nome realmente declara: tipo de peça,
 * volume, peso da peça e número de cavidades. Nada é inferido das fotos.
 *
 * O nome renderizado aqui é sempre em português — é a língua do acervo. As
 * versões em inglês e espanhol vêm de curation.json; quando faltam, o nome
 * português é reaproveitado, porque mostrar o original é melhor do que
 * arriscar uma tradução automática errada.
 */

import { t, type Dictionary } from "@/lib/i18n";

/** Palavras do acervo que perdem acento no slug. */
const ACCENTED: Record<string, string> = {
  alca: "Alça",
  caixao: "Caixão",
  cestos: "Cestos",
  domesticas: "Domésticas",
  hermeticos: "Herméticos",
  injecao: "Injeção",
  moveis: "Móveis",
  peca: "Peça",
  pecas: "Peças",
  pes: "Pés",
  posticados: "Postiçados",
  taca: "Taça",
  tacas: "Taças",
  tabua: "Tábua",
  utilidades: "Utilidades",
};

/** Ficam em minúscula no meio do nome. */
const CONNECTORS = new Set(["de", "do", "da", "dos", "das", "e", "com", "para", "em", "no", "na", "ou"]);

/** Escritas fixas que não seguem a capitalização normal. */
const VERBATIM: Record<string, string> = {
  top: "Top",
  flip: "Flip",
  elegance: "Elegance",
  "2d": "2D",
  "3d": "3D",
};

const CAVITY_RE = /(\d+)-cavidades?(?:-|$)/;
const VOLUME_RE = /^(\d+(?:[.,]\d+)?)(ml|l|lt|litros?)$/i;
const WEIGHT_RE = /^(\d+(?:[.,]\d+)?)(g|kg)$/i;

export interface ParsedSlug {
  /** Nome em português, sem prefixo e sem as cavidades. */
  base: string;
  cavities: number | null;
  volume: string | null;
  partWeight: string | null;
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatMeasure(value: string, unit: string) {
  const amount = value.replace(".", ",");
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "ml") return `${amount} ml`;
  if (normalizedUnit === "l" || normalizedUnit === "lt") return `${amount} L`;
  if (normalizedUnit.startsWith("litro")) return `${amount} L`;
  if (normalizedUnit === "kg") return `${amount} kg`;
  return `${amount} ${normalizedUnit}`;
}

function renderToken(token: string, index: number): string {
  const volume = token.match(VOLUME_RE);
  if (volume) return formatMeasure(volume[1], volume[2]);

  const weight = token.match(WEIGHT_RE);
  if (weight) return formatMeasure(weight[1], weight[2]);

  if (VERBATIM[token]) return VERBATIM[token];
  if (ACCENTED[token]) return ACCENTED[token];
  if (index > 0 && CONNECTORS.has(token)) return token;
  if (/^\d+$/.test(token)) return token;
  return capitalize(token);
}

/** Lê tudo que o nome da pasta declara — e só isso. */
export function parseSlug(slug: string): ParsedSlug {
  const cavityMatch = slug.match(CAVITY_RE);
  const cavities = cavityMatch ? Number(cavityMatch[1]) : null;

  // Remove o trecho de cavidades e a palavra "peca", que vira só a medida.
  const tokens = slug
    .replace(CAVITY_RE, "")
    .split("-")
    .filter(Boolean)
    .filter((token) => token !== "peca");

  let volume: string | null = null;
  let partWeight: string | null = null;
  for (const token of tokens) {
    const v = token.match(VOLUME_RE);
    if (v && !volume) volume = formatMeasure(v[1], v[2]);
    const w = token.match(WEIGHT_RE);
    if (w && !partWeight) partWeight = formatMeasure(w[1], w[2]);
  }

  return {
    base: tokens.map(renderToken).join(" ").replace(/\s+/g, " ").trim(),
    cavities,
    volume,
    partWeight,
  };
}

export function cavityLabel(dict: Dictionary, cavities: number) {
  const template =
    cavities === 1 ? dict.stock.templates.cavityOne : dict.stock.templates.cavityMany;
  return t(template, { n: cavities });
}

export function cavityLabelLower(dict: Dictionary, cavities: number) {
  const template =
    cavities === 1 ? dict.stock.templates.cavityLowerOne : dict.stock.templates.cavityLowerMany;
  return t(template, { n: cavities });
}

/**
 * Monta o título a partir do modelo do idioma.
 * pt: "Molde para Copo 250 ml – 2 Cavidades"
 * en: "250 ml Cup Mold – 2 Cavities"
 */
export function buildTitle(
  dict: Dictionary,
  name: string,
  kind: "mold" | "collection",
  cavities: number | null
): string {
  const template =
    kind === "collection" ? dict.stock.templates.moldsFor : dict.stock.templates.moldFor;
  const prefix = t(template, { name });
  if (cavities === null) return prefix;
  return t(dict.stock.templates.titleWithCavities, {
    prefix,
    cavities: cavityLabel(dict, cavities),
  });
}

/**
 * Nome curto para card, breadcrumb e mensagem de CTA — o nome da peça com as
 * cavidades, sem o prefixo "Molde para". Vem do `name` em vez de recortar o
 * título, que dependeria da forma do modelo em cada idioma.
 */
export function buildShortTitle(
  dict: Dictionary,
  name: string,
  cavities: number | null
): string {
  if (cavities === null) return name;
  return t(dict.stock.templates.titleWithCavities, {
    prefix: name,
    cavities: cavityLabel(dict, cavities),
  });
}
