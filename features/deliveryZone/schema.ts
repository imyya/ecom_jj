import { z } from "zod";

export const DeliveryZoneSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(60, "60 caractères maximum"),
  fee: z
    .string()
    .trim()
    .min(1, "Le tarif est obligatoire")
    .transform((v)=>Number(v))
    .pipe(z.number()
        .int("Le tarif doit être un nombre entier")
        .min(0, "Le tarif ne peut pas être négatif")
        .max(100_000, "Tarif trop élevé"),
    ),
});

export type DeliveryZoneInput = z.infer<typeof DeliveryZoneSchema>;

export type DeliveryZoneResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Partial<Record<keyof DeliveryZoneInput, string[]>> };
