# Auditoria SEO + Melhoria Visual — 3WS Moldes e Equipamentos

Data: 2026-09-14 · Branch: `banner-background-video`

Este documento resume a auditoria e as alterações feitas nesta rodada. **Contexto importante:** o site já era tecnicamente forte (Next.js 16, App Router, i18n pt/en/es, sitemap com hreflang e image sitemap, `robots.txt`, catálogo com Product/ItemList honestos, pipeline de imagem em WebP com dimensões e alt contextual). O trabalho foi **fechar lacunas e reforçar SEO local + fazer o redesign da seção de serviços** — não uma reconstrução.

Regra seguida em tudo: **nada de dado inventado**. Preço, oferta, estoque falso, avaliações e endereços fictícios ficaram de fora. Todos os dados reais vêm de `src/lib/site.ts` e `src/lib/companyLinks.ts`.

---

## 1. Problemas encontrados

| # | Problema | Severidade |
|---|----------|------------|
| 1 | Sem `LocalBusiness`/geo JSON-LD, apesar de haver endereço e telefone reais — maior lacuna para o objetivo de SEO local | Alta |
| 2 | Home, Quem-somos, Serviços e Contato sem `og:image` e sem Twitter Card (só as páginas de estoque tinham) | Média |
| 3 | Não existia imagem Open Graph padrão | Média |
| 4 | Rodapé com links quebrados: Instagram e "LinkedIn" apontando para `#`, e "Política de Privacidade" `#` (sem página) | Média |
| 5 | Perfis sociais reais (Instagram, Facebook, TikTok) existiam em `companyLinks.ts` mas não eram usados no rodapé nem em `sameAs` | Média |
| 6 | Os 5 links de "Serviços" do rodapé apontavam todos para a mesma âncora `#servicos` | Baixa |
| 7 | Seção "Categorias" da home era só visual, sem nenhum link de saída | Média |
| 8 | Diferencial comercial "venda por kg" não tinha página dedicada | Alta |
| 9 | Só 1 das 11 páginas comerciais pedidas existia (`/estoque`); o restante eram filtros `?categoria=` | Alta |
| 10 | Seção de serviços da home era uma lista com scroll-pin (visualmente "morta"), não a vitrine premium pedida | Média |
| 11 | Sufixo de marca inconsistente nos titles (`| 3WS`, `| 3WS Moldes`, `| 3WS Moldes e Equipamentos`) | Baixa |
| 12 | `dict.meta.home.keywords` definido mas nunca usado (dado morto) | Baixa |

Nenhuma página com `noindex` foi encontrada (ver item 9 abaixo).

## 2. Alterações realizadas

- **Schema `LocalBusiness`** com endereço, `areaServed` (São Paulo / Zona Leste / Brasil), `telephone`, `sameAs` e `parentOrganization`, emitido na Home, Quem-somos, Contato e nas landings comerciais. (`src/lib/stock/generateMetadata.ts` → `localBusinessJsonLd()`)
- **`sameAs`** com Instagram, Facebook e TikTok reais adicionado à `Organization` e ao `LocalBusiness`.
- **Imagem Open Graph padrão** 1200×630 gerada da foto real do galpão + logo + chamada (`scripts/build-og.mjs` → `public/images/og-default.jpg`), aplicada em Home, Quem-somos, Serviços, Contato e landings, com **Twitter Card `summary_large_image`** em todas.
- **Helper `institutionalMetadata()`** centraliza canonical + hreflang + OG + Twitter das páginas institucionais (consistência e menos repetição).
- **Rodapé corrigido:** Instagram/Facebook/TikTok reais (abre em nova aba), remoção dos links mortos (LinkedIn e Privacidade), e os links de serviço passam a apontar para as páginas reais.
- **Redesign da seção de Serviços** para um **bento grid de fotos reais** (`src/components/sections/Services.tsx`) com 6 cards, card "Moldes por kg" em destaque (selo + borda teal), hover em transform CSS e entrada com Framer Motion — sem scroll-jacking nem canvas.
- **Seção "Categorias" da home** ganhou links reais (porta-moldes → landing, bases → filtro do estoque, demais → catálogo).
- **6 novas páginas** (ver item 6).
- **Contexto geográfico natural** em Home (hero), Estoque (acervo) e nova FAQ local — sem keyword stuffing.
- **`/llms.txt`** criado para leitura por IAs (entidade, localização, páginas-chave), fora do redirecionamento de idioma.
- Sitemap atualizado com as novas páginas (com hreflang).

## 3. Titles implementados

Todos únicos, com o mesmo padrão de sufixo `| 3WS Moldes` nas novas páginas.

