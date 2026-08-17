# Catálogo do estoque (`/estoque`)

## Como adicionar um molde novo

Crie a pasta dentro do acervo e faça o build. Não há código a editar.

```
3ws-images/imagens/moldes-injecao-plastica/balde-20-litros-2-cavidades/
  01.jpg
  02.jpg
  03.jpg
```

```bash
npm run build      # o prebuild gera derivativos + manifest
```

O molde passa a existir em:

- `/pt/estoque`, `/en/estoque`, `/es/estoque` (card no grid, na categoria e na busca)
- `/{pt,en,es}/estoque/balde-20-litros-2-cavidades` (3 páginas estáticas, com hreflang)
- `sitemap.xml`, com todas as fotos no image sitemap
- breadcrumb, JSON-LD e links internos

O que é deduzido do nome da pasta, sem nenhuma intervenção:

| Campo | Origem | Exemplo |
| --- | --- | --- |
| Título | slug normalizado | `Molde para Balde 20 Litros – 2 Cavidades` |
| Cavidades | `-N-cavidades` | `2` |
| Volume | token `250ml`, `2l` | `250 ml` |
| Peso da peça | token `40g` | `40 g` |
| Categoria | regra de `taxonomy.ts` (`/balde/`) | `Vasos, Baldes e Cestos` |
| Alt das fotos | `generateAlt.ts` | contextual, um por foto |

Para uma **categoria nova**, acrescente uma regra em `taxonomy.ts`, o rótulo em
`CATEGORY_ORDER` e o nome nos três dicionários (`stock.categories`). Sem regra,
o item cai em `diversos` — nunca quebra.

## Idiomas

Sem `name`/`title` traduzidos, o nome derivado do slug (em português) é
reaproveitado nos três idiomas. É proposital: mostrar o nome original é melhor
do que arriscar uma tradução automática errada. Os textos de interface vivem em
`src/lib/i18n/dictionaries/` e o typecheck falha se `en.ts` ou `es.ts`
esquecerem uma chave.

## Curadoria opcional — `curation.json`

Tudo neste arquivo é opcional; serve para refinar o que o slug não consegue
expressar. Por slug:

| Campo | Uso |
| --- | --- |
| `name` | `{ pt, en, es }` — nome da peça, encaixado em "Molde para {name}" |
| `title` | `{ pt, en, es }` — título completo, quando o modelo não serve |
| `subject` | `{ pt, en, es }` — trecho minúsculo usado nos alts (`copo de 250 ml`) |
| `kind` | `"collection"` para pastas que são galerias, não um molde único |
| `category` | força a categoria |
| `result` | **nomes de arquivo que mostram a peça produzida** (ver abaixo) |
| `cover` | escolhe outra foto de capa |
| `summary` | parágrafo extra na página do molde |

No topo do arquivo, `exclude` remove um arquivo do catálogo sem apagá-lo do
acervo, e `institutional` marca a pasta usada como prova visual do estoque
(fora do grid e sem URL própria).

## Molde × peça produzida

Os arquivos do acervo se chamam `01.jpg`, `02.jpg`… — **não há nenhum sinal no
nome, na extensão ou em subpasta** que diga se a foto é do molde ou da peça
injetada. Por isso a separação não é adivinhada em runtime: ela vem de
`curation.json`, preenchida por inspeção visual foto a foto.

```json
"copo-250ml-2-cavidades": { "result": ["05"] }
```

Uma pasta sem entrada `result` fica com **galeria única do molde** — que é o
padrão seguro. Melhor mostrar tudo como "molde" do que rotular errado.

O tipo já existe no modelo (`StockImage.type: "mold" | "result"`), então
classificar uma pasta nova é só listar os arquivos em `result`.

## O que nunca é inventado

Material, dimensões, peso do molde, aço, fabricante, máquina, tonelagem, ciclo,
condição e preço **não aparecem** — o acervo não tem esses dados. Pelo mesmo
motivo o JSON-LD emite `Product` sem `offers`, `sku`, `brand`, `gtin`,
`itemCondition` nem `aggregateRating`.

## Pipeline de imagens

`scripts/build-stock.mjs` lê o acervo e escreve `public/acervo/<slug>/NN-<w>.webp`
nas larguras 400 / 600 / 800 / 1400 (nunca amplia o original).

- os originais em `3ws-images/imagens/` **nunca são tocados**;
- `public/acervo/` é 100% gerado e está no `.gitignore` — o `prebuild` recria
  no deploy, e derivativos órfãos são removidos automaticamente;
- é incremental: derivativo mais novo que o original é pulado;
- **`3ws-images/` precisa estar versionado**, senão o build não tem fonte.

```bash
npm run stock:build          # regenera (incremental)
node scripts/build-stock.mjs --force
npm run stock:audit          # relatório do acervo, somente leitura
```
