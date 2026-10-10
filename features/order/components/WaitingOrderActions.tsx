"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { cancelWaitingOrder, confirmWaitingOrder } from "../actions";

type Props = {
  orderId: string;
  orderNumber: string;
  total: number;
};

export function WaitingOrderActions({ orderId, orderNumber, total }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError("");
    startTransition(async () => {

      const result = await confirmWaitingOrder(orderId)
      if(result.ok){
        setConfirmOpen(false)
        return
      }
      setError(result.message)
    });
  };

  const handleCancel = () => {
    setError("");
    startTransition(async () => {
      // TODO : appeler l'action d'annulation avec orderId et cancelNote || undefined
      // si ok → setCancelOpen(false), sinon → setError(result.message)
      const result = await cancelWaitingOrder(orderId,cancelNote || undefined)
       if(result.ok){
        setCancelOpen(false)
        return
      }
      setError(result.message)

    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Confirmer le paiement */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setError("");
        }}
      >
        <DialogTrigger  render={<Button className="h-10 w-full cursor-pointer" />}>
          <CheckCircle2 />
          Confirmer le paiement
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le paiement ?</DialogTitle>
            <DialogDescription>
              Commande <span className="font-mono font-medium text-slate-900">{orderNumber}</span> —{" "}
              <span className="font-medium text-slate-900">{formatPrice(total)}</span>
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            Vérifie que le paiement a bien été reçu. Le stock des articles sera définitivement
            décrémenté.
          </p>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <DialogFooter className="bg-gray-200">
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Retour
            </DialogClose>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Confirmation…" : "Oui, paiement reçu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annuler la commande */}
      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) {
            setCancelNote("");
            setError("");
          }
        }}
      >
        <DialogTrigger
          render={
            <Button
              variant="outline"
              className="h-10 w-full text-red-700 hover:bg-red-50 hover:text-red-800 cursor-pointer"
            />
          }
        >
          <XCircle />
          Annuler la commande
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la commande ?</DialogTitle>
            <DialogDescription>
              Commande <span className="font-mono font-medium text-slate-900">{orderNumber}</span>
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            Les articles réservés seront remis en vente. Cette action est définitive.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancelNote">
              Motif <span className="font-normal text-neutral-400">(optionnel)</span>
            </Label>
            <Textarea
              id="cancelNote"
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              placeholder="Ex : le client ne répond plus sur WhatsApp"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <DialogFooter className="bg-gray-200">
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Retour
            </DialogClose>
            <Button
              onClick={handleCancel}
              disabled={isPending}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              {isPending ? "Annulation…" : "Oui, annuler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
