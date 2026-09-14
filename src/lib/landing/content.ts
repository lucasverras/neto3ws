/**
 * Conteúdo das landing pages comerciais e de categoria.
 *
 * Fica fora do `Dictionary` principal de propósito: são blocos longos e
 * específicos de página, e mantê-los aqui deixa o dicionário do site enxuto. A
 * paridade entre idiomas é garantida pelo tipo `Record<Locale, LandingContent>`
 * — falta um idioma, não compila. Nada de dado inventado: preços, ofertas e
 * disponibilidade comercial nunca aparecem aqui.
 */

import type { Locale } from "@/lib/i18n";
import type { CategoryKey } from "@/lib/stock/taxonomy";

export const LANDING_SLUGS = [
  "moldes-por-quilo",
  "compramos-moldes",
  "venda-seu-molde",
  "porta-moldes-usados",
  "moldes-automotivos",
  "moldes-utilidades-domesticas",
] as const;

export type LandingSlug = (typeof LANDING_SLUGS)[number];

export interface LandingSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingImage {
  src: string;
  alt: string;
}

export interface LandingContent {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  /** Mensagem pronta do WhatsApp para o CTA principal. */
  ctaMessage: string;
  /** Rótulo do CTA principal. */
  cta: string;
  heroImage: LandingImage;
  sections: LandingSection[];
  gallery?: LandingImage[];
  faq: LandingFaq[];
  finalHeading: string;
  finalText: string;
  /**
   * Páginas de categoria: chave do catálogo cujos itens reais são listados
   * (conteúdo único e links internos, nunca doorway page). O título acima da
   * grade e o link "ver tudo" saem daqui.
   */
  category?: CategoryKey;
  categoryGridHeading?: string;
  categoryEmpty?: string;
}

/** Rótulo curto de cada landing, usado nos blocos de links internos. */
export const landingNav: Record<LandingSlug, Record<Locale, string>> = {
  "moldes-por-quilo": {
    pt: "Moldes por kg",
    en: "Molds by the kilo",
    es: "Moldes por kg",
  },
  "compramos-moldes": {
    pt: "Compramos moldes",
    en: "We buy molds",
    es: "Compramos moldes",
  },
  "venda-seu-molde": {
    pt: "Venda seu molde",
    en: "Sell your mold",
    es: "Venda su molde",
  },
  "porta-moldes-usados": {
    pt: "Porta-moldes usados",
    en: "Used mold bases",
    es: "Portamoldes usados",
  },
  "moldes-automotivos": {
    pt: "Moldes automotivos",
    en: "Automotive molds",
    es: "Moldes automotrices",
  },
  "moldes-utilidades-domesticas": {
    pt: "Moldes de utilidades domésticas",
    en: "Housewares molds",
    es: "Moldes de utilidades domésticas",
  },
};

/** Landings relacionadas mostradas ao pé de cada página (links internos). */
export const landingRelated: Record<LandingSlug, LandingSlug[]> = {
  "moldes-por-quilo": ["compramos-moldes", "porta-moldes-usados", "venda-seu-molde"],
  "compramos-moldes": ["venda-seu-molde", "moldes-por-quilo", "porta-moldes-usados"],
  "venda-seu-molde": ["compramos-moldes", "moldes-por-quilo", "porta-moldes-usados"],
  "porta-moldes-usados": ["moldes-por-quilo", "compramos-moldes", "moldes-automotivos"],
  "moldes-automotivos": ["moldes-utilidades-domesticas", "porta-moldes-usados", "moldes-por-quilo"],
  "moldes-utilidades-domesticas": ["moldes-automotivos", "porta-moldes-usados", "moldes-por-quilo"],
};

type LocaleContent = Record<LandingSlug, LandingContent>;

