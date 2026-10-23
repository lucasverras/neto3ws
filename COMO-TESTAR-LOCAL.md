# Ambiente local do painel — como usar

Tudo já está no ar. Este arquivo é só para você conseguir voltar depois.

## Acessar agora

| O quê | Onde |
|---|---|
| **Painel** | <http://localhost:3100/admin> |
| Catálogo público | <http://localhost:3100/pt/estoque> |
| Supabase Studio (banco) | <http://127.0.0.1:56323> |
| E-mails de teste (recuperar senha) | <http://127.0.0.1:56324> |

**Login:** `neto@3wsmoldes.com.br`

**Senha:** não fica escrita aqui. Para ver:

```bash
grep ADMIN_PASSWORD supabase/.local-credentials
```

> Essa senha vale só neste ambiente local. A senha de produção é definida no
> painel do Supabase e não passa pelo repositório.

## O que dá para testar

- Adicionar produto, arrastar fotos do molde e da peça produzida
- Trocar a capa (★), mover foto entre as seções (⇄), reordenar arrastando
- Publicar, ocultar, marcar como vendido, reativar, arquivar, duplicar
- "Reordenar catálogo" e arrastar — a ordem vai para o site
- Pré-visualizar um rascunho antes de publicar

Depois de salvar, abra <http://localhost:3100/pt/estoque> e a mudança já está lá.

## Se precisar reiniciar

```bash
# o site (porta 3100)
lsof -ti:3100 | xargs kill -9
nohup env PORT=3100 npm start > /tmp/3ws-prod.log 2>&1 &

# o banco (se tiver reiniciado o Mac)
colima start && supabase start
```

> `colima` é o Docker desta máquina. Os projetos `financeiro` e `sao-tome`
> sobem junto e usam outras portas — este projeto é o `3ws-chicago`, na faixa
> 563xx. Não precisa parar nenhum deles.

## Voltar ao estado limpo

```bash
supabase db reset                                   # recria o banco vazio
# recrie o usuário (ver docs/supabase-setup.md, passos 3 e 4)
node scripts/migrate-stock-to-supabase.mjs --apply  # reimporta os 43 itens
```

## Conferir a integridade a qualquer momento

```bash
node scripts/migrate-stock-to-supabase.mjs --verify
```

Esperado: 43 entradas, 438 fotos, 89 de peça produzida, conferência item a item OK.

## Derrubar tudo

```bash
lsof -ti:3100 | xargs kill -9   # o site
supabase stop                   # só este projeto
```
