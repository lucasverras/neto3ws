#!/usr/bin/env node
/**
 * Auditoria (somente leitura) do acervo em 3ws-images/imagens/.
 * Não apaga, não move e não renomeia nada — apenas relata.
 *
 *   node scripts/audit-stock.mjs
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "3ws-images", "imagens");
const CURATION = path.join(ROOT, "src", "lib", "stock", "curation.json");

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif|bmp|tiff?)$/i;
const EXPECTED_RE = /\.(jpe?g|png|webp)$/i;
/** Padrão dominante do acervo: numeração sequencial "01", "02", ... */
const CANONICAL_NAME_RE = /^\d{2,3}$/;
const LARGE_BYTES = 1.5 * 1024 * 1024;

const curation = fs.existsSync(CURATION) ? JSON.parse(fs.readFileSync(CURATION, "utf8")) : {};
const excluded = new Set(curation.exclude ?? []);
const curatedItems = curation.items ?? {};

const folders = [];
for (const segment of fs.readdirSync(SRC_DIR).sort()) {
  const segmentPath = path.join(SRC_DIR, segment);
  if (!fs.statSync(segmentPath).isDirectory()) continue;
  for (const slug of fs.readdirSync(segmentPath).sort()) {
    const folderPath = path.join(segmentPath, slug);
    if (fs.statSync(folderPath).isDirectory()) folders.push({ segment, slug, folderPath });
  }
}

const hashes = new Map();
const emptyFolders = [];
const problematicNames = [];
const largeImages = [];
const nonImageFiles = [];
const unassociated = [];
const collections = [];
const molds = [];
const categories = new Set();
let totalImages = 0;
let totalBytes = 0;
let resultImages = 0;
let foldersWithResult = 0;

for (const { segment, slug, folderPath } of folders) {
  const entries = fs.readdirSync(folderPath).filter((f) => !f.startsWith("."));
  const images = entries.filter((f) => IMAGE_RE.test(f));
  const others = entries.filter((f) => !IMAGE_RE.test(f));

  for (const f of others) nonImageFiles.push(`${segment}/${slug}/${f}`);
  if (images.length === 0) {
    emptyFolders.push(`${segment}/${slug}`);
    continue;
  }

  const curated = curatedItems[slug];
  if (curated?.kind === "collection") collections.push(slug);
  else molds.push(slug);
  if (curated?.category) categories.add(curated.category);

  const declaredResults = new Set(curated?.result ?? []);
  if (declaredResults.size > 0) foldersWithResult++;

  for (const file of images.sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
    const rel = `${segment}/${slug}/${file}`;
    const full = path.join(folderPath, file);
    const stat = fs.statSync(full);
    const name = file.replace(IMAGE_RE, "");

    if (excluded.has(rel)) {
      unassociated.push(`${rel} — excluído do catálogo: ${curation.excludeReasons?.[rel] ?? "sem motivo registrado"}`);
      continue;
    }

    totalImages++;
    totalBytes += stat.size;
    if (declaredResults.has(name)) resultImages++;

    if (!CANONICAL_NAME_RE.test(name) || !EXPECTED_RE.test(file)) {
      problematicNames.push(`${rel} (${!CANONICAL_NAME_RE.test(name) ? "fora do padrão NN" : "extensão atípica"})`);
    }
    if (stat.size > LARGE_BYTES) {
      largeImages.push(`${rel} — ${(stat.size / 1048576).toFixed(1)} MB`);
    }

    const hash = crypto.createHash("sha1").update(fs.readFileSync(full)).digest("hex");
    if (!hashes.has(hash)) hashes.set(hash, []);
    hashes.get(hash).push(rel);
  }
}

const duplicates = [...hashes.values()].filter((group) => group.length > 1);

function section(title, list, empty = "nenhum") {
  console.log(`\n${title}`);
  if (list.length === 0) {
    console.log(`  ${empty}`);
    return;
  }
  for (const line of list) console.log(`  · ${line}`);
}

console.log("═".repeat(72));
console.log("  AUDITORIA DO ACERVO — 3WS MOLDES");
console.log("═".repeat(72));
console.log(`Total de imagens:        ${totalImages} (${(totalBytes / 1048576).toFixed(0)} MB)`);
console.log(`Total de moldes:         ${molds.length} itens específicos`);
console.log(`Total de coleções:       ${collections.length} galerias agrupadas`);
console.log(`Total de categorias:     ${categories.size} declaradas na curadoria + derivadas do slug`);
console.log(`Fotos de peça produzida: ${resultImages} em ${foldersWithResult} pastas classificadas`);

section("Pastas vazias:", emptyFolders);
section(
  "Arquivos duplicados (mesmo conteúdo — NÃO removidos):",
  duplicates.map((g) => g.join("  ==  "))
);
section("Nomes problemáticos:", problematicNames);
section("Arquivos não-imagem no acervo:", nonImageFiles);
section("Imagens sem associação a um molde:", unassociated);
section(`Imagens muito grandes (> ${(LARGE_BYTES / 1048576).toFixed(1)} MB no original):`, largeImages);

console.log("\nObservação sobre 'possíveis imagens de resultado':");
console.log("  Os nomes de arquivo (01.jpg, 02.jpg…) não carregam nenhum sinal de");
console.log("  molde vs. peça produzida. A separação vem de curation.json, preenchida");
console.log("  por inspeção visual. Pastas sem entrada ficam com galeria única do molde.");
console.log("");