const pt: LocaleContent = {
  "moldes-por-quilo": {
    metaTitle: "Moldes Usados por Kg e por Quilo | 3WS Moldes",
    metaDescription:
      "Compra e venda de moldes industriais por kg em São Paulo. Entenda como funciona a negociação de moldes, porta-moldes e ferramentais por peso e consulte o estoque da 3WS.",
    eyebrow: "Diferencial 3WS",
    h1: "Moldes industriais usados por kg e por quilo",
    intro:
      "A venda por peso é um dos maiores diferenciais da 3WS: moldes, porta-moldes e ferramentais parados são negociados por kg, de forma simples e transparente. É o caminho mais direto para dar destino a um ativo que hoje só ocupa espaço — ou para adquirir aço e estrutura a um custo muito abaixo do ferramental novo.",
    ctaMessage:
      "Olá! Tenho interesse em moldes vendidos por kg. Podem me passar mais informações?",
    cta: "Falar sobre moldes por kg",
    heroImage: {
      src: "/images/gallery/04-compra-ferramentas-por-peso.webp",
      alt: "Ferramentas e moldes industriais avaliados por peso no depósito da 3WS em São Paulo",
    },
    sections: [
      {
        heading: "Como funciona a venda por kg",
        body: [
          "Quando um molde não tem mais uso comercial como ferramenta pronta, o valor está no aço e na estrutura. A 3WS avalia o conjunto, define o peso e conduz a negociação por quilo — sem cobrança de projeto, sem burocracia.",
          "O mesmo vale na ponta da compra: quem procura aço, blocos e estruturas de porta-moldes encontra na venda por peso uma forma econômica de abastecer novos projetos.",
        ],
        bullets: [
          "Avaliação do conjunto e definição do peso",
          "Negociação por kg, dentro ou fora de operação",
          "Retirada e logística acompanhadas pela equipe",
        ],
      },
      {
        heading: "Que tipos de peças podem ser negociados por peso",
        body: [
          "Trabalhamos com moldes de injeção plástica, porta-moldes, bases para estampos, ferramentais especiais e lotes completos. Peças desativadas, obsoletas ou danificadas também entram na negociação por peso.",
        ],
        bullets: [
          "Moldes de injeção plástica desativados",
          "Porta-moldes e bases para estampos",
          "Ferramentais especiais e lotes completos",
        ],
      },
      {
        heading: "Para quem faz sentido",
        body: [
          "Para indústrias e ferramentarias que precisam liberar espaço e recuperar parte do investimento de ativos parados. E para quem compra: empresas que enxergam no reaproveitamento e na adaptação de estruturas uma forma de reduzir custo e tempo de projeto.",
        ],
      },
      {
        heading: "Reaproveitamento e adaptação",
        body: [
          "Nem todo molde vendido por peso vira sucata. Muitas estruturas podem ser reaproveitadas, adaptadas ou canibalizadas para novos projetos. Na avaliação, orientamos quando faz mais sentido reaproveitar do que refundir.",
        ],
      },
    ],
    gallery: [
      {
        src: "/images/gallery/09-equipamentos-industriais.webp",
        alt: "Equipamentos e ferramentais industriais armazenados para negociação por peso",
      },
      {
        src: "/images/gallery/10-ferramentas-especiais.webp",
        alt: "Ferramentas especiais e blocos de aço disponíveis por kg na 3WS",
      },
      {
        src: "/images/gallery/11-ativos-industriais-avaliados.webp",
        alt: "Ativos industriais avaliados por peso no depósito da 3WS",
      },
    ],
    faq: [
      {
        q: "Como funciona a venda de moldes por kg?",
        a: "A 3WS avalia o molde ou o lote, define o peso e conduz a negociação por quilo. É indicado quando o valor do ativo está no aço e na estrutura, e não mais no uso como ferramenta pronta.",
      },
      {
        q: "Quais tipos de moldes podem ser vendidos por peso?",
        a: "Moldes de injeção plástica, porta-moldes, bases para estampos, ferramentais especiais e lotes completos — inclusive peças desativadas, obsoletas ou danificadas.",
      },
      {
        q: "A 3WS possui moldes usados disponíveis por kg?",
        a: "Sim. O acervo gira constantemente. Fale com a equipe descrevendo o que procura e verificamos o estoque disponível para negociação por peso.",
      },
      {
        q: "É possível visitar o estoque?",
        a: "Sim. O depósito fica em São Paulo, na região da Avenida Aricanduva / Zona Leste. Agende uma visita pelo WhatsApp para conhecer o acervo.",
      },
      {
        q: "A 3WS atende empresas fora de São Paulo?",
        a: "Sim. Atendemos indústrias em todo o Brasil, do primeiro contato à retirada dos ativos.",
      },
    ],
    finalHeading: "Tem um molde parado ou procura ferramental por peso?",
    finalText:
      "Descreva o que você tem ou o que procura e nossa equipe retorna com uma avaliação por kg.",
  },

  "compramos-moldes": {
    metaTitle: "Compramos Moldes Industriais Usados | 3WS Moldes",
    metaDescription:
      "A 3WS compra moldes de injeção, porta-moldes, bases para estampos e lotes industriais usados em todo o Brasil. Avaliação técnica e negociação por peso. Solicite uma avaliação.",
    eyebrow: "Compra de ativos",
    h1: "Compramos moldes industriais usados",
    intro:
      "A 3WS compra moldes de injeção plástica, porta-moldes, bases para estampos, ferramentais e lotes completos — novos, usados, desativados ou ainda em operação. Transformamos o ativo parado da sua empresa em recurso, com avaliação técnica e negociação transparente.",
    ctaMessage:
      "Olá! Tenho moldes/equipamentos para vender e gostaria de uma avaliação da 3WS.",
    cta: "Solicitar avaliação",
    heroImage: {
      src: "/images/gallery/01-compra-moldes-e-equipamentos.webp",
      alt: "Moldes e equipamentos industriais adquiridos pela 3WS em São Paulo",
    },
    sections: [
      {
        heading: "O que compramos",
        body: [
          "Avaliamos praticamente qualquer ferramental industrial. Se está parado ocupando espaço, provavelmente tem valor.",
        ],
        bullets: [
          "Moldes de injeção plástica",
          "Porta-moldes e bases para estampos",
          "Ferramentais especiais e equipamentos",
          "Lotes completos e ativos por peso",
        ],
      },
      {
        heading: "Como avaliamos",
        body: [
          "Você envia fotos e informações do ativo; nossa equipe faz uma avaliação técnica e comercial e apresenta uma proposta. Quando o valor está no aço, negociamos por kg. Três gerações de experiência garantem uma leitura justa de cada conjunto.",
        ],
      },
      {
        heading: "Por que vender para a 3WS",
        body: [
          "Liberamos espaço na sua planta, recuperamos parte do investimento e cuidamos de toda a logística de retirada. Sem intermediários desnecessários e com pagamento acordado antes da retirada.",
        ],
        bullets: [
          "Avaliação técnica sem compromisso",
          "Negociação de lotes completos, sem fracionar",
          "Retirada e logística por conta da 3WS",
        ],
      },
    ],
    gallery: [
      {
        src: "/images/gallery/09-equipamentos-industriais.webp",
        alt: "Equipamentos industriais avaliados para compra pela 3WS",
      },
      {
        src: "/images/gallery/11-ativos-industriais-avaliados.webp",
        alt: "Ativos industriais avaliados tecnicamente antes da compra",
      },
      {
        src: "/images/gallery/03-intermediacao-comercial.webp",
        alt: "Negociação e intermediação comercial de moldes na 3WS",
      },
    ],
    faq: [
      {
        q: "Que tipos de moldes a 3WS compra?",
        a: "Moldes de injeção plástica, porta-moldes, bases para estampos, ferramentais especiais e equipamentos — novos, usados, desativados ou em operação.",
      },
      {
        q: "Como é feita a avaliação?",
        a: "Você envia fotos e informações do ativo. Fazemos uma avaliação técnica e comercial e apresentamos uma proposta, por unidade, por lote ou por peso.",
      },
      {
        q: "Vocês compram lotes completos?",
        a: "Sim. Temos capacidade técnica e financeira para negociar lotes inteiros de moldes e equipamentos, sem fracionar.",
      },
      {
        q: "A 3WS cuida da retirada?",
        a: "Sim. Cuidamos da logística de retirada em todo o Brasil, combinada após a proposta ser aceita.",
      },
    ],
    finalHeading: "Tem moldes ou equipamentos parados?",
    finalText: "Envie as informações do ativo e receba uma avaliação da equipe da 3WS.",
  },

  "venda-seu-molde": {
    metaTitle: "Venda Seu Molde Industrial Usado | 3WS Moldes",
    metaDescription:
      "Venda seu molde de injeção, porta-molde ou ferramental usado para a 3WS. Avaliação rápida, negociação por peso e retirada em todo o Brasil. Solicite uma proposta.",
    eyebrow: "Para quem vende",
    h1: "Venda seu molde industrial",
    intro:
      "Tem um molde encostado, uma ferramenta obsoleta ou um lote inteiro para desovar? A 3WS avalia e compra. Você recupera capital, libera espaço e evita o custo de manter ativos parados — com um processo rápido e transparente.",
    ctaMessage:
      "Olá! Quero vender um molde/ferramental e gostaria de uma proposta da 3WS.",
    cta: "Enviar meu molde para avaliação",
    heroImage: {
      src: "/images/gallery/02-venda-moldes-e-equipamentos.webp",
      alt: "Moldes industriais preparados para venda no depósito da 3WS",
    },
    sections: [
      {
        heading: "Passo a passo para vender",
        body: [
          "Vender para a 3WS é simples e não tem custo para você.",
        ],
        bullets: [
          "Envie fotos, medidas e informações que tiver do ativo",
          "Recebe uma avaliação técnica e comercial",
          "Aceita a proposta — por unidade, lote ou peso",
          "A 3WS cuida da retirada e do pagamento combinado",
        ],
      },
      {
        heading: "O que aumenta o valor do seu molde",
        body: [
          "Informações claras ajudam na avaliação: número de cavidades, peso aproximado, tipo de peça produzida, estado de conservação e se acompanha porta-molde ou acessórios. Mesmo sem esses dados, conseguimos avaliar a partir de boas fotos.",
        ],
      },
      {
        heading: "Vender por peso",
        body: [
          "Quando a ferramenta não tem mais uso comercial, o valor está no aço. Nesses casos, negociamos por kg — uma saída justa para ativos desativados, obsoletos ou danificados.",
        ],
      },
    ],
    gallery: [
      {
        src: "/images/gallery/06-moldes-injecao-plastica.webp",
        alt: "Molde de injeção plástica avaliado para venda na 3WS",
      },
      {
        src: "/images/gallery/05-avaliacao-consultoria-tecnica.webp",
        alt: "Avaliação técnica de molde industrial antes da venda",
      },
      {
        src: "/images/gallery/11-ativos-industriais-avaliados.webp",
        alt: "Ativos industriais avaliados e preparados para negociação",
      },
    ],
    faq: [
      {
        q: "Quanto vale meu molde?",
        a: "Depende do tipo, do estado e da demanda. A avaliação é gratuita: envie fotos e informações e apresentamos uma proposta por unidade, lote ou peso.",
      },
      {
        q: "Preciso ter a documentação técnica do molde?",
        a: "Ajuda, mas não é obrigatório. Conseguimos avaliar a partir de fotos e das informações que você tiver.",
      },
      {
        q: "E se o molde estiver danificado ou obsoleto?",
        a: "Ainda assim tem valor. Ferramentas fora de operação normalmente são negociadas por peso.",
      },
      {
        q: "Vocês retiram em qualquer estado do Brasil?",
        a: "Sim. Combinamos a logística de retirada após a proposta ser aceita, em todo o território nacional.",
      },
    ],
    finalHeading: "Pronto para vender seu molde?",
    finalText: "Envie as informações e receba uma proposta sem compromisso.",
  },

  "porta-moldes-usados": {
    metaTitle: "Porta-Moldes Usados e Bases Industriais | 3WS Moldes",
    metaDescription:
      "Porta-moldes e bases industriais usados para injeção plástica, disponíveis no estoque da 3WS em São Paulo. Estruturas avaliadas para compra, venda ou reaproveitamento.",
    eyebrow: "Categoria",
    h1: "Porta-moldes usados e bases industriais",
    intro:
      "Porta-moldes são a estrutura que fixa e posiciona o molde durante a injeção. A 3WS mantém porta-moldes e bases usados no estoque, avaliados e prontos para novos projetos — negociados isoladamente ou como parte de um lote, inclusive por peso.",
    ctaMessage:
      "Olá! Procuro porta-moldes usados. Podem verificar o estoque da 3WS?",
    cta: "Consultar porta-moldes",
    heroImage: {
      src: "/images/gallery/07-porta-moldes.webp",
      alt: "Porta-moldes usados armazenados no depósito da 3WS em São Paulo",
    },
    sections: [
      {
        heading: "O que é um porta-molde",
        body: [
          "O porta-molde é o conjunto de placas e guias que sustenta as cavidades e garante o alinhamento durante o ciclo de injeção. Reaproveitar uma boa estrutura economiza aço e tempo de projeto.",
        ],
      },
      {
        heading: "Como negociamos porta-moldes",
        body: [
          "Avaliamos a estrutura, as dimensões e o estado de conservação. Você pode adquirir uma unidade específica, um lote ou negociar por peso quando o interesse está no aço.",
        ],
        bullets: [
          "Estruturas avaliadas e identificadas",
          "Compra por unidade, lote ou por kg",
          "Opção de reaproveitamento e adaptação",
        ],
      },
    ],
    faq: [
      {
        q: "A 3WS tem porta-moldes usados em estoque?",
        a: "Sim. O acervo muda com frequência. Fale com a equipe descrevendo a dimensão ou o tipo de estrutura que procura.",
      },
      {
        q: "Dá para comprar porta-molde por peso?",
        a: "Sim. Quando o interesse está no aço e na estrutura, negociamos por kg.",
      },
      {
        q: "Vocês vendem porta-moldes separados do molde?",
        a: "Sim, negociamos porta-moldes isoladamente ou como parte de um lote.",
      },
    ],
    finalHeading: "Procura um porta-molde específico?",
    finalText:
      "Descreva a estrutura que precisa e a equipe da 3WS verifica o acervo completo.",
    category: "porta-moldes",
    categoryGridHeading: "Porta-moldes no estoque",
    categoryEmpty:
      "No momento não há porta-moldes publicados no catálogo, mas o acervo gira constantemente. Fale com a equipe para consultar o estoque completo.",
  },

  "moldes-automotivos": {
    metaTitle: "Moldes Automotivos Usados | 3WS Moldes",
    metaDescription:
      "Moldes de injeção plástica para o setor automotivo, usados e disponíveis no estoque da 3WS em São Paulo. Peças avaliadas para compra, venda ou reaproveitamento.",
    eyebrow: "Categoria",
    h1: "Moldes automotivos usados",
    intro:
      "Moldes de injeção usados na fabricação de peças plásticas para o setor automotivo. A 3WS mantém no acervo moldes avaliados para autopeças e componentes, prontos para compra, venda ou reaproveitamento em novos projetos.",
    ctaMessage:
      "Olá! Procuro moldes automotivos. Podem verificar o estoque da 3WS?",
    cta: "Consultar moldes automotivos",
    heroImage: {
      src: "/images/gallery/06-moldes-injecao-plastica.webp",
      alt: "Moldes de injeção plástica para o setor automotivo no estoque da 3WS",
    },
    sections: [
      {
        heading: "Aplicações no setor automotivo",
        body: [
          "Componentes plásticos automotivos vão de peças de acabamento a itens funcionais. Um molde usado bem avaliado pode reduzir muito o custo e o prazo de um novo projeto de autopeça.",
        ],
      },
      {
        heading: "Como negociamos",
        body: [
          "Avaliamos cada molde quanto ao estado de conservação e à viabilidade de reaproveitamento. A negociação pode ser por unidade, por lote ou por peso.",
        ],
      },
    ],
    faq: [
      {
        q: "A 3WS tem moldes automotivos disponíveis?",
        a: "Sim, quando há peças do segmento no acervo. Como o estoque gira, fale com a equipe descrevendo o componente que procura.",
      },
      {
        q: "Compram moldes automotivos desativados?",
        a: "Sim. Moldes desativados ou obsoletos costumam ser negociados por peso.",
      },
    ],
    finalHeading: "Procura um molde automotivo?",
    finalText: "Descreva a peça que precisa produzir e verificamos o acervo completo.",
    category: "automotivos",
    categoryGridHeading: "Moldes automotivos no estoque",
    categoryEmpty:
      "No momento não há moldes automotivos publicados no catálogo, mas o acervo gira constantemente. Fale com a equipe para consultar o estoque completo.",
  },

  "moldes-utilidades-domesticas": {
    metaTitle: "Moldes de Utilidades Domésticas Usados | 3WS Moldes",
    metaDescription:
      "Moldes de injeção plástica para utilidades domésticas, usados e disponíveis no estoque da 3WS em São Paulo. Copos, potes, bandejas e mais, avaliados para negociação.",
    eyebrow: "Categoria",
    h1: "Moldes de utilidades domésticas usados",
    intro:
      "Moldes de injeção para a linha de utilidades domésticas — copos, potes, bandejas, saladeiras, tampas e afins. A 3WS mantém no acervo moldes avaliados desse segmento, muitos com registro da peça produzida, prontos para novos ciclos de produção.",
    ctaMessage:
      "Olá! Procuro moldes de utilidades domésticas. Podem verificar o estoque da 3WS?",
    cta: "Consultar utilidades domésticas",
    heroImage: {
      src: "/images/gallery/06-moldes-injecao-plastica.webp",
      alt: "Moldes de injeção plástica para utilidades domésticas no estoque da 3WS",
    },
    sections: [
      {
        heading: "O que você encontra",
        body: [
          "A linha de utilidades domésticas é uma das mais amplas do acervo. Muitos moldes acompanham fotos da peça injetada, o que ajuda a visualizar o resultado antes de negociar.",
        ],
      },
      {
        heading: "Compra, venda e reaproveitamento",
        body: [
          "Os moldes são avaliados quanto ao estado e à viabilidade de reaproveitamento. A negociação pode ser por unidade, por lote ou por peso.",
        ],
      },
    ],
    faq: [
      {
        q: "Quais peças de utilidades domésticas vocês têm?",
        a: "O acervo inclui copos, potes, bandejas, saladeiras, tampas e outros itens da linha. Como o estoque muda, consulte a equipe pelo que procura.",
      },
      {
        q: "Os moldes vêm com fotos da peça produzida?",
        a: "Muitos itens do catálogo trazem o registro da peça injetada, além das fotos do molde.",
      },
    ],
    finalHeading: "Procura um molde de utilidade doméstica?",
    finalText: "Descreva a peça que precisa produzir e verificamos o acervo completo.",
    category: "utilidades-domesticas",
    categoryGridHeading: "Moldes de utilidades domésticas no estoque",
    categoryEmpty:
      "No momento não há moldes desse segmento publicados no catálogo, mas o acervo gira constantemente. Fale com a equipe para consultar o estoque completo.",
  },
};

