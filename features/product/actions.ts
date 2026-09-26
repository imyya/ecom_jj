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
import cloudinary from "@/lib/cloudinary";
import { z } from "zod";
import { ok } from "assert";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const CLOUDINARY_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "";
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
    return { ok: false, errors: z.flattenError(parsed.error) };
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
    return { ok: false, errors: z.flattenError(parsed.error) };
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
      include: {
        images: true,
      },
    });

    if (!product) throw new Error("Product not found");

    for (const image of product.images) {
      // const img = await prisma.productImage.findUnique({
      //   where: {
      //     id: image.id,
      //   },
      // });
      if (image?.publicId) await cloudinary.uploader.destroy(image.publicId);
    }

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
    return { ok: false, errors: z.flattenError(parsed.error) };
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
    return { ok: false, errors: z.flattenError(parsed.error) };
  }
  try {
    const image = await prisma.productImage.findUnique({
      where: {
        id: parsed.data.id,
      },
    });
    if (!image) throw new Error("no image found for this id");
    if (image.publicId) await cloudinary.uploader.destroy(image.publicId);

    await prisma.productImage.delete({
      where: {
        id: parsed.data.id,
      },
    });
    revalidatePath("/admin/products");
    return { ok: true, message: "image deleted successfully" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }
}

export async function deleteUploadedImage(publicId: string) {
  const parsed= z.string().min(1).safeParse(publicId)
   if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) };
  }
  try {
    // we should verify it's admin first
    if(!CLOUDINARY_UPLOAD_FOLDER) return {ok:false, message:"nom de dossier non configure "}
    if(!parsed.data.startsWith(`${CLOUDINARY_UPLOAD_FOLDER}/`)) return {ok:false, message:"image inautorisee"}
    const img = await prisma.productImage.findFirst({
      where: {
        publicId: parsed.data,
      },
    });
    if (img)
      throw new Error(
        "You can't delete an already saved image only uploaded unsave ones",
      );
    const res = await cloudinary.uploader.destroy(parsed.data);
    //cloudinary could send {result:"ok"} or if theres no corresponding publicId itd send {result:"not found"}
    // if(res.result==="ok" ) return { 
    //   ok:true,
    //   message:"Uploaded image deleted from Cloudinary"
    // }
    return { //since {result:"not found"} ns arrage pck ca veut dire aucun enregistrement dans cloudinary ne correspond donc on peut envoyer ok true
      ok:true,
      message:"operation done"
    }

  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }
}

export const generateCloudinarySignature = async () => {
  // we should verify it's admin first

  const timestamp = Math.round(Date.now() / 1000);
  const folder = CLOUDINARY_UPLOAD_FOLDER;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    CLOUDINARY_API_SECRET,
  );
  return {
    signature,
    timestamp,
    folder,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
};

// generateCloudinarySignature est une Server Action,
// donc un endpoint public : n'importe qui peut l'appeler et
// uploader sur ton compte Cloudinary. Pour l'instant ce n'est
//  pas grave, parce que ton auth admin
//   n'existe pas encore (je n'ai vu
//   ni middleware.ts ni proxy.ts).
//    Mais note-le : quand tu feras le module 1 (auth admin),
//  cette action devra vérifier la session admin, comme createProduct d'ailleurs

export type Suggestion = Awaited<
  ReturnType<typeof searchProductSuggestions>
>[number];
