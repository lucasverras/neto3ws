#!/usr/bin/env bash
# Liga o painel em produção: migrations, admin, importação, Vercel e deploy.
#
#   ./scripts/setup-producao.sh <project-ref>
#
# Pré-requisito único: estar autenticado na CLI do Supabase.
#   supabase login          (abre o navegador, uma vez só)
#
# O <project-ref> é o identificador do projeto no Supabase
# (Dashboard → Project Settings → General → Reference ID).
# Para listar: supabase projects list
#
# Idempotente: pode rodar de novo sem duplicar nada.

set -euo pipefail

REF="${1:-}"
if [ -z "$REF" ]; then
  echo "uso: $0 <project-ref>   (veja com: supabase projects list)" >&2
  exit 1
fi

ADMIN_EMAIL="neto@3wsmoldes.com.br"

say() { printf "\n\033[1m── %s ──\033[0m\n" "$1"; }

say "1/6  Vinculando ao projeto $REF"
supabase link --project-ref "$REF"

say "2/6  Aplicando as migrations"
# Sobe 0001 (tabelas, grants, RLS), 0002 (bucket), 0003 (admin), 0004 (freio).
supabase db push

say "3/6  Conferindo o administrador"
# 0003 só promove quem já existe no Auth. Se nada foi cadastrado, o usuário
# ainda precisa ser criado no painel (Authentication → Users → Add user,
# com "Auto Confirm User" marcado).
if ! supabase db query "select 1 from public.admin_users limit 1" 2>/dev/null | grep -q 1; then
  cat >&2 <<AVISO

  ⚠  Nenhum administrador cadastrado.

     Crie o usuário $ADMIN_EMAIL no painel do Supabase
     (Authentication → Users → Add user → marque "Auto Confirm User")
     e rode este script de novo. A senha é definida lá, nunca aqui.

AVISO
  exit 1
fi

say "4/6  Importando o acervo (simulação primeiro)"
node scripts/migrate-stock-to-supabase.mjs
echo
read -r -p "Importar de verdade? [s/N] " ok
[ "$ok" = "s" ] || { echo "abortado — nada foi gravado"; exit 0; }
node scripts/migrate-stock-to-supabase.mjs --apply

say "5/6  Configurando as variáveis na Vercel"
echo "Cole cada valor quando pedido (Supabase → Project Settings → API):"
for VAR in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  vercel env add "$VAR" production || echo "  ($VAR já existe — use 'vercel env rm' para trocar)"
done

say "6/6  Publicando"
# Variável nova não entra num deploy que já existe: precisa de um novo.
vercel --prod

cat <<FIM

✓ Pronto.

  Painel:   https://www.3wsmoldes.com.br/admin
  Catálogo: https://www.3wsmoldes.com.br/pt/estoque

  Confira a integridade quando quiser:
    node scripts/migrate-stock-to-supabase.mjs --verify

FIM