const en: LocaleContent = {
  "moldes-por-quilo": {
    metaTitle: "Used Molds by the Kilo (per Kg) | 3WS Moldes",
    metaDescription:
      "Buying and selling industrial molds by the kilo in São Paulo, Brazil. Learn how mold, mold-base and tooling deals by weight work, and check 3WS stock.",
    eyebrow: "3WS advantage",
    h1: "Used industrial molds by the kilo (per kg)",
    intro:
      "Selling by weight is one of 3WS's biggest advantages: idle molds, mold bases and tooling are traded by the kilo, simply and transparently. It is the most direct way to give a dormant asset a new destination — or to acquire steel and structure at a fraction of the cost of new tooling.",
    ctaMessage: "Hello! I'm interested in molds sold by the kilo. Could you share more information?",
    cta: "Talk about molds by the kilo",
    heroImage: {
      src: "/images/gallery/04-compra-ferramentas-por-peso.webp",
      alt: "Industrial tools and molds appraised by weight at the 3WS warehouse in São Paulo",
    },
    sections: [
      {
        heading: "How selling by the kilo works",
        body: [
          "When a mold no longer has commercial use as a finished tool, its value lies in the steel and structure. 3WS appraises the set, defines the weight and runs the deal by the kilo — no project fees, no red tape.",
          "The same applies on the buying side: anyone looking for steel, blocks and mold-base structures finds weight-based buying an economical way to feed new projects.",
        ],
        bullets: [
          "Appraisal of the set and weight definition",
          "Deals by the kilo, in or out of operation",
          "Pickup and logistics handled by the team",
        ],
      },
      {
        heading: "Which items can be traded by weight",
        body: [
          "We work with plastic injection molds, mold bases, stamping die bases, special tooling and complete lots. Deactivated, obsolete or damaged pieces are also traded by weight.",
        ],
        bullets: [
          "Deactivated plastic injection molds",
          "Mold bases and stamping die bases",
          "Special tooling and complete lots",
        ],
      },
      {
        heading: "Who it makes sense for",
        body: [
          "For manufacturers and tool shops that need to free up space and recover part of the investment in idle assets. And for buyers: companies that see reuse and adaptation of structures as a way to cut cost and project time.",
        ],
      },
      {
        heading: "Reuse and adaptation",
        body: [
          "Not every mold sold by weight becomes scrap. Many structures can be reused, adapted or cannibalized for new projects. During the appraisal we advise when reuse makes more sense than remelting.",
        ],
      },
    ],
    gallery: [
      {
        src: "/images/gallery/09-equipamentos-industriais.webp",
        alt: "Industrial equipment and tooling stored for weight-based deals",
      },
      {
        src: "/images/gallery/10-ferramentas-especiais.webp",
        alt: "Special tools and steel blocks available by the kilo at 3WS",
      },
      {
        src: "/images/gallery/11-ativos-industriais-avaliados.webp",
        alt: "Industrial assets appraised by weight at the 3WS warehouse",
      },
    ],
    faq: [
      {
        q: "How does selling molds by the kilo work?",
        a: "3WS appraises the mold or lot, defines the weight and runs the deal by the kilo. It suits cases where the asset's value is in the steel and structure rather than in use as a finished tool.",
      },
      {
        q: "Which molds can be sold by weight?",
        a: "Plastic injection molds, mold bases, stamping die bases, special tooling and complete lots — including deactivated, obsolete or damaged pieces.",
      },
      {
        q: "Does 3WS have used molds available by the kilo?",
        a: "Yes. The stock turns over constantly. Tell the team what you need and we check what's available for weight-based deals.",
      },
      {
        q: "Can I visit the warehouse?",
        a: "Yes. The warehouse is in São Paulo, in the Avenida Aricanduva / East Zone area. Schedule a visit on WhatsApp to see the archive.",
      },
      {
        q: "Does 3WS serve companies outside São Paulo?",
        a: "Yes. We serve manufacturers throughout Brazil, from first contact to asset pickup.",
      },
    ],
    finalHeading: "Have an idle mold, or looking for tooling by weight?",
    finalText: "Describe what you have or what you need and our team returns a per-kilo appraisal.",
  },

  "compramos-moldes": {
    metaTitle: "We Buy Used Industrial Molds | 3WS Moldes",
    metaDescription:
      "3WS buys injection molds, mold bases, stamping die bases and industrial lots across Brazil. Technical appraisal and weight-based deals. Request an appraisal.",
    eyebrow: "Asset purchase",
    h1: "We buy used industrial molds",
    intro:
      "3WS buys plastic injection molds, mold bases, stamping die bases, tooling and complete lots — new, used, deactivated or still in operation. We turn your company's idle asset into a resource, with technical appraisal and transparent negotiation.",
    ctaMessage: "Hello! I have molds/equipment to sell and would like a 3WS appraisal.",
    cta: "Request an appraisal",
    heroImage: {
      src: "/images/gallery/01-compra-moldes-e-equipamentos.webp",
      alt: "Industrial molds and equipment purchased by 3WS in São Paulo",
    },
    sections: [
      {
        heading: "What we buy",
        body: ["We appraise virtually any industrial tooling. If it sits idle taking up space, it probably has value."],
        bullets: [
          "Plastic injection molds",
          "Mold bases and stamping die bases",
          "Special tooling and equipment",
          "Complete lots and assets by weight",
        ],
      },
      {
        heading: "How we appraise",
        body: [
          "You send photos and information about the asset; our team runs a technical and commercial appraisal and presents an offer. When the value is in the steel, we deal by the kilo. Three generations of experience ensure a fair read of each set.",
        ],
      },
      {
        heading: "Why sell to 3WS",
        body: [
          "We free up space in your plant, recover part of the investment and handle all pickup logistics. No unnecessary middlemen, with payment agreed before pickup.",
        ],
        bullets: [
          "No-obligation technical appraisal",
          "Complete-lot deals, without splitting",
          "Pickup and logistics handled by 3WS",
        ],
      },
    ],
    gallery: [
      { src: "/images/gallery/09-equipamentos-industriais.webp", alt: "Industrial equipment appraised for purchase by 3WS" },
      { src: "/images/gallery/11-ativos-industriais-avaliados.webp", alt: "Industrial assets technically appraised before purchase" },
      { src: "/images/gallery/03-intermediacao-comercial.webp", alt: "Negotiation and commercial brokerage of molds at 3WS" },
    ],
    faq: [
      {
        q: "What kinds of molds does 3WS buy?",
        a: "Plastic injection molds, mold bases, stamping die bases, special tooling and equipment — new, used, deactivated or in operation.",
      },
      {
        q: "How is the appraisal done?",
        a: "You send photos and information about the asset. We run a technical and commercial appraisal and present an offer — per unit, per lot or by weight.",
      },
      {
        q: "Do you buy complete lots?",
        a: "Yes. We have the technical and financial capacity to negotiate entire lots of molds and equipment, without splitting.",
      },
      {
        q: "Does 3WS handle pickup?",
        a: "Yes. We handle pickup logistics across Brazil, arranged after the offer is accepted.",
      },
    ],
    finalHeading: "Have idle molds or equipment?",
    finalText: "Send the asset information and get an appraisal from the 3WS team.",
  },

  "venda-seu-molde": {
    metaTitle: "Sell Your Used Industrial Mold | 3WS Moldes",
    metaDescription:
      "Sell your injection mold, mold base or used tooling to 3WS. Fast appraisal, weight-based deals and pickup across Brazil. Request an offer.",
    eyebrow: "For sellers",
    h1: "Sell your industrial mold",
    intro:
      "Got a mold gathering dust, an obsolete tool or a whole lot to clear? 3WS appraises and buys. You recover capital, free up space and avoid the cost of keeping idle assets — with a fast, transparent process.",
    ctaMessage: "Hello! I want to sell a mold/tooling and would like an offer from 3WS.",
    cta: "Send my mold for appraisal",
    heroImage: {
      src: "/images/gallery/02-venda-moldes-e-equipamentos.webp",
      alt: "Industrial molds prepared for sale at the 3WS warehouse",
    },
    sections: [
      {
        heading: "Step by step to sell",
        body: ["Selling to 3WS is simple and free of charge for you."],
        bullets: [
          "Send photos, measurements and any information you have",
          "Receive a technical and commercial appraisal",
          "Accept the offer — per unit, lot or weight",
          "3WS handles pickup and the agreed payment",
        ],
      },
      {
        heading: "What raises your mold's value",
        body: [
          "Clear information helps the appraisal: number of cavities, approximate weight, type of part produced, condition and whether it comes with a mold base or accessories. Even without this data, we can appraise from good photos.",
        ],
      },
      {
        heading: "Selling by weight",
        body: [
          "When the tool no longer has commercial use, the value is in the steel. In those cases we deal by the kilo — a fair route for deactivated, obsolete or damaged assets.",
        ],
      },
    ],
    gallery: [
      { src: "/images/gallery/06-moldes-injecao-plastica.webp", alt: "Plastic injection mold appraised for sale at 3WS" },
      { src: "/images/gallery/05-avaliacao-consultoria-tecnica.webp", alt: "Technical appraisal of an industrial mold before sale" },
      { src: "/images/gallery/11-ativos-industriais-avaliados.webp", alt: "Industrial assets appraised and prepared for negotiation" },
    ],
    faq: [
      {
        q: "How much is my mold worth?",
        a: "It depends on the type, condition and demand. The appraisal is free: send photos and information and we present an offer per unit, lot or weight.",
      },
      {
        q: "Do I need the mold's technical documentation?",
        a: "It helps, but it isn't required. We can appraise from photos and whatever information you have.",
      },
      {
        q: "What if the mold is damaged or obsolete?",
        a: "It still has value. Out-of-operation tools are usually traded by weight.",
      },
      {
        q: "Do you pick up anywhere in Brazil?",
        a: "Yes. We arrange pickup logistics after the offer is accepted, nationwide.",
      },
    ],
    finalHeading: "Ready to sell your mold?",
    finalText: "Send the information and get a no-obligation offer.",
  },

  "porta-moldes-usados": {
    metaTitle: "Used Mold Bases and Industrial Structures | 3WS Moldes",
    metaDescription:
      "Used mold bases and industrial structures for plastic injection, available at the 3WS stock in São Paulo. Appraised structures for purchase, sale or reuse.",
    eyebrow: "Category",
    h1: "Used mold bases and industrial structures",
    intro:
      "Mold bases are the structure that holds and positions the mold during injection. 3WS keeps used mold bases in stock, appraised and ready for new projects — traded individually or as part of a lot, including by weight.",
    ctaMessage: "Hello! I'm looking for used mold bases. Could you check 3WS stock?",
    cta: "Check mold bases",
    heroImage: {
      src: "/images/gallery/07-porta-moldes.webp",
      alt: "Used mold bases stored at the 3WS warehouse in São Paulo",
    },
    sections: [
      {
        heading: "What a mold base is",
        body: [
          "The mold base is the set of plates and guides that supports the cavities and ensures alignment during the injection cycle. Reusing a good structure saves steel and project time.",
        ],
      },
      {
        heading: "How we trade mold bases",
        body: [
          "We appraise the structure, dimensions and condition. You can buy a specific unit, a lot or deal by weight when the interest is in the steel.",
        ],
        bullets: [
          "Appraised and identified structures",
          "Purchase per unit, lot or by the kilo",
          "Reuse and adaptation options",
        ],
      },
    ],
    faq: [
      {
        q: "Does 3WS have used mold bases in stock?",
        a: "Yes. The archive changes frequently. Talk to the team describing the dimension or type of structure you need.",
      },
      {
        q: "Can I buy a mold base by weight?",
        a: "Yes. When the interest is in the steel and structure, we deal by the kilo.",
      },
      {
        q: "Do you sell mold bases separately from the mold?",
        a: "Yes, we trade mold bases individually or as part of a lot.",
      },
    ],
    finalHeading: "Looking for a specific mold base?",
    finalText: "Describe the structure you need and the 3WS team checks the full archive.",
    category: "porta-moldes",
    categoryGridHeading: "Mold bases in stock",
    categoryEmpty:
      "There are no mold bases published in the catalogue right now, but the archive turns over constantly. Talk to the team to check the full stock.",
  },

  "moldes-automotivos": {
    metaTitle: "Used Automotive Molds | 3WS Moldes",
    metaDescription:
      "Plastic injection molds for the automotive sector, used and available at the 3WS stock in São Paulo. Appraised pieces for purchase, sale or reuse.",
    eyebrow: "Category",
    h1: "Used automotive molds",
    intro:
      "Injection molds used to make plastic parts for the automotive sector. 3WS keeps appraised molds for auto parts and components in the archive, ready for purchase, sale or reuse in new projects.",
    ctaMessage: "Hello! I'm looking for automotive molds. Could you check 3WS stock?",
    cta: "Check automotive molds",
    heroImage: {
      src: "/images/gallery/06-moldes-injecao-plastica.webp",
      alt: "Plastic injection molds for the automotive sector at 3WS stock",
    },
    sections: [
      {
        heading: "Automotive applications",
        body: [
          "Automotive plastic components range from trim parts to functional items. A well-appraised used mold can greatly reduce the cost and lead time of a new auto-part project.",
        ],
      },
      {
        heading: "How we trade",
        body: [
          "We appraise each mold for condition and reuse viability. Deals can be per unit, per lot or by weight.",
        ],
      },
    ],
    faq: [
      {
        q: "Does 3WS have automotive molds available?",
        a: "Yes, when there are pieces from the segment in the archive. As stock turns over, talk to the team describing the component you need.",
      },
      {
        q: "Do you buy deactivated automotive molds?",
        a: "Yes. Deactivated or obsolete molds are usually traded by weight.",
      },
    ],
    finalHeading: "Looking for an automotive mold?",
    finalText: "Describe the part you need to produce and we check the full archive.",
    category: "automotivos",
    categoryGridHeading: "Automotive molds in stock",
    categoryEmpty:
      "There are no automotive molds published in the catalogue right now, but the archive turns over constantly. Talk to the team to check the full stock.",
  },

  "moldes-utilidades-domesticas": {
    metaTitle: "Used Housewares Molds | 3WS Moldes",
    metaDescription:
      "Plastic injection molds for housewares, used and available at the 3WS stock in São Paulo. Cups, containers, trays and more, appraised for negotiation.",
    eyebrow: "Category",
    h1: "Used housewares molds",
    intro:
      "Injection molds for the housewares line — cups, containers, trays, salad bowls, lids and the like. 3WS keeps appraised molds from this segment in the archive, many with a record of the part produced, ready for new production cycles.",
    ctaMessage: "Hello! I'm looking for housewares molds. Could you check 3WS stock?",
    cta: "Check housewares molds",
    heroImage: {
      src: "/images/gallery/06-moldes-injecao-plastica.webp",
      alt: "Plastic injection molds for housewares at 3WS stock",
    },
    sections: [
      {
        heading: "What you'll find",
        body: [
          "The housewares line is one of the broadest in the archive. Many molds come with photos of the injected part, which helps visualize the result before negotiating.",
        ],
      },
      {
        heading: "Purchase, sale and reuse",
        body: [
          "Molds are appraised for condition and reuse viability. Deals can be per unit, per lot or by weight.",
        ],
      },
    ],
    faq: [
      {
        q: "Which housewares pieces do you have?",
        a: "The archive includes cups, containers, trays, salad bowls, lids and other line items. As stock changes, ask the team about what you need.",
      },
      {
        q: "Do the molds come with photos of the produced part?",
        a: "Many catalogue items include a record of the injected part, alongside photos of the mold.",
      },
    ],
    finalHeading: "Looking for a housewares mold?",
    finalText: "Describe the part you need to produce and we check the full archive.",
    category: "utilidades-domesticas",
    categoryGridHeading: "Housewares molds in stock",
    categoryEmpty:
      "There are no molds from this segment published in the catalogue right now, but the archive turns over constantly. Talk to the team to check the full stock.",
  },
};

