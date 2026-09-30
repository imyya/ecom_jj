"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { setProductActive } from "@/features/product/actions";
import { EyeOff, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  isActive: boolean;
};

const ToggleProductStatus = ({ id, name, isActive }: Props) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await setProductActive(id, !isActive);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
    });
  };

  // Réactiver : sans danger → clic direct, pas de confirmation
  if (!isActive) {
    return (
      <button
  type="button"
  onClick={toggle}
  disabled={isPending}
  title="Réactiver"
  aria-label={`Réactiver ${name}`}
  className="inline-flex cursor-pointer items-center justify-center rounded-sm p-1.5 text-grey-700 hover:bg-green-50 disabled:opacity-50"
>
  <RotateCcw className={cn("size-4", isPending && "animate-spin")} />
</button>

    );
  }

  // Désactiver : on demande confirmation
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
  title="Désactiver"
  aria-label={`Désactiver ${name}`}
  className="inline-flex cursor-pointer items-center justify-center rounded-sm p-1.5 text-red-600 hover:bg-red-50"
>
  <EyeOff className="size-4" />
</DialogTrigger>


      <DialogContent>
        <DialogHeader>
          <DialogTitle>Désactiver « {name} » ?</DialogTitle>
          <DialogDescription>
            Le produit ne sera plus visible dans la boutique et ne pourra plus
            être commandé. Vous pourrez le réactiver à tout moment.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="bg-slate-50">
          <DialogClose className="cursor-pointer rounded-sm border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">
            Annuler
          </DialogClose>
          <button
            type="button"
            onClick={toggle}
            disabled={isPending}
            className="cursor-pointer rounded-sm bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Désactivation..." : "Désactiver"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleProductStatus;
