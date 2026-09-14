"use client";
import Link from "next/link";
import React from "react";
import { ShoppingBagIcon } from "./icons";
import { useCartStore } from "@/features/cart/store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { formatPrice } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import Image from "next/image";

export default function CartIcon() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice + i.quantity, 0);

  // const itemCount = useCartStore((state)=>state.items.reduce((sum,i)=>sum+i.quantity,0))
  const badge = itemCount > 0 && (
    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
      {itemCount}
    </span>
  );
  return (
    <>
      {/* desktop*/}
      <Link
        href="/cart"
        aria-label="Panier"
        className="relative hidden text-neutral-600 hover:text-neutral-900 md:flex"
      >
        <ShoppingBagIcon />
        {badge}
      </Link>

      {/* mobile*/}

      <Dialog>
        <DialogTrigger
          aria-label="Panier"
          className="relative text-neutral-600 hover:text-neutral-900 md:hidden"
        >
          <ShoppingBagIcon />
          {badge}
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mon panier</DialogTitle>
          </DialogHeader>
           {items.length === 0 ? (
            <p className="text-sm text-neutral-500">Votre panier est vide.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="size-4 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">
                      {item.variantLabel} · x{item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm">
                <span className="text-neutral-600">Sous-total</span>
                <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
              </div>
            </div>
          )}

              <DialogFooter>
            <Link
              href="/panier"
              className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary font-bold text-slate-50 transition hover:bg-primary-hover"
            >
              Voir le panier
            </Link>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
    // <Link href="/cart" aria-label="Panier" className="relative text-neutral-600 hover:text-neutral-900">
    //     <ShoppingBagIcon/>
    //     {itemCount >0 && (
    //         <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
    //       {itemCount}
    //     </span>
    //     )}
    // </Link>
  );
}
