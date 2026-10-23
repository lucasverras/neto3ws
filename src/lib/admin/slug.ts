/**
 * Slug público a partir do nome digitado.
 *
 * Mesma forma dos slugs que já existem no acervo ("copo-250ml-2-cavidades"),
 * para que `parseSlug` continue extraindo volume, peso e cavidades de um item
 * cadastrado pelo painel exatamente como faz com os importados.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

/** Acrescenta sufixo numérico até o slug ficar livre. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "molde";
  if (!taken.has(root)) return root;
  for (let suffix = 2; suffix < 500; suffix += 1) {
    const candidate = `${root}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}
