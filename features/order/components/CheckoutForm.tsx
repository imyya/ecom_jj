'use client'
import { useCartStore } from "@/features/cart/store";
import { DeliveryZone } from "@/generated/prisma";
import React, { useState } from "react";
import createOrder from "../actions";
import { formatPrice } from "@/lib/utils";

const CheckoutForm = ({deliveryZones}: { deliveryZones: DeliveryZone[] }) => {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrder({
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      customer: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        phone: formData.get("phone") as string,
        email: (formData.get("email") as string) || undefined,
      },
      deliveryZoneId: formData.get("deliveryZoneId") as string,
      deliveryAddress: formData.get("deliveryAddress") as string,
      deliveryQuartier: formData.get("deliveryQuartier") as string,
      deliveryNotes: (formData.get("deliveryNotes") as string) || undefined,
    });

    if(!result.ok){
        setIsSubmitting(false)
        setError(result.message ?? "Une erreur est surevenue");
        return
    }

    let message = "Bonjour, je confirme ma commande :\n"

     for (const i of items) {
      message += `\n${i.productName} (${i.variantLabel}) x${i.quantity}`;
    }
    message += `\n\n*Total : ${formatPrice(subtotal)}*\nCommande n°${result.data!.orderNumber}`;

    clearCart();
    window.location.href = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  if (items.length === 0) {
    return <p className="text-neutral-500">Votre panier est vide.</p>;
  }

  return(
  <form
    onSubmit={handleSubmit}
    className="grid grid-cols-1 gap-8 lg:grid-cols-3"
  >
    <div className="flex flex-col gap-4 lg:col-span-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-slate-900"
          >
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-slate-900"
          >
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-slate-900">
          Téléphone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-900">
          Email (optionnel)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="deliveryZoneId"
          className="text-sm font-medium text-slate-900"
        >
          Zone de livraison
        </label>
        <select
          id="deliveryZoneId"
          name="deliveryZoneId"
          required
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Choisir une zone</option>
          {deliveryZones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="deliveryQuartier"
          className="text-sm font-medium text-slate-900"
        >
          Quartier
        </label>
        <input
          id="deliveryQuartier"
          name="deliveryQuartier"
          required
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="deliveryAddress"
          className="text-sm font-medium text-slate-900"
        >
          Adresse précise
        </label>
        <input
          id="deliveryAddress"
          name="deliveryAddress"
          required
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="deliveryNotes"
          className="text-sm font-medium text-slate-900"
        >
          Notes (optionnel)
        </label>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          rows={3}
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
    <div className="flex h-fit flex-col gap-4 rounded-lg border border-neutral-200 p-6">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Sous-total</span>
        <span className="font-medium text-slate-900">
          {formatPrice(subtotal)}
        </span>
      </div>
      <p className="text-xs text-neutral-400">
        Frais de livraison à confirmer avec Jiiro.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary font-bold text-slate-50 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Création de la commande..." : "Confirmer la commande"}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  </form>);
};

export default CheckoutForm;
