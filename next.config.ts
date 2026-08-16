import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Derivativos do estoque: URLs estáveis e conteúdo imutável enquanto a
        // foto original não mudar, então vale cache longo com revalidação.
        source: "/estoque/:slug/:file*.webp",
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
