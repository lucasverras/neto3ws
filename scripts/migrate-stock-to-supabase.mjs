#!/usr/bin/env node
/**
 * Importa o acervo em arquivo para o Supabase.
 *
 *   node scripts/migrate-stock-to-supabase.mjs            # simulação
 *   node scripts/migrate-stock-to-supabase.mjs --apply    # grava
 *   node scripts/migrate-stock-to-supabase.mjs --verify   # só confere
 *
 * Princípios:
 *
 *  - IDEMPOTENTE. A chave é o `slug` (e `legacy_source` como reforço), então
 *    rodar duas vezes atualiza em vez de duplicar.
 *  - NÃO DESTRUTIVO. Nada é apagado: produtos criados no painel continuam
 *    intactos, e um item já importado nunca é rebaixado de status.
 *  - AS FOTOS FICAM ONDE ESTÃO. Os derivativos WebP do acervo seguem sendo
 *    servidos de /acervo/..., gerados pelo build. O registro só aponta para
 *    eles (`source: 'legacy'`). Nenhum byte é copiado para o Storage.
 *  - RELATÓRIO ANTES E DEPOIS, com conferência item a item e foto a foto.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const root = (path) => resolve(HERE, "..", path);

const APPLY = process.argv.includes("--apply");
const VERIFY_ONLY = process.argv.includes("--verify");

const manifest = JSON.parse(readFileSync(root("src/lib/stock/catalog.generated.json"), "utf8"));
const curation = JSON.parse(readFileSync(root("src/lib/stock/curation.json"), "utf8"));

const CURATED = curation.items ?? {};
const INSTITUTIONAL = curation.institutional ?? null;
const FEATURED = new Set(curation.featured ?? []);
const BASE_PATH = manifest.basePath ?? "/acervo";

// ───────────────────────── fonte: arquivos ─────────────────────────

/** Texto por idioma; string única vale para os três. */
function localized(value) {
  if (value === undefined || value === null) return {};
  if (typeof value === "string") {
    const text = value.trim();
    return text ? { pt: text, en: text, es: text } : {};
  }
  return Object.fromEntries(
    ["pt", "en", "es"]
      .map((locale) => [locale, value[locale]?.trim()])
      .filter(([, text]) => text)
  );
}

function buildSource() {
  return manifest.items.map((entry) => {
    const curated = CURATED[entry.slug] ?? {};
    const resultNames = new Set(curated.result ?? []);

    const images = entry.images.map((image, index) => ({
      // Ordem e nome do arquivo identificam a foto dentro do item — é o que
      // torna a reimportação idempotente sem uuid estável no acervo.
      fileName: image.name,
      type: resultNames.has(image.name) ? "result" : "mold",
      source: "legacy",
      variants: image.v.map((width) => ({
        w: width,
        ref: `${BASE_PATH}/${entry.slug}/${image.name}-${width}.webp`,
      })),
      width: image.w,
      height: image.h,
      color: image.color,
      sortOrder: index,
      isCover: curated.cover === image.name,
      alt: {},
    }));

    if (images.length > 0 && !images.some((image) => image.isCover)) {
      const first = images.find((image) => image.type === "mold") ?? images[0];
      first.isCover = true;
    }

    return {
      slug: entry.slug,
      segment: entry.segment,
      legacySource: entry.source,
      kind: curated.kind ?? "mold",
      // Null de propósito: o site deduz a categoria pelo slug, e gravar um
      // palpite aqui congelaria para sempre uma regra que hoje é viva.
      categoryKey: curated.category ?? null,
      // Idem: cavidades, volume e peso saem do nome da pasta.
      cavities: null,
      volume: null,
      partWeight: null,
      name: localized(curated.name),
      title: localized(curated.title),
      subject: localized(curated.subject),
      summary: localized(curated.summary),
      featured: FEATURED.has(entry.slug),
      institutional: entry.slug === INSTITUTIONAL,
      // Tudo que está no acervo hoje está publicado no site hoje.
      status: "published",
      images,
    };
  });
}

// ───────────────────────── relatório ─────────────────────────

