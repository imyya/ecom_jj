"use client";

import { useActionState } from "react";
import { login } from "@/features/auth/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.error && (
        <p className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email ?? ""}
          className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-sm bg-primary px-4 py-2 text-sm font-bold text-slate-50 hover:bg-primary-hover disabled:opacity-50"
      >
        {isPending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
