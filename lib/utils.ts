import { OrderItem } from "@/features/order/queries";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

export function hoursSince(order: OrderItem){
   return order.status === "PAIEMENT_EN_ATTENTE"
      ? Math.floor((Date.now() - order.createdAt.getTime()) / 3_600_000)
      : null;
}