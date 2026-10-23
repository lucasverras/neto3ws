-- Bucket das fotos do estoque da 3WS + políticas de acesso.
-- Rode depois do 0001. Idempotente.

-- ───────────────────────── bucket ─────────────────────────
-- público = qualquer pessoa VÊ a foto pela URL (o site precisa disso, e o
-- Google Imagens também). Subir, trocar e apagar continua restrito ao admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'estoque',
  'estoque',
  true,
  15728640, -- 15 MB por arquivo, conferido também no servidor
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ───────────────────────── políticas ─────────────────────────
drop policy if exists "stock_photos_public_read" on storage.objects;
create policy "stock_photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'estoque');

-- Escrita: só quem está na tabela admin_users. Sessão autenticada sozinha
-- não basta — é a mesma regra das tabelas do catálogo.
drop policy if exists "stock_photos_admin_insert" on storage.objects;
create policy "stock_photos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'estoque' and public.is_stock_admin());

drop policy if exists "stock_photos_admin_update" on storage.objects;
create policy "stock_photos_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'estoque' and public.is_stock_admin())
  with check (bucket_id = 'estoque' and public.is_stock_admin());

drop policy if exists "stock_photos_admin_delete" on storage.objects;
create policy "stock_photos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'estoque' and public.is_stock_admin());
