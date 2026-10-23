/**
 * Leitura centralizada das variáveis do Supabase.
 *
 * Cada função diz exatamente qual variável falta, em vez de estourar um erro
 * críptico no fundo do driver. O site continua de pé sem Supabase: o catálogo
 * cai para a fonte estática de arquivos (ver src/lib/stock/catalog.ts), e o
 * /admin fecha em vez de abrir sem autenticação.
 */

export class MissingEnvError extends Error {
  constructor(public readonly variable: string) {
    super(`Falta a variável de ambiente ${variable}`);
    this.name = "MissingEnvError";
  }
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") throw new MissingEnvError(name);
  return value.trim();
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function supabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * true quando dá para falar com o Supabase.
 *
 * É o interruptor que decide a fonte do catálogo: com credenciais, o banco é a
 * única fonte de verdade; sem elas, o site serve o acervo estático de sempre.
 */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Bucket das fotos do estoque da 3WS. */
export const STOCK_BUCKET = "estoque";
