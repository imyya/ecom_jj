import { z } from "zod";

export const STOCK_ADJUSTMENT_REASONS = [
  "RECEPTION",
  "VENTE_PHYSIQUE",
  "CASSE",
  "INVENTAIRE",
  "RETOUR",
] as const;

export const AdjustStockSchema = z.object({
  variantId: z.string().min(1, "Variante manquante"),
  delta: z.coerce
    .number()
    .int("L'ajustement doit être un nombre entier")
    .refine((n) => n !== 0, "L'ajustement ne peut pas être de 0"),
  reason: z.enum(STOCK_ADJUSTMENT_REASONS, { error: "Choisis un motif" }),
  note: z.string().trim().max(500, "Note trop longue (500 caractères max)").optional(),
});

export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;
