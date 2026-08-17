import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O indicador de dev nasce no canto inferior esquerdo, exatamente sobre o
  // globo de idiomas, e intercepta o clique durante o desenvolvimento.
  devIndicators: { position: "top-left" },

  async headers() {
    return [
      {
        // Derivativos do estoque: URLs estáveis e conteúdo imutável enquanto a
        // foto original não mudar, então vale cache longo com revalidação.
        source: "/acervo/:slug/:file*.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
