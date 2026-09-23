"use server";

import prisma from "@/lib/prisma";
import {
  AddProductImageInput,
  AddProductImageSchema,
  CreateProductInput,
  CreateProductSchema,
  RemoveProductImageInput,
  RemoveProductImageSchema,
  UpdateProductInput,
  UpdateProductInputSchema,
} from "./schema";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";

export async function searchProductSuggestions(query: string) {
  if (!query.trim()) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
    },
    take: 5,
  });
}

export async function createProduct(data: CreateProductInput) {
  const parsed = CreateProductSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten() };
  }
  const slug = slugify(data.name);
  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      basePrice: parsed.data.basePrice,
      promoPrice: parsed.data.promoPrice,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured,
      isNew: parsed.data.isNew,
      isBestSeller: parsed.data.isBestSeller,
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      variants: {
        create: parsed.data.variants,
      },
      images: {
        create: parsed.data.images,
      },
    },
  });
  return {
    ok: true,
    data: [product],
    message: "Product created successfully",
  };
}

export async function updateProduct(data: UpdateProductInput) {
  const parsed = UpdateProductInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten() };
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parsed.data.id,
      },
    });

    if (!product) throw new Error("Product not found");

    const updatedProduct = await prisma.product.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        categoryId: parsed.data.categoryId,
        basePrice: parsed.data.basePrice,
        promoPrice: parsed.data.promoPrice,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
        isNew: parsed.data.isNew,
        isBestSeller: parsed.data.isBestSeller,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
      },
    });

    return {
      ok: true,
      data: [updatedProduct],
      message: "Product updated successfully",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    if (!product) throw new Error("Product not found");

    const result = await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return {
      ok: true,
      data: [result],
      message: "Product deleted successfully",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }
}

export async function addProductImage(data: AddProductImageInput) {
  const parsed = AddProductImageSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten() };
  }

  try {
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: parsed.data.productId },
      orderBy: { position: "desc" }, // ca va prendre limage avec la plus grande positon si on a les positions [0,1,2] avec desc on aura [2,1,0] et avec first ca va prendre le 2 aka le plus grand
    });

    const nextPosition = (lastImage?.position ?? -1) + 1; //on prend la lastpositon et on incremente mais si yavait aucune image dou le ?? on aura -1 +1 => 0

    const image = await prisma.productImage.create({
      data: {
        productId: parsed.data.productId,
        url: parsed.data.url,
        altText: parsed.data.altText,
        position: nextPosition,
      },
    });

    revalidatePath("/admin/products");
    return { ok: true, data: [image], message: "image added successfully" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }
}

export async function removeProductImage(data: RemoveProductImageInput) {
  const parsed = RemoveProductImageSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten() };
  }
  try {
     await prisma.productImage.delete({
        where:{
            id:parsed.data.id
        }
    })
    revalidatePath("/admin/products");
    return { ok: true, message: "image deleted successfully" };

  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }
}
export type Suggestion = Awaited<
  ReturnType<typeof searchProductSuggestions>
>[number];
