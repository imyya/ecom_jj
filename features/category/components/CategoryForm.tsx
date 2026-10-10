"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryFormState } from "@/features/category/schema";

type Props = {
  action: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  parents: { id: string; name: string }[];
  defaultValues?: { name: string; description: string | null; parentId: string | null };
  hasChildren?: boolean;
  submitLabel: string;
};

export function CategoryForm({ action, parents, defaultValues, hasChildren = false, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          aria-invalid={!!errors?.name}
          className="h-10 bg-white"
        />
        {errors?.name && <p className="text-sm text-red-700">{errors.name[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="parentId">Catégorie parente</Label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={defaultValues?.parentId ?? ""}
          disabled={hasChildren}
          className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm disabled:bg-neutral-50 disabled:text-neutral-400"
        >
          <option value="">Aucune (catégorie principale)</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {hasChildren && (
          <p className="text-xs text-neutral-500">
            Cette catégorie a des sous-catégories, elle reste une catégorie principale.
          </p>
        )}
        {errors?.parentId && <p className="text-sm text-red-700">{errors.parentId[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">
          Description <span className="font-normal text-neutral-400">(optionnel)</span>
        </Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ""} />
        {errors?.description && <p className="text-sm text-red-700">{errors.description[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-red-700">{state.message}</p>}

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4">
        <Link href="/admin/category" className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
