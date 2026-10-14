// import { Period, PERIODS } from "@/features/dashboard/queries";
import { OrderItem } from "@/features/order/queries";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {  startOfDay,subDays } from "date-fns";

export const PERIODS = { "7d": 7, "30d": 30, "90d": 90 } as const;
export type Period = keyof typeof PERIODS;


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


export const isPeriod = (v: unknown): v is Period =>
  typeof v === "string" && Object.hasOwn(PERIODS, v);

export function periodStart(period: Period) {
  return startOfDay(subDays(new Date(), PERIODS[period] - 1));
}