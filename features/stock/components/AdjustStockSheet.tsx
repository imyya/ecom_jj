"use client";

import { useState } from "react";
import { AlertTriangle, Minus, Plus, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const REASONS = [
  { value: "RECEPTION", label: "Réception fournisseur" },
  { value: "VENTE_PHYSIQUE", label: "Vente en boutique" },
  { value: "CASSE", label: "Casse / perte" },
  { value: "INVENTAIRE", label: "Correction d'inventaire" },
  { value: "RETOUR", label: "Retour client" },
] as const;

type AdjustStockSheetProps = {
  variant: {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    stock: number;
    reservedStock: number;
    productName: string;
  };
};

export function AdjustStockSheet({ variant }: AdjustStockSheetProps) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");

  const newStock = variant.stock + delta;
  const available = variant.stock - variant.reservedStock;
  const newAvailable = newStock - variant.reservedStock;
  const goesBelowReserved = newStock < variant.reservedStock;
  const variantLabel = [variant.color, variant.size].filter(Boolean).join(" · ");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setDelta(0);
      setReason("");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        aria-label={`Ajuster le stock de ${variant.sku}`}
        title="Ajuster le stock"
        className="inline-flex items-center justify-center rounded-sm p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-slate-900 cursor-pointer"
      >
        <SlidersHorizontal className="size-4" />
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md bg-white">
        <form
          className="flex h-full flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO : brancher la server action ici
          }}
        >
          <SheetHeader className="border-b border-neutral-200">
            <SheetTitle className="text-lg font-semibold text-slate-900">
              {variant.productName}
            </SheetTitle>
            <SheetDescription className="flex flex-col gap-1">
              {variantLabel && <span className="text-neutral-700">{variantLabel}</span>}
              <span className="font-mono text-xs text-neutral-500">{variant.sku}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
            {/* État actuel */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Physique" value={variant.stock} />
              <Stat label="Réservé" value={variant.reservedStock} muted />
              <Stat label="Disponible" value={available} highlight />
            </div>

            {/* Quantité */}
            <div className="space-y-2">
              <Label htmlFor="delta">Ajustement</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Retirer une unité"
                  disabled={newStock <= 0}
                  onClick={() => setDelta((d) => d - 1)}
                >
                  <Minus />
                </Button>
                <input
                  id="delta"
                  name="delta"
                  type="number"
                  inputMode="numeric"
                  value={delta}
                  onChange={(e) => setDelta(Math.trunc(Number(e.target.value)) || 0)}
                  className="h-10 w-24 rounded-lg border border-neutral-300 text-center text-lg font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Ajouter une unité"
                  onClick={() => setDelta((d) => d + 1)}
                >
                  <Plus />
                </Button>
              </div>

              {delta !== 0 && (
                <p className="text-sm text-neutral-600">
                  Stock physique : {variant.stock} →{" "}
                  <span className={cn("font-semibold", delta > 0 ? "text-green-700" : "text-red-700")}>
                    {newStock}
                  </span>
                  {" "}· Disponible : {available} → {newAvailable}
                </p>
              )}

              {goesBelowReserved && (
                <p className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  Le stock passerait sous la quantité réservée ({variant.reservedStock}) par des
                  commandes en attente de paiement.
                </p>
              )}
            </div>

            {/* Motif */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif</Label>
              <select
                id="reason"
                name="reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                <option value="" disabled>
                  Choisir un motif…
                </option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">
                Note <span className="font-normal text-neutral-400">(optionnel)</span>
              </Label>
              <Textarea id="note" name="note" placeholder="Ex : carton abîmé à la livraison" />
            </div>

            <input type="hidden" name="variantId" value={variant.id} />
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t border-neutral-200">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Annuler
            </SheetClose>
            <Button type="submit" disabled={delta === 0 || !reason || goesBelowReserved}>
              Confirmer l'ajustement
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  label,
  value,
  muted,
  highlight,
}: {
  label: string;
  value: number;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 py-3",
        highlight && "border-neutral-900",
      )}
    >
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold tabular-nums",
          muted ? "text-neutral-400" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
