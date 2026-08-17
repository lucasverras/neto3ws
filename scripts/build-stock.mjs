#!/usr/bin/env node
/**
 * Gera o catálogo de estoque a partir de 3ws-images/imagens/.
 *
 *   3ws-images/imagens/<segmento>/<slug>/NN.jpg   (originais — nunca tocados)
 *        ↓
 *   public/acervo/<slug>/NN-{400,600,800,1400}.webp   (derivativos servidos)
 *   src/lib/stock/catalog.generated.json          (manifest lido pelo app)
 *
 * Roda no `prebuild`, então basta soltar uma pasta nova no acervo e buildar.
 * É incremental: derivativo mais novo que o original é pulado.
 *
 *   node scripts/build-stock.mjs [--force] [--quiet]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "3ws-images", "imagens");
const OUT_IMG_DIR = path.join(ROOT, "public", "acervo");
const OUT_MANIFEST = path.join(ROOT, "src", "lib", "stock", "catalog.generated.json");
const CURATION = path.join(ROOT, "src", "lib", "stock", "curation.json");

/**
 * Larguras geradas.
 *   400  card em desktop 1x
 *   600  card em celular 2 colunas com DPR 3 (~585 px reais) — sem esta faixa
 *        o mobile cai no arquivo de 800 e baixa ~45% a mais de bytes
 *   800  card retina / grade da galeria
 *   1400 lightbox
 */
const WIDTHS = [400, 600, 800, 1400];
const QUALITY = { 400: 72, 600: 72, 800: 72, 1400: 74 };
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

const FORCE = process.argv.includes("--force");
const QUIET = process.argv.includes("--quiet");

function log(...args) {
  if (!QUIET) console.log(...args);
}

function readCuration() {
  if (!fs.existsSync(CURATION)) return { exclude: [], items: {} };
  return JSON.parse(fs.readFileSync(CURATION, "utf8"));
}

/** Lista <segmento>/<slug> em ordem estável. */
function listFolders() {
  const out = [];
  for (const segment of fs.readdirSync(SRC_DIR).sort()) {
    const segmentPath = path.join(SRC_DIR, segment);
    if (!fs.statSync(segmentPath).isDirectory()) continue;
    for (const slug of fs.readdirSync(segmentPath).sort()) {
      const folderPath = path.join(segmentPath, slug);
      if (!fs.statSync(folderPath).isDirectory()) continue;
      out.push({ segment, slug, folderPath });
    }
  }
  return out;
}

/** Dimensões já com a orientação EXIF aplicada. */
function orientedSize(meta) {
  const swap = (meta.orientation ?? 1) >= 5;
  return {
    width: swap ? meta.height : meta.width,
    height: swap ? meta.width : meta.height,
  };
}

/**
 * Larguras a gerar para um original de `width` px.
 *
 * Nunca aumenta a imagem. Quando o original é menor que a maior largura da
 * lista, a própria largura entra como variante extra — senão o lightbox
 * mostraria menos resolução do que existe. Mas só quando o ganho é real:
 * um original de 960 px sobre um alvo de 800 px não justifica um terceiro
 * arquivo, então exige-se pelo menos 20% a mais que o último alvo.
 */
function targetWidthsFor(width) {
  const targets = WIDTHS.filter((w) => w <= width);
  const largest = Math.min(width, WIDTHS[WIDTHS.length - 1]);
  const last = targets[targets.length - 1];
  if (last === undefined || largest > last * 1.2) targets.push(largest);
  return [...new Set(targets)].sort((a, b) => a - b);
}

/**
 * Remove derivativos órfãos: fotos apagadas do acervo, larguras que deixaram de
 * ser geradas, pastas renomeadas. Age apenas dentro de public/acervo, que é
 * 100% gerado — o acervo original nunca é tocado.
 */
