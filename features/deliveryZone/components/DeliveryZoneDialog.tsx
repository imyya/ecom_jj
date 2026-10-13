"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveDeliveryZone } from "../actions";
import type { DeliveryZoneResult } from "../schema";

type Props = {
  zone?: { id: string; name: string; fee: number };
};

export function DeliveryZoneDialog({ zone }: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<DeliveryZoneResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await saveDeliveryZone(zone?.id ?? null, formData);
      if (res.ok) {
        setOpen(false);
        return;
      }
      setResult(res);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResult(null);
      }}
    >
      {zone ? (
        <DialogTrigger
          title="Modifier"
          aria-label={`Modifier ${zone.name}`}
          className="inline-flex cursor-pointer items-center justify-center rounded-sm p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-slate-900"
        >
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="h-10 gap-2" />}>
          <Plus className="size-4" />
          Nouvelle zone
        </DialogTrigger>
      )}

      <DialogContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{zone ? `Modifier « ${zone.name} »` : "Nouvelle zone de livraison"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nom de la zone</Label>
            <Input
              id="name"
              name="name"
              defaultValue={zone?.name}
              placeholder="Ex : Dakar Plateau"
              aria-invalid={!!errors?.name}
              className="h-10"
            />
            {errors?.name && <p className="text-sm text-red-700">{errors.name[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fee">Tarif de livraison (FCFA)</Label>
            <Input
              id="fee"
              name="fee"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={zone?.fee}
              placeholder="Ex : 1500"
              aria-invalid={!!errors?.fee}
              className="h-10"
            />
            {errors?.fee && <p className="text-sm text-red-700">{errors.fee[0]}</p>}
          </div>

          {result && !result.ok && result.message && (
            <p className="text-sm text-red-700">{result.message}</p>
          )}

          <DialogFooter className="bg-white">
            <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Annuler
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
