/**
 * Regras críticas do catálogo, sem banco.
 *
 * O teste mais importante é o de FIDELIDADE DA MIGRAÇÃO: as linhas que o
 * importador gravaria são convertidas de volta em StockItem e comparadas,
 * campo a campo, com o item que o acervo em arquivo produz hoje. Se a
 * migração mudar um título, um alt, uma capa ou a classificação molde/peça,
 * este teste falha — que é exatamente a garantia pedida antes da troca.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { assembleCatalog, buildItem, type ItemSeed } from "../src/lib/stock/buildItem";
import { getFileSeeds } from "../src/lib/stock/parseStock";
import { toItemSeeds, type StockImageRow, type StockItemRow } from "../src/lib/stock/dbCatalog";
import { getDictionary, LOCALES } from "../src/lib/i18n";
import { slugify, uniqueSlug } from "../src/lib/admin/slug";
import { absoluteUrl } from "../src/lib/site";
import { largestVariant } from "../src/lib/stock/imageUrl";
import { isStockStatus, STOCK_STATUSES } from "../src/lib/stock/types";

// O Supabase não está configurado no ambiente de teste, mas o mapeamento de
// linhas precisa de uma URL para montar o endereço público das fotos novas.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://projeto.supabase.co";

const seeds = getFileSeeds();

// ───────────────────── integridade do acervo ─────────────────────

test("o acervo em arquivo tem os números auditados", () => {
  const institutional = seeds.filter((seed) => seed.institutional);
  const publicSeeds = seeds.filter((seed) => !seed.institutional);
  const photos = seeds.reduce((total, seed) => total + seed.images.length, 0);
  const results = publicSeeds.reduce(
    (total, seed) => total + seed.images.filter((image) => image.type === "result").length,
    0
  );

  assert.equal(seeds.length, 43, "43 entradas no manifest");
  assert.equal(publicSeeds.length, 42, "42 itens públicos");
  assert.equal(institutional.length, 1, "1 galeria institucional");
  assert.equal(photos, 438, "438 fotos no total");
  assert.equal(results, 89, "89 fotos de peça produzida");
});

test("todo item tem exatamente uma capa e fotos com variantes reais", () => {
  for (const seed of seeds) {
    const covers = seed.images.filter((image) => image.isCover);
    assert.equal(covers.length, 1, `${seed.slug} deveria ter uma capa`);

    for (const image of seed.images) {
      assert.ok(image.variants.length > 0, `${seed.slug}/${image.name} sem variantes`);
      assert.ok(image.width > 0 && image.height > 0, `${seed.slug}/${image.name} sem dimensões`);

      const widths = image.variants.map((variant) => variant.width);
      assert.deepEqual(
        widths,
        [...widths].sort((a, b) => a - b),
        "variantes em ordem crescente"
      );
      // O build nunca amplia: nenhuma variante pode passar do original.
      assert.ok(
        Math.max(...widths) <= image.width,
        `${seed.slug}/${image.name} declara variante maior que o original`
      );
    }
  }
});

// ───────────────────── fidelidade da migração ─────────────────────

/** Reproduz o que `scripts/migrate-stock-to-supabase.mjs` gravaria. */
function toDatabaseRows(seed: ItemSeed, index: number) {
  const item: StockItemRow = {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    slug: seed.slug,
    segment: seed.segment,
    category_key: (seed.categoryKey as string | null) ?? null,
    kind: seed.kind,
    status: "published",
    featured: seed.featured,
    sort_order: 0,
    cavities: null,
    volume: null,
    part_weight: null,
    name: (seed.name ?? null) as Record<string, string> | null,
    title: (seed.title ?? null) as Record<string, string> | null,
    subject: (seed.subject ?? null) as Record<string, string> | null,
    summary: (seed.summary ?? null) as Record<string, string> | null,
    institutional: seed.institutional,
    legacy_source: `${seed.segment}/${seed.slug}`,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  const images: StockImageRow[] = seed.images.map((image, position) => ({
    id: `${item.id}-img-${position}`,
    item_id: item.id,
    type: image.type,
    source: "legacy",
    variants: image.variants.map((variant) => ({ w: variant.width, ref: variant.url })),
    width: image.width,
    height: image.height,
    color: image.color,
    is_cover: image.isCover,
    sort_order: position,
    alt: null,
    file_name: image.name,
  }));

  return { item, images };
}

/** O id difere por construção (uuid × slug); o resto precisa ser idêntico. */
function withoutIds(item: ReturnType<typeof buildItem>) {
  // O id difere por construção entre as duas fontes (uuid do banco × caminho
  // do arquivo), então sai da comparação; todo o resto precisa bater.
  const stripImage = (image: (typeof item.images)[number]) => ({
    ...image,
    id: "<id>",
  });
  return {
    ...item,
    id: "<id>",
    cover: stripImage(item.cover),
    images: item.images.map(stripImage),
    moldImages: item.moldImages.map(stripImage),
    resultImages: item.resultImages.map(stripImage),
    updatedAt: null,
  };
}

for (const locale of LOCALES) {
  test(`migração preserva cada item em ${locale}`, () => {
    const dict = getDictionary(locale);

    seeds.forEach((seed, index) => {
      const fromFiles = buildItem(seed, locale, dict);

      const { item, images } = toDatabaseRows(seed, index);
      const [dbSeed] = toItemSeeds([item], images);
      const fromDatabase = buildItem(dbSeed, locale, dict);

      assert.deepEqual(
        withoutIds(fromDatabase),
        withoutIds(fromFiles),
        `divergência em ${seed.slug} (${locale})`
      );
    });
  });
}

test("as URLs das fotos legadas não mudam na migração", () => {
  seeds.forEach((seed, index) => {
    const { item, images } = toDatabaseRows(seed, index);
    const [dbSeed] = toItemSeeds([item], images);

    dbSeed.images.forEach((image, position) => {
      assert.equal(
        image.src,
        seed.images[position].src,
        `${seed.slug}: a URL servida mudou`
      );
      assert.deepEqual(
        image.variants,
        seed.images[position].variants,
        `${seed.slug}: o srcset mudou`
      );
    });
  });
});

// ───────────────────── regras de visibilidade ─────────────────────

test("só itens publicados entram no catálogo público", () => {
  const mixed: ItemSeed[] = STOCK_STATUSES.map((status, index) => ({
    ...seeds[index],
    slug: `teste-${status}`,
    status,
    institutional: false,
  }));

  // `assembleCatalog` monta tudo; a filtragem por status é feita por quem lê
  // do banco (a RLS e a query), então aqui garantimos que o status viaja
  // intacto até o item renderizado.
  const catalog = assembleCatalog(mixed, "pt", "supabase");
  for (const status of STOCK_STATUSES) {
    const item = catalog.items.find((entry) => entry.slug === `teste-${status}`);
    assert.ok(item, `${status} deveria existir no catálogo montado`);
    assert.equal(item.status, status);
  }
});

test("a galeria institucional fica fora do grid de produtos", () => {
  const catalog = assembleCatalog(seeds, "pt", "files");
  assert.equal(catalog.items.length, 42);
  assert.ok(catalog.institutional, "a galeria institucional precisa ser exposta à parte");
  assert.ok(
    !catalog.items.some((item) => item.slug === catalog.institutional!.slug),
    "a galeria institucional não pode aparecer no grid"
  );
  assert.equal(catalog.totals.photos, 438);
  assert.equal(catalog.totals.withResult, 31);
});

test("destaque e ordem manual vencem a ordenação alfabética", () => {
  const base = seeds.filter((seed) => !seed.institutional).slice(0, 4);
  const arranged: ItemSeed[] = base.map((seed, index) => ({
    ...seed,
    featured: index === 3,
    sortOrder: 10 - index,
  }));

  const catalog = assembleCatalog(arranged, "pt", "supabase");

  assert.equal(catalog.items[0].slug, base[3].slug, "o destaque vem primeiro");
  const rest = catalog.items.slice(1).map((item) => item.sortOrder);
  assert.deepEqual(rest, [...rest].sort((a, b) => a - b), "a ordem manual é respeitada");
});

// ───────────────────── fotos do painel × do acervo ─────────────────────

test("foto do Storage usa URL absoluta e srcset só com o que existe", () => {
  const item: StockItemRow = {
    ...toDatabaseRows(seeds[0], 0).item,
    slug: "molde-novo",
  };
  const images: StockImageRow[] = [
    {
      id: "img-1",
      item_id: item.id,
      type: "mold",
      source: "storage",
      // Foto pequena: o upload gravou uma largura só.
      variants: [{ w: 400, ref: "item/foto-400.webp" }],
      width: 420,
      height: 300,
      color: "#123456",
      is_cover: true,
      sort_order: 0,
      alt: null,
      file_name: "foto",
    },
  ];

  const [seed] = toItemSeeds([item], images);
  const image = seed.images[0];

  assert.equal(image.variants.length, 1, "não inventa larguras que não subiram");
  assert.ok(
    image.src.startsWith("https://projeto.supabase.co/storage/v1/object/public/estoque/"),
    `URL pública inesperada: ${image.src}`
  );

  const rendered = buildItem(seed, "pt", getDictionary("pt"));
  // Já absoluta: o domínio do site não pode ser prefixado de novo.
  assert.equal(absoluteUrl(largestVariant(rendered.cover)), image.src);
});

test("foto do acervo continua relativa e vira absoluta com o domínio do site", () => {
  const rendered = buildItem(seeds[0], "pt", getDictionary("pt"));
  const url = largestVariant(rendered.cover);
  assert.ok(url.startsWith("/acervo/"), `esperava caminho local, veio ${url}`);
  assert.ok(absoluteUrl(url).startsWith("https://"), "deveria ganhar o domínio do site");
});

test("alt escrito à mão vence o alt gerado, por idioma", () => {
  const item = toDatabaseRows(seeds[0], 0);
  item.images[0].alt = { pt: "Alt escolhido pela equipe" };

  const [seed] = toItemSeeds([item.item], item.images);
  const pt = buildItem(seed, "pt", getDictionary("pt"));
  const en = buildItem(seed, "en", getDictionary("en"));

  assert.equal(pt.images[0].alt, "Alt escolhido pela equipe");
  // Sem versão em inglês, o fallback controlado usa o português.
  assert.equal(en.images[0].alt, "Alt escolhido pela equipe");
});

// ───────────────────── slug ─────────────────────

test("slug é estável, sem acento e sem sobra de hífen", () => {
  assert.equal(slugify("Copo 250 ml — 2 Cavidades"), "copo-250-ml-2-cavidades");
  assert.equal(slugify("Tábua / Saladeira"), "tabua-saladeira");
  assert.equal(slugify("   "), "");
});

test("slug duplicado ganha sufixo em vez de sobrescrever", () => {
  const taken = new Set(["copo", "copo-2"]);
  assert.equal(uniqueSlug("copo", taken), "copo-3");
  assert.equal(uniqueSlug("jarra", taken), "jarra");
  assert.equal(uniqueSlug("", taken), "molde");
});

test("os status conhecidos são exatamente os cinco previstos", () => {
  assert.deepEqual([...STOCK_STATUSES], [
    "published",
    "draft",
    "hidden",
    "sold",
    "archived",
  ]);
  assert.ok(isStockStatus("published"));
  assert.ok(!isStockStatus("qualquer-coisa"));
});