function pruneOrphans(expected) {
  if (!fs.existsSync(OUT_IMG_DIR)) return 0;
  let removed = 0;
  for (const dir of fs.readdirSync(OUT_IMG_DIR)) {
    const dirPath = path.join(OUT_IMG_DIR, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    const keep = expected.get(dir);
    if (!keep) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      removed++;
      continue;
    }
    for (const file of fs.readdirSync(dirPath)) {
      if (keep.has(file)) continue;
      fs.rmSync(path.join(dirPath, file), { force: true });
      removed++;
    }
  }
  return removed;
}

function toHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

async function processImage(sourceFile, outDir, name) {
  const image = sharp(sourceFile, { failOn: "none" });
  const meta = await image.metadata();
  const { width, height } = orientedSize(meta);
  if (!width || !height) throw new Error(`Sem dimensões: ${sourceFile}`);

  const targets = targetWidthsFor(width);

  const srcStat = fs.statSync(sourceFile);
  let written = 0;

  for (const w of targets) {
    const outFile = path.join(outDir, `${name}-${w}.webp`);
    if (!FORCE && fs.existsSync(outFile) && fs.statSync(outFile).mtimeMs >= srcStat.mtimeMs) continue;
    await sharp(sourceFile, { failOn: "none" })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY[w] ?? 74, effort: 5 })
      .toFile(outFile);
    written++;
  }

  const { dominant } = await image.stats();

  return {
    image: { name, w: width, h: height, v: targets, color: toHex(dominant) },
    written,
  };
}

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`[estoque] Acervo não encontrado em ${path.relative(ROOT, SRC_DIR)}.`);
    console.error("[estoque] O catálogo precisa das imagens originais para gerar os derivativos.");
    process.exit(1);
  }

  const curation = readCuration();
  const excluded = new Set(curation.exclude ?? []);
  const folders = listFolders();

  const seen = new Map();
  for (const f of folders) {
    if (seen.has(f.slug)) {
      console.error(
        `[estoque] Slug duplicado "${f.slug}" em ${seen.get(f.slug)} e ${f.segment}. ` +
          "Cada pasta de 2º nível precisa de um nome único (ela vira uma URL)."
      );
      process.exit(1);
    }
    seen.set(f.slug, f.segment);
  }

  fs.mkdirSync(OUT_IMG_DIR, { recursive: true });

  const items = [];
  const expected = new Map();
  let totalImages = 0;
  let totalWritten = 0;

  for (const { segment, slug, folderPath } of folders) {
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => IMAGE_RE.test(f))
      .filter((f) => !excluded.has(`${segment}/${slug}/${f}`))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

    if (files.length === 0) {
      log(`[estoque] pulando ${segment}/${slug} — sem imagens elegíveis`);
      continue;
    }

    const outDir = path.join(OUT_IMG_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });

    const images = [];
    const keep = new Set();
    for (const file of files) {
      const name = file.replace(IMAGE_RE, "");
      const { image, written } = await processImage(path.join(folderPath, file), outDir, name);
      images.push(image);
      totalWritten += written;
      for (const w of image.v) keep.add(`${name}-${w}.webp`);
    }
    expected.set(slug, keep);

    totalImages += images.length;
    items.push({ slug, segment, source: `${segment}/${slug}`, images });
    log(`[estoque] ${slug.padEnd(42)} ${String(images.length).padStart(3)} fotos`);
  }

  const pruned = pruneOrphans(expected);

  const manifest = {
    // Sem timestamp de propósito: o manifest só muda quando o acervo muda,
    // o que mantém o diff limpo e as URLs estáveis para o Google Imagens.
    widths: WIDTHS,
    basePath: "/acervo",
    items,
  };

  fs.writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  log(
    `\n[estoque] ${items.length} itens · ${totalImages} imagens · ` +
      `${totalWritten} derivativos gerados (demais já em cache)` +
      (pruned > 0 ? ` · ${pruned} órfãos removidos` : "")
  );
  log(`[estoque] manifest → ${path.relative(ROOT, OUT_MANIFEST)}`);
}

main().catch((err) => {
  console.error("[estoque] falhou:", err);
  process.exit(1);
});
