"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { signIn, type LoginState } from "@/lib/admin/authActions";
import { ErrorBox, FIELD_CLASS, LABEL_CLASS, primaryButtonClass } from "./ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass("w-full")}>
      <LogIn size={16} strokeWidth={1.75} aria-hidden />
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, { error: null });

  return (
    <form action={formAction} className="mt-10 space-y-5">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className={LABEL_CLASS}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          required
          // Repõe o que foi digitado: o React 19 limpa o formulário depois da
          // action, e perder o e-mail a cada erro de senha seria irritante.
          defaultValue={state.email ?? ""}
          key={state.email ?? ""}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="password" className={LABEL_CLASS}>
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD_CLASS}
        />
      </div>

      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      <SubmitButton />

      <p className="text-center">
        <Link
          href="/admin/recuperar"
          className="font-body text-[13px] text-white/50 underline-offset-4 transition-colors hover:text-teal hover:underline"
        >
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}