| Página | Title |
|--------|-------|
| Home | 3WS Moldes \| Compra e Venda de Moldes e Porta-Moldes |
| Estoque | Estoque de Moldes de Injeção Plástica \| 3WS Moldes |
| Serviços | Serviços para Moldes e Equipamentos \| 3WS |
| Quem somos | Quem Somos \| 3WS Moldes e Equipamentos |
| Contato | Contato \| 3WS Moldes e Equipamentos |
| **Moldes por kg** | Moldes Usados por Kg e por Quilo \| 3WS Moldes |
| **Compramos moldes** | Compramos Moldes Industriais Usados \| 3WS Moldes |
| **Venda seu molde** | Venda Seu Molde Industrial Usado \| 3WS Moldes |
| **Porta-moldes usados** | Porta-Moldes Usados e Bases Industriais \| 3WS Moldes |
| **Moldes automotivos** | Moldes Automotivos Usados \| 3WS Moldes |
| **Utilidades domésticas** | Moldes de Utilidades Domésticas Usados \| 3WS Moldes |
| Molde individual | {nome do molde} \| 3WS Moldes (dinâmico) |

> Obs.: os titles das páginas institucionais pré-existentes foram mantidos (já eram bons e únicos); a padronização de sufixo foi aplicada às novas páginas para não alterar URLs/titles já indexados sem necessidade.

## 4. Descriptions implementadas

Descrições exclusivas, comerciais e humanas (~140–160 caracteres) em todas as páginas. Exemplos das novas:

- **Moldes por kg:** "Compra e venda de moldes industriais por kg em São Paulo. Entenda como funciona a negociação de moldes, porta-moldes e ferramentais por peso e consulte o estoque da 3WS."
- **Compramos moldes:** "A 3WS compra moldes de injeção, porta-moldes, bases para estampos e lotes industriais usados em todo o Brasil. Avaliação técnica e negociação por peso."
- **Porta-moldes usados:** "Porta-moldes e bases industriais usados para injeção plástica, disponíveis no estoque da 3WS em São Paulo. Estruturas avaliadas para compra, venda ou reaproveitamento."

## 5. Schemas implementados (JSON-LD)

| Tipo | Onde |
|------|------|
| Organization (`#organization`) + `sameAs` | Todas as páginas institucionais |
| **LocalBusiness (`#localbusiness`)** — novo | Home, Quem-somos, Contato, landings |
| WebSite (`#website`) | Home |
| BreadcrumbList | Todas as páginas internas |
| FAQPage | Home + todas as 6 landings (FAQ visível) |
| Service | Landings comerciais (por kg, compramos, venda) |
| CollectionPage + ItemList | Estoque e landings de categoria (itens reais) |
| Product (sem oferta/preço) + ImageObject | Páginas de molde individual |
| AboutPage / ContactPage / WebPage+Service | Quem-somos / Contato / Serviços |

Sem duplicação de `@id`; nenhum dado comercial inventado (sem `offers`, `price`, `aggregateRating`, `itemCondition`).

## 6. Novas páginas

Rota dinâmica única `src/app/[locale]/[landing]/page.tsx` (estática, 3 idiomas), conteúdo em `src/lib/landing/content.ts`, template em `src/components/landing/LandingPage.tsx`:

1. `/moldes-por-quilo/` — carro-chefe (como funciona, tipos, para quem, reaproveitamento, galeria, FAQ)
2. `/compramos-moldes/`
3. `/venda-seu-molde/`
4. `/porta-moldes-usados/` — categoria, com grade de itens reais do acervo
5. `/moldes-automotivos/` — idem
6. `/moldes-utilidades-domesticas/` — idem

As páginas de categoria listam **itens reais do catálogo** e apontam para o filtro correspondente — conteúdo único, o oposto de doorway page. Não foram criadas páginas pobres só por keyword.

## 7. Redirects

- Nenhuma URL existente foi alterada ou removida → **nenhum 301 necessário**.
- O redirecionamento de idioma já existente (`src/proxy.ts`) foi preservado; apenas `llms.txt` foi adicionado à lista de exceções do matcher para ser servido na raiz.
- Legado sem prefixo de idioma continua resolvendo (308 permanente para robôs), como antes.

## 8. Melhorias de Core Web Vitals

- Imagem OG estática e leve (73 KB) em vez de geração em runtime.
- Bento de serviços usa hover por `transform` (GPU) e entrada com Framer Motion `whileInView` (uma vez) — sem scroll-jacking, canvas ou Three.js; a versão pesada com scroll-pin foi removida.
- `sizes` e `priority` corretos nas imagens do bento e das landings (só o herói é `priority`).
- Pipeline de imagem do estoque mantido (WebP em 4 larguras, `width`/`height` fixos → CLS ~0, lazy abaixo da dobra, placeholder por cor dominante).
- Catálogo mantém paginação (24/página) e HTML estático completo para rastreio.

