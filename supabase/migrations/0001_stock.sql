-- 3WS Moldes — catálogo de estoque editável pelo painel.
-- Rode no Supabase: SQL Editor -> cole -> Run. Idempotente.

create extension if not exists pgcrypto;

-- ═══════════════════════ administradores ═══════════════════════
-- Autorização NÃO é "tem sessão": é "o UUID está nesta tabela".
-- Um usuário qualquer criado no Auth não consegue tocar no estoque.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'admin' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

/**
 * Checagem usada por todas as policies de escrita.
 *
 * `security definer` + `search_path` fixo: a função lê admin_users passando
 * por cima da RLS da própria tabela (senão a policy se consultaria em
 * recursão) sem abrir caminho para injeção via search_path.
 */
create or replace function public.is_stock_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_stock_admin() from public;
grant execute on function public.is_stock_admin() to authenticated;

-- O admin enxerga a própria linha (para o painel mostrar quem está logado).
-- Ninguém se promove a admin pelo navegador: não existe policy de insert.
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- ═══════════════════════ itens do estoque ═══════════════════════
create table if not exists public.stock_items (
  id            uuid primary key default gen_random_uuid(),

  -- URL pública. Preservado na migração: o que o Google já indexou continua
  -- resolvendo no mesmo endereço.
  slug          text not null unique,

  -- Pasta de 1º nível do acervo (moldes-injecao-plastica, porta-moldes…).
  -- Texto livre de propósito: a lista válida vive em src/lib/stock/taxonomy.ts
  -- e cai em "outros" se não for reconhecida, igual ao comportamento atual.
  segment       text not null default 'outros',

  -- NULL = "deduza do slug", que é como o acervo sempre funcionou
  -- (`/balde/` → Vasos, Baldes e Cestos, regras em taxonomy.ts). Um valor
  -- gravado é escolha explícita do administrador e vence a dedução.
  -- Por isso é anulável e sem default: 'diversos' é uma categoria de
  -- verdade e não poderia significar "não sei".
  category_key  text,

  kind          text not null default 'mold'
                check (kind in ('mold', 'collection')),

  status        text not null default 'draft'
                check (status in ('published', 'draft', 'hidden', 'sold', 'archived')),

  featured      boolean not null default false,

  -- Ordem definida pelo dono arrastando no painel. Vale no painel E no site.
  sort_order    integer not null default 0,

  -- Dados técnicos: todos opcionais. O acervo não conhece a maioria deles e
  -- nada aqui é inferido de foto.
  cavities      integer check (cavities is null or (cavities > 0 and cavities <= 512)),
  volume        text,
  part_weight   text,

  -- Textos por idioma: { "pt": "...", "en": "...", "es": "..." }.
  -- Faltando um idioma, o código cai no português (fallback controlado) em
  -- vez de inventar tradução.
  name          jsonb not null default '{}'::jsonb,
  title         jsonb not null default '{}'::jsonb,
  subject       jsonb not null default '{}'::jsonb,
  summary       jsonb not null default '{}'::jsonb,

  -- Só para a equipe. NUNCA é lido pelo site público.
  internal_notes text,

  -- Galeria institucional (prova visual do galpão): fora do grid de produtos
  -- e sem URL própria, exatamente como hoje.
  institutional boolean not null default false,

  -- Caminho da pasta original no acervo, quando o item veio da importação.
  -- Serve de chave idempotente e de rastro da origem.
  legacy_source text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists stock_items_sort_idx     on public.stock_items (sort_order asc);
create index if not exists stock_items_status_idx   on public.stock_items (status);
create index if not exists stock_items_category_idx on public.stock_items (category_key);
create unique index if not exists stock_items_legacy_source_idx
  on public.stock_items (legacy_source) where legacy_source is not null;

-- ═══════════════════════ fotos ═══════════════════════
create table if not exists public.stock_images (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.stock_items (id) on delete cascade,

  -- Molde × peça produzida. Nunca deduzido da aparência: é escolha do usuário.
  type        text not null default 'mold' check (type in ('mold', 'result')),

  -- 'legacy'  = derivativos WebP gerados no build, servidos de /acervo/...
  -- 'storage' = enviados pelo painel, no bucket do Supabase.
  -- As duas origens convivem: foto antiga continua no endereço de sempre.
  source      text not null default 'storage' check (source in ('legacy', 'storage')),

  -- Variantes que REALMENTE existem, da menor para a maior:
  --   [{ "w": 400, "ref": "/acervo/copo/01-400.webp" }]   (legacy: URL pronta)
  --   [{ "w": 400, "ref": "<item>/<uuid>-400.webp" }]     (storage: path no bucket)
  -- Nada é presumido: o srcset do site sai daqui, então só entra o que foi
  -- mesmo gerado.
  variants    jsonb not null default '[]'::jsonb,

  -- Dimensões do original (orientação EXIF já aplicada) — evitam CLS.
  width       integer not null check (width > 0),
  height      integer not null check (height > 0),
  color       text not null default '#041c44',

  is_cover    boolean not null default false,
  sort_order  integer not null default 0,

  -- Alt escrito à mão, por idioma. Vazio = o site gera o alt contextual
  -- automático de sempre (src/lib/stock/generateAlt.ts).
  alt         jsonb not null default '{}'::jsonb,

  -- "01", "02"… no acervo legado; nome do arquivo enviado, no painel.
  file_name   text,

  created_at  timestamptz not null default now()
);

create index if not exists stock_images_item_idx on public.stock_images (item_id, sort_order asc);

-- No máximo uma capa por item, garantido pelo banco e não pela interface.
create unique index if not exists stock_images_single_cover_idx
  on public.stock_images (item_id) where is_cover;

-- ═══════════════════════ updated_at ═══════════════════════
create or replace function public.stock_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists stock_items_set_updated_at on public.stock_items;
create trigger stock_items_set_updated_at
  before update on public.stock_items
  for each row execute function public.stock_set_updated_at();

-- Mexer numa foto também envelhece o item: o painel ordena por "atualizados
-- recentemente" e trocar a capa é uma alteração como outra qualquer.
create or replace function public.stock_touch_item()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.stock_items
     set updated_at = now()
   where id = coalesce(new.item_id, old.item_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists stock_images_touch_item on public.stock_images;
create trigger stock_images_touch_item
  after insert or update or delete on public.stock_images
  for each row execute function public.stock_touch_item();

-- ═══════════════════════ histórico de alterações ═══════════════════════
create table if not exists public.stock_audit_log (
  id         bigint generated always as identity primary key,
  item_id    uuid references public.stock_items (id) on delete set null,
  item_slug  text,
  user_id    uuid references auth.users (id) on delete set null,
  action     text not null,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists stock_audit_item_idx on public.stock_audit_log (item_id, created_at desc);
create index if not exists stock_audit_date_idx on public.stock_audit_log (created_at desc);

/**
 * O histórico é gravado por trigger, não pela aplicação: assim nenhuma
 * alteração escapa do registro, nem a feita direto pelo SQL Editor.
 */
create or replace function public.stock_items_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  changed text[];
begin
  if tg_op = 'INSERT' then
    insert into public.stock_audit_log (item_id, item_slug, user_id, action, details)
    values (new.id, new.slug, auth.uid(), 'create',
            jsonb_build_object('status', new.status));
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.stock_audit_log (item_id, item_slug, user_id, action, details)
    values (null, old.slug, auth.uid(), 'delete',
            jsonb_build_object('status', old.status));
    return old;
  end if;

  -- UPDATE: guarda só o que mudou, para o histórico ficar legível.
  select array_agg(key)
    into changed
    from jsonb_each(to_jsonb(new))
   where to_jsonb(new) -> key is distinct from to_jsonb(old) -> key
     and key <> 'updated_at';

  if changed is null then
    return new;
  end if;

  insert into public.stock_audit_log (item_id, item_slug, user_id, action, details)
  values (new.id, new.slug, auth.uid(),
          case when new.status is distinct from old.status then 'status' else 'update' end,
          jsonb_build_object(
            'fields', to_jsonb(changed),
            'status_from', old.status,
            'status_to', new.status
          ));
  return new;
end;
$$;

drop trigger if exists stock_items_audit_trigger on public.stock_items;
create trigger stock_items_audit_trigger
  after insert or update or delete on public.stock_items
  for each row execute function public.stock_items_audit();

-- ═══════════════════════ privilégios ═══════════════════════
-- A RLS filtra LINHAS, mas só depois de a role ter privilégio na TABELA.
-- Sem estes grants o Postgres responde "permission denied" antes de olhar
-- qualquer policy — e o site veria erro em vez de catálogo. Os default
-- privileges do Supabase não cobrem tabelas criadas por migration, então a
-- concessão é explícita.
--
-- Note que isto NÃO afrouxa nada: quem pode escrever continua sendo decidido
-- pelas policies abaixo, que exigem `is_stock_admin()`.

grant usage on schema public to anon, authenticated, service_role;

-- Leitura pública do catálogo (a policy limita a status = 'published').
grant select on public.stock_items, public.stock_images to anon, authenticated;

-- Escrita: liberada no nível de tabela, barrada no nível de linha para quem
-- não é administrador.
grant insert, update, delete on public.stock_items, public.stock_images to authenticated;

grant select on public.admin_users     to authenticated;
grant select on public.stock_audit_log to authenticated;

-- A service role ignora a RLS e é usada só pelo script de importação.
grant all on public.stock_items, public.stock_images, public.admin_users,
             public.stock_audit_log to service_role;

-- `admin_login_attempts` fica SEM grant de propósito: ninguém a acessa pela
-- API, só as funções security definer de login.

-- ═══════════════════════ RLS ═══════════════════════
alter table public.stock_items     enable row level security;
alter table public.stock_images    enable row level security;
alter table public.stock_audit_log enable row level security;

-- ── leitura pública: SÓ o que está publicado ──
-- Rascunho, oculto, vendido e arquivado simplesmente não existem para quem
-- não é admin — nem via API, nem adivinhando o id.
drop policy if exists "stock_items_public_read" on public.stock_items;
create policy "stock_items_public_read"
  on public.stock_items for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "stock_items_admin_read" on public.stock_items;
create policy "stock_items_admin_read"
  on public.stock_items for select
  to authenticated
  using (public.is_stock_admin());

-- ── escrita: exclusivamente admin cadastrado ──
-- Um `authenticated` qualquer cai aqui e é recusado pelo Postgres, mesmo que
-- mande o id que quiser no corpo da requisição.
drop policy if exists "stock_items_admin_insert" on public.stock_items;
create policy "stock_items_admin_insert"
  on public.stock_items for insert
  to authenticated
  with check (public.is_stock_admin());

drop policy if exists "stock_items_admin_update" on public.stock_items;
create policy "stock_items_admin_update"
  on public.stock_items for update
  to authenticated
  using (public.is_stock_admin())
  with check (public.is_stock_admin());

drop policy if exists "stock_items_admin_delete" on public.stock_items;
create policy "stock_items_admin_delete"
  on public.stock_items for delete
  to authenticated
  using (public.is_stock_admin());

-- ── fotos: visibilidade herdada do item ──
drop policy if exists "stock_images_public_read" on public.stock_images;
create policy "stock_images_public_read"
  on public.stock_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.stock_items item
       where item.id = stock_images.item_id
         and item.status = 'published'
    )
  );

drop policy if exists "stock_images_admin_read" on public.stock_images;
create policy "stock_images_admin_read"
  on public.stock_images for select
  to authenticated
  using (public.is_stock_admin());

drop policy if exists "stock_images_admin_insert" on public.stock_images;
create policy "stock_images_admin_insert"
  on public.stock_images for insert
  to authenticated
  with check (public.is_stock_admin());

drop policy if exists "stock_images_admin_update" on public.stock_images;
create policy "stock_images_admin_update"
  on public.stock_images for update
  to authenticated
  using (public.is_stock_admin())
  with check (public.is_stock_admin());

drop policy if exists "stock_images_admin_delete" on public.stock_images;
create policy "stock_images_admin_delete"
  on public.stock_images for delete
  to authenticated
  using (public.is_stock_admin());

-- ── histórico: admin lê, ninguém escreve pela API ──
-- Quem grava é a trigger (security definer), não o cliente.
drop policy if exists "stock_audit_admin_read" on public.stock_audit_log;
create policy "stock_audit_admin_read"
  on public.stock_audit_log for select
  to authenticated
  using (public.is_stock_admin());
