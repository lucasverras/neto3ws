"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, KeyRound } from "lucide-react";
import {
  requestPasswordReset,
  updatePassword,
  type NewPasswordState,
  type ResetState,
} from "@/lib/admin/authActions";
import { ErrorBox, FIELD_CLASS, LABEL_CLASS, SuccessBox, primaryButtonClass } from "./ui";

function Submit({ idle, busy, icon }: { idle: string; busy: string; icon: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass("w-full")}>
      {icon}
      {pending ? busy : idle}
    </button>
  );
}

export function RequestResetForm() {
  const [state, formAction] = useActionState<ResetState, FormData>(requestPasswordReset, {
    error: null,
    sent: false,
  });

  // A confirmação é a mesma para e-mail existente e inexistente: a tela de
  // recuperação não pode servir para descobrir quem tem conta.
  if (state.sent) {
    return (
      <div className="mt-10 space-y-6">
        <SuccessBox>
          Se esse e-mail estiver cadastrado, o link de redefinição chegou na caixa de
          entrada. O link vale por uma hora.
        </SuccessBox>
        <p className="text-center">
          <Link
            href="/admin/login"
            className="font-body text-[13px] text-white/50 underline-offset-4 transition-colors hover:text-teal hover:underline"
          >
            Voltar para o login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-10 space-y-5">
      <p className="font-body text-[14px] leading-relaxed text-white/55">
        Informe o e-mail do painel. Enviamos um link para você criar uma senha nova.
      </p>

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
          className={FIELD_CLASS}
        />
      </div>

      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      <Submit
        idle="Enviar link"
        busy="Enviando…"
        icon={<Mail size={16} strokeWidth={1.75} aria-hidden />}
      />

      <p className="text-center">
        <Link
          href="/admin/login"
          className="font-body text-[13px] text-white/50 underline-offset-4 transition-colors hover:text-teal hover:underline"
        >
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, formAction] = useActionState<NewPasswordState, FormData>(updatePassword, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-10 space-y-5">
      <p className="font-body text-[14px] leading-relaxed text-white/55">
        Escolha uma senha com pelo menos 10 caracteres.
      </p>

      <div>
        <label htmlFor="password" className={LABEL_CLASS}>
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="confirmation" className={LABEL_CLASS}>
          Repita a nova senha
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className={FIELD_CLASS}
        />
      </div>

      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      <Submit
        idle="Salvar senha"
        busy="Salvando…"
        icon={<KeyRound size={16} strokeWidth={1.75} aria-hidden />}
      />
    </form>
  );
}
