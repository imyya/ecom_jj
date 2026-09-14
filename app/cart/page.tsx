"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import { useCartStore } from "@/features/cart/store";
import { formatPrice } from "@/lib/utils";

export default function PanierPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <p className="text-neutral-500">Votre panier est vide.</p>
        <Link href="/boutique" className="mt-4 inline-block font-medium text-primary hover:text-primary-hover">
          Voir la boutique
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-12 lg:py-16">
      <h1 className="mb-8 text-2xl font-bold font-heading text-slate-900">Mon panier</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 border-b border-neutral-200 pb-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="size-6 text-neutral-300" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-sm text-neutral-500">{item.variantLabel}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex size-7 items-center justify-center rounded-sm border border-neutral-300 disabled:opacity-40"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="flex size-7 items-center justify-center rounded-sm border border-neutral-300"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium text-primary">{formatPrice(item.unitPrice * item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      aria-label="Retirer du panier"
                      className="text-neutral-400 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex h-fit flex-col gap-4 rounded-lg border border-neutral-200 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Sous-total</span>
            <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-neutral-400">Frais de livraison calculés à l'étape suivante.</p>
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary font-bold text-slate-50 transition hover:bg-primary-hover"
          >
            Passer la commande
          </button>
        </div>
      </div>
    </Container>
  );
}