const es: LocaleContent = {
  "moldes-por-quilo": {
    metaTitle: "Moldes Usados por Kg y por Kilo | 3WS Moldes",
    metaDescription:
      "Compra y venta de moldes industriales por kg en São Paulo. Entienda cómo funciona la negociación de moldes, portamoldes y herramentales por peso y consulte el stock de 3WS.",
    eyebrow: "Diferencial 3WS",
    h1: "Moldes industriales usados por kg y por kilo",
    intro:
      "La venta por peso es uno de los mayores diferenciales de 3WS: moldes, portamoldes y herramentales parados se negocian por kg, de forma simple y transparente. Es el camino más directo para dar destino a un activo que hoy solo ocupa espacio — o para adquirir acero y estructura a un costo muy por debajo del herramental nuevo.",
    ctaMessage: "¡Hola! Me interesan los moldes vendidos por kg. ¿Pueden darme más información?",
    cta: "Hablar sobre moldes por kg",
    heroImage: {
      src: "/images/gallery/04-compra-ferramentas-por-peso.webp",
      alt: "Herramientas y moldes industriales tasados por peso en el depósito de 3WS en São Paulo",
    },
    sections: [
      {
        heading: "Cómo funciona la venta por kg",
        body: [
          "Cuando un molde ya no tiene uso comercial como herramienta terminada, el valor está en el acero y en la estructura. 3WS evalúa el conjunto, define el peso y conduce la negociación por kilo — sin cobro de proyecto, sin burocracia.",
          "Lo mismo vale del lado de la compra: quien busca acero, bloques y estructuras de portamoldes encuentra en la venta por peso una forma económica de abastecer nuevos proyectos.",
        ],
        bullets: [
          "Evaluación del conjunto y definición del peso",
          "Negociación por kg, dentro o fuera de operación",
          "Retiro y logística acompañados por el equipo",
        ],
      },
      {
        heading: "Qué piezas pueden negociarse por peso",
        body: [
          "Trabajamos con moldes de inyección de plástico, portamoldes, bases para troqueles, herramentales especiales y lotes completos. Piezas desactivadas, obsoletas o dañadas también entran en la negociación por peso.",
        ],
        bullets: [
          "Moldes de inyección de plástico desactivados",
          "Portamoldes y bases para troqueles",
          "Herramentales especiales y lotes completos",
        ],
      },
      {
        heading: "Para quién tiene sentido",
        body: [
          "Para industrias y matricerías que necesitan liberar espacio y recuperar parte de la inversión de activos parados. Y para quien compra: empresas que ven en el reaprovechamiento y la adaptación de estructuras una forma de reducir costo y tiempo de proyecto.",
        ],
      },
      {
        heading: "Reaprovechamiento y adaptación",
        body: [
          "No todo molde vendido por peso se convierte en chatarra. Muchas estructuras pueden reaprovecharse, adaptarse o canibalizarse para nuevos proyectos. En la evaluación orientamos cuándo tiene más sentido reaprovechar que refundir.",
        ],
      },
    ],
    gallery: [
      { src: "/images/gallery/09-equipamentos-industriais.webp", alt: "Equipos y herramentales industriales almacenados para negociación por peso" },
      { src: "/images/gallery/10-ferramentas-especiais.webp", alt: "Herramientas especiales y bloques de acero disponibles por kg en 3WS" },
      { src: "/images/gallery/11-ativos-industriais-avaliados.webp", alt: "Activos industriales tasados por peso en el depósito de 3WS" },
    ],
    faq: [
      {
        q: "¿Cómo funciona la venta de moldes por kg?",
        a: "3WS evalúa el molde o el lote, define el peso y conduce la negociación por kilo. Se indica cuando el valor del activo está en el acero y la estructura, y no en el uso como herramienta terminada.",
      },
      {
        q: "¿Qué tipos de moldes pueden venderse por peso?",
        a: "Moldes de inyección de plástico, portamoldes, bases para troqueles, herramentales especiales y lotes completos — incluso piezas desactivadas, obsoletas o dañadas.",
      },
      {
        q: "¿3WS tiene moldes usados disponibles por kg?",
        a: "Sí. El acervo se renueva constantemente. Hable con el equipo describiendo lo que busca y verificamos el stock disponible para negociación por peso.",
      },
      {
        q: "¿Es posible visitar el stock?",
        a: "Sí. El depósito está en São Paulo, en la región de la Avenida Aricanduva / Zona Este. Agende una visita por WhatsApp para conocer el acervo.",
      },
      {
        q: "¿3WS atiende empresas fuera de São Paulo?",
        a: "Sí. Atendemos industrias en todo Brasil, del primer contacto al retiro de los activos.",
      },
    ],
    finalHeading: "¿Tiene un molde parado o busca herramental por peso?",
    finalText: "Describa lo que tiene o lo que busca y nuestro equipo responde con una evaluación por kg.",
  },

  "compramos-moldes": {
    metaTitle: "Compramos Moldes Industriales Usados | 3WS Moldes",
    metaDescription:
      "3WS compra moldes de inyección, portamoldes, bases para troqueles y lotes industriales usados en todo Brasil. Evaluación técnica y negociación por peso. Solicite una evaluación.",
    eyebrow: "Compra de activos",
    h1: "Compramos moldes industriales usados",
    intro:
      "3WS compra moldes de inyección de plástico, portamoldes, bases para troqueles, herramentales y lotes completos — nuevos, usados, desactivados o aún en operación. Transformamos el activo parado de su empresa en recurso, con evaluación técnica y negociación transparente.",
    ctaMessage: "¡Hola! Tengo moldes/equipos para vender y quisiera una evaluación de 3WS.",
    cta: "Solicitar evaluación",
    heroImage: {
      src: "/images/gallery/01-compra-moldes-e-equipamentos.webp",
      alt: "Moldes y equipos industriales adquiridos por 3WS en São Paulo",
    },
    sections: [
      {
        heading: "Qué compramos",
        body: ["Evaluamos prácticamente cualquier herramental industrial. Si está parado ocupando espacio, probablemente tiene valor."],
        bullets: [
          "Moldes de inyección de plástico",
          "Portamoldes y bases para troqueles",
          "Herramentales especiales y equipos",
          "Lotes completos y activos por peso",
        ],
      },
      {
        heading: "Cómo evaluamos",
        body: [
          "Usted envía fotos e información del activo; nuestro equipo hace una evaluación técnica y comercial y presenta una propuesta. Cuando el valor está en el acero, negociamos por kg. Tres generaciones de experiencia garantizan una lectura justa de cada conjunto.",
        ],
      },
      {
        heading: "Por qué vender a 3WS",
        body: [
          "Liberamos espacio en su planta, recuperamos parte de la inversión y nos ocupamos de toda la logística de retiro. Sin intermediarios innecesarios y con pago acordado antes del retiro.",
        ],
        bullets: [
          "Evaluación técnica sin compromiso",
          "Negociación de lotes completos, sin fraccionar",
          "Retiro y logística por cuenta de 3WS",
        ],
      },
    ],
    gallery: [
      { src: "/images/gallery/09-equipamentos-industriais.webp", alt: "Equipos industriales evaluados para compra por 3WS" },
      { src: "/images/gallery/11-ativos-industriais-avaliados.webp", alt: "Activos industriales tasados técnicamente antes de la compra" },
      { src: "/images/gallery/03-intermediacao-comercial.webp", alt: "Negociación e intermediación comercial de moldes en 3WS" },
    ],
    faq: [
      {
        q: "¿Qué tipos de moldes compra 3WS?",
        a: "Moldes de inyección de plástico, portamoldes, bases para troqueles, herramentales especiales y equipos — nuevos, usados, desactivados o en operación.",
      },
      {
        q: "¿Cómo se hace la evaluación?",
        a: "Usted envía fotos e información del activo. Hacemos una evaluación técnica y comercial y presentamos una propuesta — por unidad, por lote o por peso.",
      },
      {
        q: "¿Compran lotes completos?",
        a: "Sí. Tenemos capacidad técnica y financiera para negociar lotes enteros de moldes y equipos, sin fraccionar.",
      },
      {
        q: "¿3WS se ocupa del retiro?",
        a: "Sí. Nos ocupamos de la logística de retiro en todo Brasil, coordinada tras aceptar la propuesta.",
      },
    ],
    finalHeading: "¿Tiene moldes o equipos parados?",
    finalText: "Envíe la información del activo y reciba una evaluación del equipo de 3WS.",
  },

  "venda-seu-molde": {
    metaTitle: "Venda Su Molde Industrial Usado | 3WS Moldes",
    metaDescription:
      "Venda su molde de inyección, portamolde o herramental usado a 3WS. Evaluación rápida, negociación por peso y retiro en todo Brasil. Solicite una propuesta.",
    eyebrow: "Para quien vende",
    h1: "Venda su molde industrial",
    intro:
      "¿Tiene un molde arrinconado, una herramienta obsoleta o un lote entero para desocupar? 3WS evalúa y compra. Usted recupera capital, libera espacio y evita el costo de mantener activos parados — con un proceso rápido y transparente.",
    ctaMessage: "¡Hola! Quiero vender un molde/herramental y quisiera una propuesta de 3WS.",
    cta: "Enviar mi molde para evaluación",
    heroImage: {
      src: "/images/gallery/02-venda-moldes-e-equipamentos.webp",
      alt: "Moldes industriales preparados para venta en el depósito de 3WS",
    },
    sections: [
      {
        heading: "Paso a paso para vender",
        body: ["Vender a 3WS es simple y no tiene costo para usted."],
        bullets: [
          "Envíe fotos, medidas e información que tenga del activo",
          "Reciba una evaluación técnica y comercial",
          "Acepte la propuesta — por unidad, lote o peso",
          "3WS se ocupa del retiro y del pago acordado",
        ],
      },
      {
        heading: "Qué aumenta el valor de su molde",
        body: [
          "La información clara ayuda en la evaluación: número de cavidades, peso aproximado, tipo de pieza producida, estado de conservación y si acompaña portamolde o accesorios. Aun sin esos datos, podemos evaluar a partir de buenas fotos.",
        ],
      },
      {
        heading: "Vender por peso",
        body: [
          "Cuando la herramienta ya no tiene uso comercial, el valor está en el acero. En esos casos negociamos por kg — una salida justa para activos desactivados, obsoletos o dañados.",
        ],
      },
    ],
    gallery: [
      { src: "/images/gallery/06-moldes-injecao-plastica.webp", alt: "Molde de inyección de plástico evaluado para venta en 3WS" },
      { src: "/images/gallery/05-avaliacao-consultoria-tecnica.webp", alt: "Evaluación técnica de un molde industrial antes de la venta" },
      { src: "/images/gallery/11-ativos-industriais-avaliados.webp", alt: "Activos industriales evaluados y preparados para negociación" },
    ],
    faq: [
      {
        q: "¿Cuánto vale mi molde?",
        a: "Depende del tipo, del estado y de la demanda. La evaluación es gratuita: envíe fotos e información y presentamos una propuesta por unidad, lote o peso.",
      },
      {
        q: "¿Necesito la documentación técnica del molde?",
        a: "Ayuda, pero no es obligatorio. Podemos evaluar a partir de fotos y de la información que tenga.",
      },
      {
        q: "¿Y si el molde está dañado u obsoleto?",
        a: "Aun así tiene valor. Las herramientas fuera de operación normalmente se negocian por peso.",
      },
      {
        q: "¿Retiran en cualquier estado de Brasil?",
        a: "Sí. Coordinamos la logística de retiro tras aceptar la propuesta, en todo el territorio nacional.",
      },
    ],
    finalHeading: "¿Listo para vender su molde?",
    finalText: "Envíe la información y reciba una propuesta sin compromiso.",
  },

  "porta-moldes-usados": {
    metaTitle: "Portamoldes Usados y Estructuras Industriales | 3WS Moldes",
    metaDescription:
      "Portamoldes y estructuras industriales usados para inyección de plástico, disponibles en el stock de 3WS en São Paulo. Estructuras tasadas para compra, venta o reaprovechamiento.",
    eyebrow: "Categoría",
    h1: "Portamoldes usados y estructuras industriales",
    intro:
      "Los portamoldes son la estructura que fija y posiciona el molde durante la inyección. 3WS mantiene portamoldes usados en stock, tasados y listos para nuevos proyectos — negociados por separado o como parte de un lote, incluso por peso.",
    ctaMessage: "¡Hola! Busco portamoldes usados. ¿Pueden verificar el stock de 3WS?",
    cta: "Consultar portamoldes",
    heroImage: {
      src: "/images/gallery/07-porta-moldes.webp",
      alt: "Portamoldes usados almacenados en el depósito de 3WS en São Paulo",
    },
    sections: [
      {
        heading: "Qué es un portamolde",
        body: [
          "El portamolde es el conjunto de placas y guías que sostiene las cavidades y garantiza la alineación durante el ciclo de inyección. Reaprovechar una buena estructura ahorra acero y tiempo de proyecto.",
        ],
      },
      {
        heading: "Cómo negociamos portamoldes",
        body: [
          "Evaluamos la estructura, las dimensiones y el estado de conservación. Puede adquirir una unidad específica, un lote o negociar por peso cuando el interés está en el acero.",
        ],
        bullets: [
          "Estructuras tasadas e identificadas",
          "Compra por unidad, lote o por kg",
          "Opción de reaprovechamiento y adaptación",
        ],
      },
    ],
    faq: [
      {
        q: "¿3WS tiene portamoldes usados en stock?",
        a: "Sí. El acervo cambia con frecuencia. Hable con el equipo describiendo la dimensión o el tipo de estructura que busca.",
      },
      {
        q: "¿Se puede comprar portamolde por peso?",
        a: "Sí. Cuando el interés está en el acero y la estructura, negociamos por kg.",
      },
      {
        q: "¿Venden portamoldes separados del molde?",
        a: "Sí, negociamos portamoldes por separado o como parte de un lote.",
      },
    ],
    finalHeading: "¿Busca un portamolde específico?",
    finalText: "Describa la estructura que necesita y el equipo de 3WS verifica el acervo completo.",
    category: "porta-moldes",
    categoryGridHeading: "Portamoldes en el stock",
    categoryEmpty:
      "Por ahora no hay portamoldes publicados en el catálogo, pero el acervo se renueva constantemente. Hable con el equipo para consultar el stock completo.",
  },

  "moldes-automotivos": {
    metaTitle: "Moldes Automotrices Usados | 3WS Moldes",
    metaDescription:
      "Moldes de inyección de plástico para el sector automotriz, usados y disponibles en el stock de 3WS en São Paulo. Piezas tasadas para compra, venta o reaprovechamiento.",
    eyebrow: "Categoría",
    h1: "Moldes automotrices usados",
    intro:
      "Moldes de inyección usados en la fabricación de piezas plásticas para el sector automotriz. 3WS mantiene en el acervo moldes tasados para autopartes y componentes, listos para compra, venta o reaprovechamiento en nuevos proyectos.",
    ctaMessage: "¡Hola! Busco moldes automotrices. ¿Pueden verificar el stock de 3WS?",
    cta: "Consultar moldes automotrices",
    heroImage: {
      src: "/images/gallery/06-moldes-injecao-plastica.webp",
      alt: "Moldes de inyección de plástico para el sector automotriz en el stock de 3WS",
    },
    sections: [
      {
        heading: "Aplicaciones en el sector automotriz",
        body: [
          "Los componentes plásticos automotrices van desde piezas de acabado hasta ítems funcionales. Un molde usado bien tasado puede reducir mucho el costo y el plazo de un nuevo proyecto de autoparte.",
        ],
      },
      {
        heading: "Cómo negociamos",
        body: [
          "Evaluamos cada molde por su estado de conservación y la viabilidad de reaprovechamiento. La negociación puede ser por unidad, por lote o por peso.",
        ],
      },
    ],
    faq: [
      {
        q: "¿3WS tiene moldes automotrices disponibles?",
        a: "Sí, cuando hay piezas del segmento en el acervo. Como el stock se renueva, hable con el equipo describiendo el componente que busca.",
      },
      {
        q: "¿Compran moldes automotrices desactivados?",
        a: "Sí. Los moldes desactivados u obsoletos suelen negociarse por peso.",
      },
    ],
    finalHeading: "¿Busca un molde automotriz?",
    finalText: "Describa la pieza que necesita producir y verificamos el acervo completo.",
    category: "automotivos",
    categoryGridHeading: "Moldes automotrices en el stock",
    categoryEmpty:
      "Por ahora no hay moldes automotrices publicados en el catálogo, pero el acervo se renueva constantemente. Hable con el equipo para consultar el stock completo.",
  },

  "moldes-utilidades-domesticas": {
    metaTitle: "Moldes de Utilidades Domésticas Usados | 3WS Moldes",
    metaDescription:
      "Moldes de inyección de plástico para utilidades domésticas, usados y disponibles en el stock de 3WS en São Paulo. Vasos, recipientes, bandejas y más, tasados para negociación.",
    eyebrow: "Categoría",
    h1: "Moldes de utilidades domésticas usados",
    intro:
      "Moldes de inyección para la línea de utilidades domésticas — vasos, recipientes, bandejas, ensaladeras, tapas y afines. 3WS mantiene en el acervo moldes tasados de ese segmento, muchos con registro de la pieza producida, listos para nuevos ciclos de producción.",
    ctaMessage: "¡Hola! Busco moldes de utilidades domésticas. ¿Pueden verificar el stock de 3WS?",
    cta: "Consultar utilidades domésticas",
    heroImage: {
      src: "/images/gallery/06-moldes-injecao-plastica.webp",
      alt: "Moldes de inyección de plástico para utilidades domésticas en el stock de 3WS",
    },
    sections: [
      {
        heading: "Qué encontrará",
        body: [
          "La línea de utilidades domésticas es una de las más amplias del acervo. Muchos moldes acompañan fotos de la pieza inyectada, lo que ayuda a visualizar el resultado antes de negociar.",
        ],
      },
      {
        heading: "Compra, venta y reaprovechamiento",
        body: [
          "Los moldes se evalúan por su estado y la viabilidad de reaprovechamiento. La negociación puede ser por unidad, por lote o por peso.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Qué piezas de utilidades domésticas tienen?",
        a: "El acervo incluye vasos, recipientes, bandejas, ensaladeras, tapas y otros ítems de la línea. Como el stock cambia, consulte al equipo por lo que busca.",
      },
      {
        q: "¿Los moldes vienen con fotos de la pieza producida?",
        a: "Muchos ítems del catálogo traen el registro de la pieza inyectada, además de las fotos del molde.",
      },
    ],
    finalHeading: "¿Busca un molde de utilidad doméstica?",
    finalText: "Describa la pieza que necesita producir y verificamos el acervo completo.",
    category: "utilidades-domesticas",
    categoryGridHeading: "Moldes de utilidades domésticas en el stock",
    categoryEmpty:
      "Por ahora no hay moldes de ese segmento publicados en el catálogo, pero el acervo se renueva constantemente. Hable con el equipo para consultar el stock completo.",
  },
};

const LANDING: Record<Locale, LocaleContent> = { pt, en, es };

export function getLandingContent(locale: Locale, slug: LandingSlug): LandingContent {
  return LANDING[locale][slug];
}

export function isLandingSlug(value: string): value is LandingSlug {
  return (LANDING_SLUGS as readonly string[]).includes(value);
}
