-- Promove o usuário do dono a administrador do estoque.
--
-- Pré-requisito: o usuário já existe no Supabase Auth
-- (Authentication → Users → Add user, com "Auto Confirm User" marcado).
--
-- NÃO existe senha neste arquivo, por design. A senha é definida no painel do
-- Supabase e nunca passa pelo repositório, por logs ou por migration.
--
-- Rode depois do 0001. Idempotente: rodar de novo não duplica nem rebaixa.

insert into public.admin_users (user_id, email, role)
select id, email, 'owner'
  from auth.users
 where lower(email) = lower('neto@3wsmoldes.com.br')
on conflict (user_id) do update
  set email = excluded.email,
      role  = 'owner';

-- Confere o resultado: zero linhas significa que o usuário ainda não foi
-- criado no Auth — crie-o e rode este arquivo de novo.
do $$
declare
  total integer;
begin
  select count(*) into total from public.admin_users;
  if total = 0 then
    raise warning
      'Nenhum admin cadastrado. Crie o usuário em Authentication -> Users e rode este script novamente.';
  else
    raise notice 'admin_users: % administrador(es) cadastrado(s).', total;
  end if;
end;
$$;
