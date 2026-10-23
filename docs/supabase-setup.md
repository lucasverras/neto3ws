# Ligar o painel do estoque (Supabase + Vercel)

Passo a passo para sair do catálogo em arquivo e passar a editar o estoque
pelo navegador, em `/admin`.

> **O site não quebra no meio do caminho.** Enquanto as variáveis do Supabase
> não existirem, tudo continua exatamente como hoje: o catálogo é servido do
> acervo em arquivo (`public/acervo` + `catalog.generated.json`) e o `/admin`
> fica fechado. A troca de fonte acontece quando — e só quando — as
> credenciais entrarem no ambiente.

---

## 1. Criar o projeto no Supabase

1. <https://supabase.com> → **New project**.
2. Região: **South America (São Paulo)** — mais perto dos visitantes.
3. Guarde a senha do banco. Ela **não** é a senha de login do painel.

## 2. Rodar as migrations

Painel do Supabase → **SQL Editor** → **New query**. Cole e rode **na ordem**:

| # | Arquivo | O que cria |
|---|---|---|
| 1 | `supabase/migrations/0001_stock.sql` | tabelas `stock_items`, `stock_images`, `admin_users`, `stock_audit_log`, triggers, histórico e RLS |
| 2 | `supabase/migrations/0002_storage.sql` | bucket `estoque` (público para leitura) e policies |
| 3 | `supabase/migrations/0004_login_throttle.sql` | freio de força bruta no login |

Os três são **idempotentes**: pode rodar de novo sem quebrar nada.

O `0003_admin_seed.sql` fica para o passo 4, depois que o usuário existir.

### O que as policies garantem

| Quem | `stock_items` / `stock_images` | bucket `estoque` |
|---|---|---|
| Visitante anônimo | lê **só** `status = 'published'` | **vê** as fotos |
| Autenticado **sem** linha em `admin_users` | lê só o publicado — **não escreve nada** | vê; não escreve |
| Administrador | lê tudo, insere, edita, apaga | sobe, troca e apaga fotos |

Não existe policy aberta. Autorização é **estar em `admin_users`**, não "ter
sessão" — é por isso que um usuário criado por engano no Auth não encosta no
estoque, mesmo mandando requisição à mão com o id que quiser.

## 3. Criar o usuário do Neto

O cadastro público é desabilitado — não existe tela de "criar conta".

**Authentication → Users → Add user → Create new user**

- E-mail: `neto@3wsmoldes.com.br`
- Senha: defina aqui, no painel do Supabase.
- Marque **Auto Confirm User** (sem isso o login falha esperando confirmação).

> A senha não aparece neste repositório, nem em migration, log ou documentação —
> e não deve passar por e-mail ou mensagem. Se for preciso trocá-la depois, o
> próprio painel tem "Esqueci minha senha" em `/admin/recuperar`.

## 4. Promover o usuário a administrador

SQL Editor → cole `supabase/migrations/0003_admin_seed.sql` → **Run**.

Ele procura `neto@3wsmoldes.com.br` em `auth.users` e cria a linha em
`admin_users`. Se avisar que nenhum admin foi cadastrado, o usuário do passo 3
ainda não existe — crie e rode de novo.

Para conferir:

```sql
select u.email, a.role
  from public.admin_users a
  join auth.users u on u.id = a.user_id;
```

## 5. Configurar o e-mail de recuperação

**Authentication → URL Configuration**

- **Site URL**: `https://www.3wsmoldes.com.br`
- **Redirect URLs**: inclua `https://www.3wsmoldes.com.br/admin/nova-senha`

Sem isso o link de "esqueci minha senha" chega, mas não volta para o painel.

## 6. Pegar as chaves

**Project Settings → API**:

| Valor no painel | Variável |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> A `service_role` **ignora a RLS**. Ela é usada só pelo script de importação,
> rodando na sua máquina. Nunca coloque `NEXT_PUBLIC_` na frente dela e nunca
> a configure como variável do navegador.

## 7. Variáveis de ambiente

### Local

```bash
cp .env.example .env.local
# preencha os três valores do passo 6
```

### Vercel