## 9. Páginas noindex encontradas

Nenhuma. Não há `<meta name="robots" content="noindex">`, `X-Robots-Tag` nem bloqueio de framework em páginas estratégicas. `robots.txt` libera tudo e aponta o sitemap. As novas páginas são todas indexáveis.

## 10. Páginas canonicalizadas

Todas as páginas têm canonical self-referencing por idioma (via `institutionalMetadata` / `buildItemMetadata`), com `alternates.languages` (pt-BR, en, es) e `x-default → pt`. As novas landings entram no mesmo padrão. Nenhum canonical aponta para a Home indevidamente.

## 11. Links quebrados corrigidos

- Rodapé: Instagram e "LinkedIn" (`href="#"`) → Instagram, Facebook e TikTok reais.
- Rodapé: "Política de Privacidade" (`href="#"`, sem página) → removido.
- Rodapé: 5 links de serviço apontando para `#servicos` → páginas reais (`/compramos-moldes`, `/venda-seu-molde`, `/moldes-por-quilo`, `/servicos`).
- Home "Categorias": tiles sem link → links para landings/filtros/catálogo.

## 12. Melhorias de imagem

- Nova imagem OG 1200×630 (foto real do galpão) com `og:image:width/height/alt`.
- Alts contextuais e localizados nas fotos das novas páginas e do bento (sem keyword stuffing).
- Pipeline de estoque (já existente) preservado e reutilizado nas grades de categoria.

## 13. Melhorias de SEO local

- `LocalBusiness` com endereço real, `areaServed` (São Paulo, Zona Leste, Brasil) e `sameAs`.
- Contexto geográfico natural: hero da Home ("depósito na Zona Leste de São Paulo"), seção do acervo do Estoque ("depósito em São Paulo") e nova FAQ "Onde fica a 3WS e é possível visitar o estoque?" (menciona Avenida Aricanduva / Zona Leste).
- Rodapé com endereço consistente (já existia) + agora perfis sociais oficiais.
- `/llms.txt` reforça a entidade e a localização para mecanismos de IA.

## 14. Próximos passos

- **Google Business Profile:** criar/ativar o perfil e, quando houver a URL oficial, adicioná-la em `sameAs` e como `hasMap`/`sameAs` no `LocalBusiness`. (Não inventar link.)
- **Geo coordinates + openingHours:** se confirmados, incluir `geo` e `openingHours` no `LocalBusiness`.
- **Landing de bases para estampos:** avaliar `/bases-para-estampos` como página real (hoje é filtro), se houver conteúdo/estoque distinto suficiente.
- **Conteúdo técnico (blog):** estrutura preparada; escrever poucos artigos fortes (ver lista no item 30 do briefing) apontando para as landings comerciais.
- **`keywords` meta:** dado morto em `dict.meta.home.keywords`; pode ser removido (a meta keywords não influencia ranking).
- **Página de Política de Privacidade:** criar de fato e recolocar o link no rodapé.
- **Verification GSC:** adicionar a tag de verificação real quando disponível (não foi adicionada nenhuma falsa).

## 15. Estratégia de backlinks

Ver **`BACKLINK-PLAN.md`**. Resumo: nenhum backlink foi/deve ser inventado; foi criada a infraestrutura (URLs permanentes, páginas de categoria, Open Graph, conteúdo compartilhável) e um plano de oportunidades reais (fornecedores, associações, diretórios industriais sérios, clientes).

---

## URLs para solicitar reindexação no Google Search Console

Novas (Solicitar indexação):

- https://www.3wsmoldes.com.br/pt/moldes-por-quilo
- https://www.3wsmoldes.com.br/pt/compramos-moldes
- https://www.3wsmoldes.com.br/pt/venda-seu-molde
- https://www.3wsmoldes.com.br/pt/porta-moldes-usados
- https://www.3wsmoldes.com.br/pt/moldes-automotivos
- https://www.3wsmoldes.com.br/pt/moldes-utilidades-domesticas

Atualizadas (reprocessar — schema/OG novos):

- https://www.3wsmoldes.com.br/pt (Home)
- https://www.3wsmoldes.com.br/pt/quem-somos
- https://www.3wsmoldes.com.br/pt/contato
- https://www.3wsmoldes.com.br/pt/servicos
- https://www.3wsmoldes.com.br/pt/estoque

E reenviar o sitemap: https://www.3wsmoldes.com.br/sitemap.xml
