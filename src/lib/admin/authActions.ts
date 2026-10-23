"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SITE } from "@/lib/site";
import { LOGIN_MAX_ATTEMPTS } from "./constants";

export type LoginState = { error: string | null };
export type ResetState = { error: string | null; sent: boolean };
export type NewPasswordState = { error: string | null };

const CONFIG_ERROR =
  "O painel ainda não está conectado ao banco. Confira as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.";

/**
 * Mensagem única para e-mail inexistente, senha errada e usuário sem
 * permissão. Dizer qual dos três falhou entregaria a um invasor se o e-mail
 * existe — e o dono, que sabe a própria senha, não perde nada com isso.
 */
const GENERIC_LOGIN_ERROR = "E-mail ou senha incorretos.";

/** Identificador do freio: e-mail + IP, nunca armazenados em claro. */
async function throttleIdentifier(email: string): Promise<string> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "desconhecido";
  return createHash("sha256").update(`${email.toLowerCase()}|${ip}`).digest("hex");
}

/** Só caminhos internos do painel: evita redirecionamento aberto pós-login. */
function safeNext(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/admin") && !path.startsWith("//") ? path : "/admin";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv()) return { error: CONFIG_ERROR };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const supabase = await createClient();
  const identifier = await throttleIdentifier(email);

  const { data: attempts } = await supabase.rpc("register_login_attempt", {
    p_identifier: identifier,
  });

  if (typeof attempts === "number" && attempts > LOGIN_MAX_ATTEMPTS) {
    return {
      error: "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: GENERIC_LOGIN_ERROR };

  // Autenticou — mas autorização é outra coisa. Sem linha em admin_users, a
  // sessão é encerrada na hora e a mensagem é a mesma de senha errada.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return { error: GENERIC_LOGIN_ERROR };
  }

  await supabase.rpc("clear_login_attempts", { p_identifier: identifier });

  revalidatePath("/admin", "layout");
  redirect(next);
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

/**
 * Envia o link de redefinição.
 *
 * Responde "enviado" mesmo quando o e-mail não existe: a tela de recuperação
 * não pode virar um verificador de contas.
 */
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  if (!hasSupabaseEnv()) return { error: CONFIG_ERROR, sent: false };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe o e-mail.", sent: false };

  const supabase = await createClient();
  const identifier = await throttleIdentifier(email);
  const { data: attempts } = await supabase.rpc("register_login_attempt", {
    p_identifier: identifier,
  });

  if (typeof attempts === "number" && attempts > LOGIN_MAX_ATTEMPTS) {
    return { error: "Muitas tentativas seguidas. Aguarde alguns minutos.", sent: false };
  }

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE.url}/admin/nova-senha`,
  });

  return { error: null, sent: true };
}

/** Grava a senha nova. Só funciona com a sessão criada pelo link do e-mail. */
export async function updatePassword(
  _prev: NewPasswordState,
  formData: FormData
): Promise<NewPasswordState> {
  if (!hasSupabaseEnv()) return { error: CONFIG_ERROR };

  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 10) {
    return { error: "A senha precisa ter pelo menos 10 caracteres." };
  }
  if (password !== confirmation) {
    return { error: "As duas senhas não são iguais." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "O link expirou. Peça um novo e-mail de redefinição e tente de novo.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Não foi possível salvar a senha nova. Tente novamente." };

  revalidatePath("/admin", "layout");
  redirect("/admin");
}
