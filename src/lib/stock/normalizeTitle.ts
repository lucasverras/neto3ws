/**
 * Slug de pasta → texto legível em português.
 *
 * O acervo nomeia as pastas sem acento e sem espaço
 * ("copo-250ml-2-cavidades"), então tudo que aparece na interface é
 * reconstruído aqui. Nada além do que está escrito no próprio slug é
 * extraído: tipo de peça, volume, peso da peça e número de cavidades.
 */

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

/** Ficam em minúscula no meio do título. */
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
  /** Nome legível sem o prefixo "Molde para" e sem as cavidades. */
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

export function cavityLabel(cavities: number) {
  return `${cavities} ${cavities === 1 ? "Cavidade" : "Cavidades"}`;
}

export function cavityLabelLower(cavities: number) {
  return `${cavities} ${cavities === 1 ? "cavidade" : "cavidades"}`;
}

/**
 * Título completo (H1 / nome do card).
 * "copo-250ml-2-cavidades" → "Molde para Copo 250 ml – 2 Cavidades"
 */
export function buildTitle(parsed: ParsedSlug, kind: "mold" | "collection"): string {
  const prefix = kind === "collection" ? "Moldes para" : "Molde para";
  if (parsed.cavities === null) return `${prefix} ${parsed.base}`;
  return `${prefix} ${parsed.base} – ${cavityLabel(parsed.cavities)}`;
}

/**
 * Trecho em minúsculas para alts e frases corridas.
 * "Copo 250 ml" → "copo de 250 ml"
 */
export function buildSubject(parsed: ParsedSlug): string {
  const lower = parsed.base.toLocaleLowerCase("pt-BR");
  if (parsed.volume) {
    const measure = parsed.volume.toLocaleLowerCase("pt-BR");
    return lower.replace(measure, `de ${measure}`);
  }
  if (parsed.partWeight) {
    const measure = parsed.partWeight.toLocaleLowerCase("pt-BR");
    return lower.replace(measure, `com peça de ${measure}`);
  }
  return lower;
}

/** Remove o prefixo "Molde para " / "Moldes para " para o card. */
export function toShortTitle(title: string): string {
  return title.replace(/^Moldes?\s+para\s+/i, "");
}

/** "Vasos, Baldes e Cestos" → "vasos-baldes-e-cestos" */
export function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
