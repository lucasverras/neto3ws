/**
 * Preparo das fotos no navegador, antes do upload.
 *
 * Replica o que `scripts/build-stock.mjs` faz com o acervo em arquivo: gera
 * WebP nas larguras 400 / 800 / 1400 e NUNCA amplia o original. Uma foto de
 * 900 px sobe só em 400 e 800, e o `srcset` do site lista exatamente essas
 * duas — nenhuma URL apontando para arquivo inexistente.
 *
 * Fazer isso aqui, e não no servidor, tem dois motivos práticos: o celular do
 * Neto envia 4 MB por foto e sobe ~200 KB, e não há dependência de
 * transformação paga de imagem no Supabase.
 */

import { UPLOAD_QUALITY, UPLOAD_WIDTHS } from "./constants";

export interface ProcessedVariant {
  width: number;
  blob: Blob;
}

export interface ProcessedImage {
  /** Dimensões do original, com a orientação EXIF já aplicada. */
  width: number;
  height: number;
  /** Cor dominante, usada como placeholder enquanto a foto carrega. */
  color: string;
  variants: ProcessedVariant[];
}

/**
 * Decodifica respeitando a orientação EXIF — foto de celular em retrato
 * chegaria deitada sem isto.
 */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Navegador sem suporte à opção: cai no <img>, que também aplica EXIF.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      image.src = url;
    });
  } finally {
    // A revogação imediata é segura: o decode já terminou quando resolvemos.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function dimensions(source: ImageBitmap | HTMLImageElement) {
  return source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };
}

function draw(
  source: ImageBitmap | HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O navegador não permitiu processar a imagem.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao converter a imagem."))),
      "image/webp",
      quality
    );
  });
}

/** Média dos pixels num canvas de 1×1 — barato e suficiente como placeholder. */
function dominantColor(source: ImageBitmap | HTMLImageElement): string {
  try {
    const canvas = draw(source, 1, 1);
    const [r, g, b] = canvas.getContext("2d")!.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return "#041c44";
  }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const source = await decode(file);
  const { width, height } = dimensions(source);

  if (!width || !height) throw new Error("Imagem sem dimensões legíveis.");

  const targets = UPLOAD_WIDTHS.filter((target) => target <= width);
  // Foto menor que a menor largura da escada: mantém o tamanho original em
  // vez de ampliar, exatamente como o pipeline do acervo.
  if (targets.length === 0) targets.push(width as (typeof UPLOAD_WIDTHS)[number]);

  const variants: ProcessedVariant[] = [];
  for (const target of targets) {
    const scaled = Math.round((height / width) * target);
    const blob = await toBlob(draw(source, target, scaled), UPLOAD_QUALITY);
    variants.push({ width: target, blob });
  }

  const color = dominantColor(source);
  if (source instanceof ImageBitmap) source.close();

  return { width, height, color, variants };
}
