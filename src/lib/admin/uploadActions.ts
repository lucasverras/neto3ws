"use server";

import { STOCK_BUCKET } from "@/lib/supabase/env";
import { requireAdmin } from "./auth";

/**
 * Apaga do bucket arquivos enviados numa sessão de edição que acabaram não
 * sendo salvos (foto adicionada e removida antes de "Salvar", ou formulário
 * abandonado). Sem isto, cada tentativa deixaria lixo pago no Storage.
 *
 * Passa pelo servidor para que a autorização seja conferida: o navegador não
 * escolhe o que apagar sem ser administrador.
 */
export async function discardUploads(refs: string[]): Promise<void> {
  if (refs.length === 0) return;

  try {
    const { supabase } = await requireAdmin();

    // Só remove o que não está referenciado por nenhum registro — uma foto
    // duplicada compartilha os mesmos arquivos com o produto original.
    const { data: used } = await supabase
      .from("stock_images")
      .select("variants")
      .eq("source", "storage");

    const inUse = new Set<string>();
    for (const row of used ?? []) {
      for (const variant of Array.isArray(row.variants) ? row.variants : []) {
        if (typeof variant?.ref === "string") inUse.add(variant.ref);
      }
    }

    const removable = refs.filter((ref) => !inUse.has(ref));
    if (removable.length > 0) {
      await supabase.storage.from(STOCK_BUCKET).remove(removable);
    }
  } catch {
    // Limpeza é oportunista: falhar aqui não pode travar o cadastro.
  }
}
