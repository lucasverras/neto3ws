-- Freio de força bruta no login do painel.
-- Rode depois do 0001. Idempotente.
--
-- Por que no banco e não em memória: a aplicação roda serverless, com várias
-- instâncias efêmeras. Um contador em processo seria zerado a cada cold start
-- e não valeria entre instâncias — ou seja, não seria freio nenhum.

create table if not exists public.admin_login_attempts (
  id         bigint generated always as identity primary key,
  -- Hash de e-mail + IP. Nunca o e-mail em claro: esta tabela não precisa
  -- saber quem tentou entrar, só quantas vezes a mesma origem tentou.
  identifier text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_idx
  on public.admin_login_attempts (identifier, created_at desc);

-- Sem nenhuma policy: a tabela é inacessível pela API REST. Só as funções
-- `security definer` abaixo conseguem tocá-la.
alter table public.admin_login_attempts enable row level security;

/**
 * Registra uma tentativa e devolve quantas houve na janela recente.
 *
 * A limpeza acontece na própria chamada, o que impede a tabela de crescer
 * mesmo que alguém invoque a função em massa.
 */
create or replace function public.register_login_attempt(p_identifier text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  recent integer;
begin
  delete from public.admin_login_attempts
   where created_at < now() - interval '1 hour';

  insert into public.admin_login_attempts (identifier) values (p_identifier);

  select count(*) into recent
    from public.admin_login_attempts
   where identifier = p_identifier
     and created_at > now() - interval '15 minutes';

  return recent;
end;
$$;

/** Login bem-sucedido zera o contador daquela origem. */
create or replace function public.clear_login_attempts(p_identifier text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.admin_login_attempts where identifier = p_identifier;
$$;

revoke all on function public.register_login_attempt(text) from public;
revoke all on function public.clear_login_attempts(text) from public;
grant execute on function public.register_login_attempt(text) to anon, authenticated;
grant execute on function public.clear_login_attempts(text) to anon, authenticated;