**Project → Settings → Environment Variables** (marque Production, Preview e
Development):

| Variável | Pública? |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | pública |
| `NEXT_PUBLIC_SUPABASE_URL` | pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pública |
| `SUPABASE_SERVICE_ROLE_KEY` | **secreta** |

Depois de adicionar, **faça um redeploy** — variável nova não entra num deploy
que já existe.

## 8. Importar o acervo atual

Com `.env.local` preenchido, na raiz do projeto:

```bash
# 1. Simulação: mostra os números e o que seria feito. NÃO grava nada.
npm run stock:migrate

# 2. Importa de verdade.
node scripts/migrate-stock-to-supabase.mjs --apply

# 3. Confere item a item e foto a foto, a qualquer momento depois.
npm run stock:migrate:verify
```

O relatório esperado na origem:

```
  entradas .................. 43
  itens públicos ............ 42
  galeria institucional ..... 1
  fotos (todas) ............. 438
  fotos públicas ............ 430
  fotos de peça produzida ... 89
  itens com peça produzida .. 31
```

O script é **idempotente** (casa pelo `slug`) e **não destrutivo**:

- rodar duas vezes atualiza, não duplica;
- produtos criados no painel não são tocados;
- **status e ordem nunca são sobrescritos** — se o Neto despublicou ou
  reordenou algo, a decisão dele vale;
- nenhuma foto é copiada: os WebP do acervo continuam sendo servidos de
  `/acervo/...`, gerados pelo build. O banco só aponta para eles.

### Validar antes de confiar

```bash
npm test
```

O teste `migração preserva cada item` converte as linhas que o importador
gravaria de volta em itens renderizados e compara, campo a campo e nos três
idiomas, com o que o acervo em arquivo produz hoje: título, alt, capa,
classificação molde/peça, URLs e srcset. Se a migração mudar qualquer coisa,
ele falha.

## 9. Entrar

<https://www.3wsmoldes.com.br/admin> → e-mail e senha do passo 3.

---

## Como o site lê o estoque depois disso

```text
          NEXT_PUBLIC_SUPABASE_URL definido?
                    │
        ┌───────────┴────────────┐
       sim                      não
        │                        │
   Supabase                acervo em arquivo
   (status =                (comportamento
    'published')              de sempre)
        │                        │
        └───────────┬────────────┘
                    ▼
        /pt /en /es  ·  /estoque  ·  /estoque/{slug}
        landings de categoria  ·  sitemap.xml
```

**Uma fonte por vez, nunca duas.** Com o Supabase ligado, o acervo em arquivo
deixa de alimentar o site — um produto apagado no painel não ressuscita a
partir dos arquivos locais.

As fotos antigas e as novas convivem: cada foto guarda as larguras que
realmente existem, então o `srcset` nunca aponta para um arquivo inexistente,
venha ele de `/acervo/` ou do Storage.

## Cache e publicação

Salvar no painel dispara `revalidatePath` para o catálogo, as páginas de molde,
as landings de categoria e o `sitemap.xml`, **nos três idiomas de uma vez**. A
alteração aparece no site em seguida, sem rebuild e sem commit.

Há ainda uma revalidação de hora em hora como rede de segurança, para o caso de
alguém mexer direto no banco.

## Se algo der errado

| Sintoma | Causa provável |
|---|---|
| `/admin` redireciona para `/admin/login?erro=config` | faltam as variáveis do Supabase no ambiente |
| Login diz "E-mail ou senha incorretos" com a senha certa | o usuário existe no Auth mas **não** está em `admin_users` (passo 4) |
| "Muitas tentativas seguidas" | freio de login; espere alguns minutos |
| `/estoque` mostra "Não foi possível carregar o estoque" | erro real de banco — **não** é estoque vazio; veja o erro no painel do Supabase |
| Painel mostra "Não foi possível carregar o estoque" com mensagem técnica | migrations não rodaram, ou a RLS recusou a leitura |

Erro de banco **nunca** é apresentado como "estoque vazio", no site nem no
painel: as duas telas distinguem explicitamente "não há nada cadastrado" de
"deu ruim aqui".