function summarize(items) {
  const photos = items.reduce((total, item) => total + item.images.length, 0);
  const results = items.reduce(
    (total, item) => total + item.images.filter((image) => image.type === "result").length,
    0
  );
  const institutional = items.filter((item) => item.institutional);
  const published = items.filter((item) => !item.institutional);
  return {
    entries: items.length,
    publicItems: published.length,
    institutional: institutional.length,
    photos,
    publicPhotos: photos - institutional.reduce((t, i) => t + i.images.length, 0),
    resultPhotos: results,
    withResult: published.filter((item) =>
      item.images.some((image) => image.type === "result")
    ).length,
    featured: items.filter((item) => item.featured).length,
    segments: [...new Set(items.map((item) => item.segment))].sort(),
  };
}

function printSummary(label, summary) {
  console.log(`\n── ${label} ──`);
  console.log(`  entradas .................. ${summary.entries}`);
  console.log(`  itens públicos ............ ${summary.publicItems}`);
  console.log(`  galeria institucional ..... ${summary.institutional}`);
  console.log(`  fotos (todas) ............. ${summary.photos}`);
  console.log(`  fotos públicas ............ ${summary.publicPhotos}`);
  console.log(`  fotos de peça produzida ... ${summary.resultPhotos}`);
  console.log(`  itens com peça produzida .. ${summary.withResult}`);
  console.log(`  destaques ................. ${summary.featured}`);
  console.log(`  segmentos ................. ${summary.segments.join(", ")}`);
}

// ───────────────────────── Supabase ─────────────────────────

