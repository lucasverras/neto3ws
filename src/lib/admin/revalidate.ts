import { revalidatePath } from "next/cache";

/**
 * Invalida tudo que mostra estoque, nos três idiomas.
 *
 * Os caminhos são os padrões de rota (não URLs literais), então uma única
 * chamada cobre /pt, /en e /es — é assim que `revalidatePath` trabalha com
 * segmentos dinâmicos.
 */
export function revalidateStock() {
  // Catálogo e páginas de molde.
  revalidatePath("/[locale]/estoque", "page");
  revalidatePath("/[locale]/estoque/[slug]", "page");
  // Landings de categoria listam moldes reais do catálogo.
  revalidatePath("/[locale]/[landing]", "page");
  // Sitemap e painel.
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
}
