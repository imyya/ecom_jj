import { z } from "zod";

const ProductVariantSchema = z.object({
  sku: z.string().min(1),
  color: z.string().optional(),
  size: z.string().optional(),
  priceOverride: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0),
});

const ProductImageSchema = z.object({
  url: z.string().min(1),
  altText: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
});

export const CreateProductSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    categoryId: z.string().min(1),
    basePrice: z.coerce.number().int().positive(),
    promoPrice: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    images: z.array(ProductImageSchema).min(1),
    variants: z.array(ProductVariantSchema).min(1),
  })
  .refine((data) => !data.promoPrice || data.promoPrice < data.basePrice, {
    message: "Le prix promo doit être inférieur au prix normal",
    path: ["promoPrice"],
  });

export type CreateProductInput = z.infer<typeof CreateProductSchema>;


export const UpdateProductInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  basePrice: z.coerce.number().int().positive().optional(),
  promoPrice: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const AddProductImageSchema = z.object({
  productId: z.string().min(1),
  url: z.string().min(1),
  altText: z.string().optional(),
});
export const RemoveProductImageSchema = z.object({
  id: z.string().min(1),
});





export type AddProductImageInput = z.infer<typeof AddProductImageSchema>;
export type RemoveProductImageInput = z.infer<typeof RemoveProductImageSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