function connect() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "\n✗ Faltam credenciais.\n" +
        "  Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY\n" +
        "  (a service role ignora a RLS e só é usada por este script, nunca no navegador).\n"
    );
    process.exit(1);
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readRemote(supabase) {
  const { data: items, error } = await supabase
    .from("stock_items")
    .select("id, slug, segment, status, featured, institutional, legacy_source, sort_order");
  if (error) throw new Error(`Falha ao ler stock_items: ${error.message}`);

  const { data: images, error: imagesError } = await supabase
    .from("stock_images")
    .select("id, item_id, file_name, type, source, variants, is_cover, sort_order");
  if (imagesError) throw new Error(`Falha ao ler stock_images: ${imagesError.message}`);

  const byItem = new Map();
  for (const image of images ?? []) {
    const list = byItem.get(image.item_id) ?? [];
    list.push(image);
    byItem.set(image.item_id, list);
  }

  return (items ?? []).map((item) => ({
    ...item,
    images: (byItem.get(item.id) ?? []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

function remoteSummary(rows) {
  return summarize(
    rows.map((row) => ({
      institutional: row.institutional === true,
      featured: row.featured === true,
      segment: row.segment ?? "outros",
      images: (row.images ?? []).map((image) => ({ type: image.type })),
    }))
  );
}

async function importItem(supabase, item, existing) {
  const row = {
    slug: item.slug,
    segment: item.segment,
    category_key: item.categoryKey,
    kind: item.kind,
    featured: item.featured,
    institutional: item.institutional,
    legacy_source: item.legacySource,
    cavities: item.cavities,
    volume: item.volume,
    part_weight: item.partWeight,
    name: item.name,
    title: item.title,
    subject: item.subject,
    summary: item.summary,
  };

  let itemId = existing?.id;

  if (existing) {
    // Status e ordem NÃO são sobrescritos: se o dono despublicou ou
    // reordenou algo depois da primeira importação, isso é decisão dele.
    const { error } = await supabase.from("stock_items").update(row).eq("id", existing.id);
    if (error) throw new Error(`${item.slug}: ${error.message}`);
  } else {
    const { data, error } = await supabase
      .from("stock_items")
      .insert({ ...row, status: item.status, sort_order: 0 })
      .select("id")
      .single();
    if (error) throw new Error(`${item.slug}: ${error.message}`);
    itemId = data.id;
  }

  // Fotos: casadas por nome de arquivo dentro do item.
  const existingByName = new Map(
    (existing?.images ?? []).map((image) => [image.file_name, image])
  );

  for (const image of item.images) {
    const match = existingByName.get(image.fileName);
    const payload = {
      item_id: itemId,
      file_name: image.fileName,
      type: image.type,
      source: image.source,
      variants: image.variants,
      width: image.width,
      height: image.height,
      color: image.color,
      sort_order: image.sortOrder,
    };

    if (match) {
      // `is_cover` sai do update: o índice único só aceita uma capa por item
      // e trocar foto a foto colidiria. A capa é acertada depois, de uma vez.
      const { error } = await supabase
        .from("stock_images")
        .update(payload)
        .eq("id", match.id);
      if (error) throw new Error(`${item.slug}/${image.fileName}: ${error.message}`);
    } else {
      const { error } = await supabase
        .from("stock_images")
        .insert({ ...payload, is_cover: false });
      if (error) throw new Error(`${item.slug}/${image.fileName}: ${error.message}`);
    }
  }

  // Capa: zera e marca a escolhida — dois passos, nunca violando o índice.
  const cover = item.images.find((image) => image.isCover);
  if (cover) {
    await supabase.from("stock_images").update({ is_cover: false }).eq("item_id", itemId);
    const { error } = await supabase
      .from("stock_images")
      .update({ is_cover: true })
      .eq("item_id", itemId)
      .eq("file_name", cover.fileName);
    if (error) throw new Error(`${item.slug}: capa — ${error.message}`);
  }

  return existing ? "atualizado" : "criado";
}

/** Conferência item a item e foto a foto entre o arquivo e o banco. */
function compare(source, remote) {
  const remoteBySlug = new Map(remote.map((row) => [row.slug, row]));
  const problems = [];

  for (const item of source) {
    const row = remoteBySlug.get(item.slug);
    if (!row) {
      problems.push(`faltando no banco: ${item.slug}`);
      continue;
    }

    const remoteNames = new Set((row.images ?? []).map((image) => image.file_name));
    for (const image of item.images) {
      if (!remoteNames.has(image.fileName)) {
        problems.push(`foto faltando: ${item.slug}/${image.fileName}`);
      }
    }

    const remoteResults = (row.images ?? []).filter((image) => image.type === "result").length;
    const sourceResults = item.images.filter((image) => image.type === "result").length;
    if (remoteResults !== sourceResults) {
      problems.push(
        `classificação molde/peça divergente em ${item.slug}: arquivo ${sourceResults}, banco ${remoteResults}`
      );
    }

    if (row.institutional !== item.institutional) {
      problems.push(`flag institucional divergente em ${item.slug}`);
    }
  }

  return problems;
}

// ───────────────────────── execução ─────────────────────────

async function main() {
  const source = buildSource();
  printSummary("ACERVO EM ARQUIVO (origem)", summarize(source));

  if (!APPLY && !VERIFY_ONLY) {
    console.log(
      "\n● Simulação. Nada foi gravado.\n" +
        "  Para importar de verdade:  node scripts/migrate-stock-to-supabase.mjs --apply\n"
    );
  }

  const supabase = connect();
  const before = await readRemote(supabase);
  printSummary("BANCO ANTES", remoteSummary(before));

  if (VERIFY_ONLY) {
    const problems = compare(source, before);
    report(problems);
    return;
  }

  if (!APPLY) {
    const bySlug = new Map(before.map((row) => [row.slug, row]));
    const toCreate = source.filter((item) => !bySlug.has(item.slug));
    const toUpdate = source.filter((item) => bySlug.has(item.slug));
    console.log(`\n── O QUE SERIA FEITO ──`);
    console.log(`  criar ..................... ${toCreate.length}`);
    console.log(`  atualizar ................. ${toUpdate.length}`);
    console.log(`  intocados no banco ........ ${before.length - toUpdate.length}`);
    if (toCreate.length > 0) {
      console.log(`\n  novos: ${toCreate.map((item) => item.slug).join(", ")}`);
    }
    return;
  }

  console.log("\n── IMPORTANDO ──");
  const bySlug = new Map(before.map((row) => [row.slug, row]));
  let created = 0;
  let updated = 0;

  for (const item of source) {
    const action = await importItem(supabase, item, bySlug.get(item.slug));
    if (action === "criado") created += 1;
    else updated += 1;
    process.stdout.write(`  ${action.padEnd(10)} ${item.slug}\n`);
  }

  console.log(`\n  criados: ${created} · atualizados: ${updated}`);

  const after = await readRemote(supabase);
  printSummary("BANCO DEPOIS", remoteSummary(after));
  report(compare(source, after));
}

function report(problems) {
  console.log("\n── CONFERÊNCIA ITEM A ITEM ──");
  if (problems.length === 0) {
    console.log("  ✓ Tudo que está no acervo está no banco, com as fotos e a");
    console.log("    classificação molde/peça preservadas.\n");
    return;
  }
  console.log(`  ✗ ${problems.length} divergência(s):\n`);
  for (const problem of problems) console.log(`    · ${problem}`);
  console.log("");
  process.exitCode = 1;
}

main().catch((cause) => {
  console.error(`\n✗ ${cause.message}\n`);
  process.exit(1);
});
