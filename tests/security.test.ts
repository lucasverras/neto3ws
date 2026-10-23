/**
 * Invariantes de segurança do painel.
 *
 * Alguns destes testes leem o próprio código-fonte. É de propósito: a regra
 * "nenhuma mutação sem autorização" vale para as funções que existem HOJE e
 * para as que alguém acrescentar amanhã, e só uma varredura do arquivo pega
 * a segunda. O mesmo vale para as policies de RLS nas migrations.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { isAdminPath } from "../src/lib/supabase/proxySession";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const mutations = read("src/lib/admin/mutations.ts");
const schema = read("supabase/migrations/0001_stock.sql");
const storage = read("supabase/migrations/0002_storage.sql");

// ───────────────────── autorização nas mutações ─────────────────────

test("toda mutação exportada passa por requireAdmin", () => {
  // Captura `export async function nome(` no módulo de mutações.
  const exported = [...mutations.matchAll(/export async function (\w+)\s*\(/g)].map(
    (match) => match[1]
  );

  assert.ok(exported.length >= 7, `esperava várias mutações, achei ${exported.length}`);

  for (const name of exported) {
    const start = mutations.indexOf(`export async function ${name}`);
    const next = exported
      .map((other) => mutations.indexOf(`export async function ${other}`))
      .filter((index) => index > start)
      .sort((a, b) => a - b)[0];
    const body = mutations.slice(start, next === undefined ? undefined : next);

    assert.match(
      body,
      /requireAdmin\(\)/,
      `${name}() grava sem passar por requireAdmin()`
    );
  }
});

test("o service role nunca é importado pelo código do painel", () => {
  // A chave que ignora a RLS só pode ser usada pelo script de importação.
  for (const path of [
    "src/lib/admin/mutations.ts",
    "src/lib/admin/queries.ts",
    "src/lib/admin/auth.ts",
    "src/lib/admin/authActions.ts",
    "src/lib/admin/uploadActions.ts",
    "src/lib/stock/catalog.ts",
  ]) {
    assert.doesNotMatch(
      read(path),
      /supabase\/admin|createServiceRoleClient|SERVICE_ROLE/,
      `${path} não deveria tocar na service role`
    );
  }
});

test("o cliente de service role é server-only", () => {
  assert.match(read("src/lib/supabase/admin.ts"), /^import "server-only";/m);
});

// ───────────────────── RLS ─────────────────────

test("as tabelas do estoque têm RLS ligada", () => {
  for (const table of ["stock_items", "stock_images", "stock_audit_log", "admin_users"]) {
    assert.match(
      schema,
      new RegExp(`alter table public\\.${table}\\s+enable row level security`),
      `${table} sem RLS`
    );
  }
});

test("leitura pública só enxerga itens publicados", () => {
  const policy = schema.slice(
    schema.indexOf('create policy "stock_items_public_read"'),
    schema.indexOf('create policy "stock_items_admin_read"')
  );
  assert.match(policy, /using \(status = 'published'\)/);
});

test("toda escrita exige is_stock_admin(), não apenas sessão", () => {
  const writePolicies = [
    "stock_items_admin_insert",
    "stock_items_admin_update",
    "stock_items_admin_delete",
    "stock_images_admin_insert",
    "stock_images_admin_update",
    "stock_images_admin_delete",
  ];

  for (const name of writePolicies) {
    const start = schema.indexOf(`create policy "${name}"`);
    assert.ok(start > -1, `policy ${name} não existe`);
    const body = schema.slice(start, schema.indexOf(";", start));
    assert.match(body, /public\.is_stock_admin\(\)/, `${name} aceita qualquer autenticado`);
  }
});

test("o bucket de fotos só aceita escrita de administrador", () => {
  for (const name of [
    "stock_photos_admin_insert",
    "stock_photos_admin_update",
    "stock_photos_admin_delete",
  ]) {
    const start = storage.indexOf(`create policy "${name}"`);
    assert.ok(start > -1, `policy ${name} não existe`);
    const body = storage.slice(start, storage.indexOf(";", start));
    assert.match(body, /is_stock_admin\(\)/, `${name} aceita qualquer autenticado`);
  }
});

test("ninguém se promove a administrador pela API", () => {
  // admin_users só tem policy de SELECT da própria linha.
  const section = schema.slice(
    schema.indexOf("create table if not exists public.admin_users"),
    schema.indexOf("create table if not exists public.stock_items")
  );
  assert.match(section, /create policy "admin_users_self_read"\s+on public\.admin_users for select/);
  assert.doesNotMatch(section, /for (insert|update|delete)/);
});

test("as funções security definer fixam o search_path", () => {
  // Só declarações reais: `security definer` sozinho numa linha. Citações da
  // expressão dentro de comentários não contam.
  for (const file of [
    "supabase/migrations/0001_stock.sql",
    "supabase/migrations/0004_login_throttle.sql",
  ]) {
    const sql = read(file);
    const declared = [...sql.matchAll(/^security definer$/gm)];
    const guarded = [...sql.matchAll(/^security definer\nset search_path = /gm)];
    assert.ok(declared.length > 0, `${file} deveria declarar funções security definer`);
    assert.equal(
      guarded.length,
      declared.length,
      `${file}: toda função security definer precisa fixar search_path`
    );
  }
});

test("nenhuma senha literal nas migrations", () => {
  for (const file of [
    "supabase/migrations/0001_stock.sql",
    "supabase/migrations/0002_storage.sql",
    "supabase/migrations/0003_admin_seed.sql",
    "supabase/migrations/0004_login_throttle.sql",
  ]) {
    const sql = read(file);
    assert.doesNotMatch(sql, /encrypted_password|crypt\(|password\s*=\s*'/i, `${file} traz senha`);
  }
});

// ───────────────────── rotas ─────────────────────

test("o painel fica fora do redirecionamento de idioma", () => {
  assert.ok(isAdminPath("/admin"));
  assert.ok(isAdminPath("/admin/login"));
  assert.ok(isAdminPath("/admin/produtos/novo"));
  assert.ok(!isAdminPath("/administrativo"));
  assert.ok(!isAdminPath("/pt/estoque"));

  const proxy = read("src/proxy.ts");
  // O desvio do painel precisa vir ANTES da regra de prefixo de idioma.
  assert.ok(
    proxy.indexOf("isAdminPath(pathname)") < proxy.indexOf("hasLocale"),
    "a checagem do painel deve preceder o redirecionamento de idioma"
  );
});

test("todas as telas do painel são noindex", () => {
  assert.match(read("src/app/admin/layout.tsx"), /robots:\s*\{\s*index:\s*false/);

  for (const page of [
    "src/app/admin/login/page.tsx",
    "src/app/admin/recuperar/page.tsx",
    "src/app/admin/nova-senha/page.tsx",
  ]) {
    assert.match(read(page), /index:\s*false/, `${page} sem noindex`);
  }
});

test("o painel não aparece no sitemap", () => {
  assert.doesNotMatch(read("src/app/sitemap.ts"), /\/admin/);
});

test("páginas do painel conferem a autorização no servidor", () => {
  for (const page of [
    "src/app/admin/page.tsx",
    "src/app/admin/produtos/novo/page.tsx",
    "src/app/admin/produtos/[id]/page.tsx",
    "src/app/admin/produtos/[id]/preview/page.tsx",
  ]) {
    const source = read(page);
    assert.match(source, /getAdminUser\(\)/, `${page} não confere o administrador`);
    assert.match(source, /redirect\(/, `${page} não redireciona sem sessão`);
  }
});

test("o login responde a mesma mensagem para e-mail e senha errados", () => {
  const actions = read("src/lib/admin/authActions.ts");
  const generic = [...actions.matchAll(/GENERIC_LOGIN_ERROR/g)];
  // Uma definição + os dois caminhos de falha (credencial e falta de permissão).
  assert.ok(generic.length >= 3, "a mensagem genérica deveria cobrir os dois casos");
  assert.match(actions, /register_login_attempt/, "login sem freio de tentativas");
});
