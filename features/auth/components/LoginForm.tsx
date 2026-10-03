"use client";

import { useActionState, useRef, useState } from "react";
import { X } from "lucide-react";
import { login } from "@/features/auth/actions";

type ClearableInputProps = {
  id: string;
  name: string;
  type: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
};

function ClearableInput({ id, name, type, label, autoComplete, value, onChange }: ClearableInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}   
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-sm border border-neutral-300 py-2 pl-3 pr-9 text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label={`Effacer ${label.toLowerCase()}`}
            title="Effacer"
            className="absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center text-neutral-400 hover:text-neutral-700"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state?.error && (
        <p className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <ClearableInput
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />

      <ClearableInput
        id="password"
        name="password"
        type="password"
        label="Mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-sm bg-primary px-4 py-3 text-md font-bold text-slate-50 hover:bg-primary-hover disabled:opacity-50"
      >
        {isPending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
