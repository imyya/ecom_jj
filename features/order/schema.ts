import { z } from "zod";

export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  customer: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  deliveryZoneId: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryQuartier: z.string().optional(),
  deliveryNotes: z.string().optional(),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
