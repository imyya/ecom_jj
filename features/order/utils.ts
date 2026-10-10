import type { OrderStatus } from "@/generated/prisma";

export const ORDER_STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  NOUVELLE_COMMANDE:   { label: "Nouvelle commande",   className: "bg-neutral-100 text-neutral-700" },
  PAIEMENT_EN_ATTENTE: { label: "Paiement en attente", className: "bg-amber-100 text-amber-800" },
  PAIEMENT_CONFIRME:   { label: "Paiement confirmé",   className: "bg-blue-100 text-blue-800" },
  EN_PREPARATION:      { label: "En préparation",      className: "bg-blue-100 text-blue-800" },
  PRETE_A_EXPEDIER:    { label: "Prête à expédier",    className: "bg-blue-100 text-blue-800" },
  EN_LIVRAISON:        { label: "En livraison",        className: "bg-violet-100 text-violet-800" },
  LIVREE:              { label: "Livrée",              className: "bg-green-100 text-green-800" },
  ANNULEE:             { label: "Annulée",             className: "bg-neutral-100 text-neutral-500" },
  ECHEC_LIVRAISON:     { label: "Échec de livraison",  className: "bg-red-100 text-red-800" },
  RETOURNEE:           { label: "Retournée",           className: "bg-red-100 text-red-800" },
};
