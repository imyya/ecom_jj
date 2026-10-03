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
import { Prisma, StockMovementType } from "@/generated/prisma";
import ProductActions from "./components/ProductActions";
import { requireAdmin } from "@/lib/auth";

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
 const admin = await requireAdmin()
  const parsed = CreateProductSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) };
  }
  try{
     const slug = slugify(data.name);
  const variants =  parsed.data.variants.map((v)=>({
          ...v,
           stockMovements: v.stock >0 ? {
            create:{type:StockMovementType.IN, quantity:v.stock, reason: "Stock initial", adminId:admin.id}
          }: undefined // pr gerer le cas ou on cree une variante avec stock 0 on veut pas creer un mouvement IN car techniquement rien nest entree

        }))

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
        create:variants
        
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

  }catch(err){
    if ((err as { code?: string }).code === "P2002") {
    return { ok: false, message: "Ce SKU existe déjà" };
  }
  return {
    ok: false,
    message: err instanceof Error ? err.message : "Une erreur est survenue",
  };
  }
 
}



export async function updateProduct(data: UpdateProductInput) {
  const admin = await requireAdmin()
  const parsed = UpdateProductInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      include: {
        images: true,
        // _count : nombre de lignes de commande par variante, sans les charger
        variants: { include: { _count: { select: { orderItems: true } } } },
      },
    });

    if (!product) throw new Error("Produit introuvable");

    // ================= IMAGES =================
    const imagesSent = parsed.data.images;
    type SentImage = NonNullable<typeof imagesSent>[number];

    const existingImages = new Map(product.images.map((img) => [img.id, img]));

    const imagesToBeCreated: SentImage[] = [];
    const imagesToBeUpdated: (SentImage & { dbId: string })[] = [];
    let imagesToBeDeleted: typeof product.images = [];
    const publicIdsToDestroy: string[] = [];

    if (imagesSent) {
      for (const img of imagesSent) {
        if (!img.dbId) {
          imagesToBeCreated.push(img);
        } else if (existingImages.has(img.dbId)) {
          imagesToBeUpdated.push({ ...img, dbId: img.dbId });

          // Image remplacée : l'ancien fichier Cloudinary devient inutile
          const old = existingImages.get(img.dbId)!;
          if (old.publicId && old.publicId !== img.publicId) {
            publicIdsToDestroy.push(old.publicId);
          }
        } else {
          throw new Error("Image invalide");
        }
      }

      // En base mais retirées par l'admin dans le formulaire → à supprimer
      const sentImageIds = new Set(imagesSent.map((img) => img.dbId).filter(Boolean));
      imagesToBeDeleted = product.images.filter((img) => !sentImageIds.has(img.id));

      for (const img of imagesToBeDeleted) {
        if (img.publicId) publicIdsToDestroy.push(img.publicId);
      }
    }

    // ================= VARIANTES =================
    const variantsSent = parsed.data.variants;
    type SentVariant = NonNullable<typeof variantsSent>[number];

    // Seules les variantes actives sont affichées dans le formulaire → on compare avec elles
    const activeVariants = product.variants.filter((v) => v.isActive);
    const existingVariants = new Map(activeVariants.map((v) => [v.id, v]));

    const variantsToBeCreated: SentVariant[] = [];
    const variantsToBeUpdated: (SentVariant & { dbId: string })[] = [];
    let variantsToHardDelete: typeof product.variants = [];
    let variantsToDeactivate: typeof product.variants = [];

    if (variantsSent) {
      for (const v of variantsSent) {
        if (!v.dbId) {
          variantsToBeCreated.push(v);
        } else if (existingVariants.has(v.dbId)) {
          variantsToBeUpdated.push({ ...v, dbId: v.dbId });
        } else {
          throw new Error("Variante invalide");
        }
      }

      // Actives en base mais retirées par l'admin dans le formulaire
      const sentVariantIds = new Set(variantsSent.map((v) => v.dbId).filter(Boolean));
      const removed = activeVariants.filter((v) => !sentVariantIds.has(v.id));

      // Jamais commandée → vraie suppression ; déjà commandée → désactivation
      variantsToHardDelete = removed.filter((v) => v._count.orderItems === 0);
      variantsToDeactivate = removed.filter((v) => v._count.orderItems > 0);
    }

    // ================= ÉCRITURE : tout ou rien =================
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: product.id },
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

      // --- Images ---
      if (imagesToBeDeleted.length > 0) {
        await tx.productImage.deleteMany({
          where: { id: { in: imagesToBeDeleted.map((img) => img.id) } },
        });
      }

      for (const { dbId, ...img } of imagesToBeUpdated) {
        await tx.productImage.update({ where: { id: dbId }, data: img });
      }

      if (imagesToBeCreated.length > 0) {
        await tx.productImage.createMany({
          data: imagesToBeCreated.map(({ dbId, ...img }) => ({
            ...img,
            productId: product.id,
          })),
        });
      }

      // --- Variantes ---
      // 1. Suppression réelle : mouvements d'abord, sinon la clé étrangère bloque
      if (variantsToHardDelete.length > 0) {
        const ids = variantsToHardDelete.map((v) => v.id);
        await tx.stockMovement.deleteMany({ where: { variantId: { in: ids } } });
        await tx.productVariant.deleteMany({ where: { id: { in: ids } } });
      }

      // 2. Désactivation : l'historique (commandes, mouvements) reste intact
      if (variantsToDeactivate.length > 0) {
        await tx.productVariant.updateMany({
          where: { id: { in: variantsToDeactivate.map((v) => v.id) } },
          data: { isActive: false },
        });
      }

      // 3. Mise à jour : `stock` est retiré par la déstructuration → jamais écrit
      for (const { dbId, stock, ...rest } of variantsToBeUpdated) {
        await tx.productVariant.update({ where: { id: dbId }, data: rest });
      }

      // 4. Création : stock initial + mouvement IN (create, pas createMany, à cause du mouvement imbriqué)
      for (const { dbId, ...v } of variantsToBeCreated) {
        await tx.productVariant.create({
          data: {
            ...v,
            productId: product.id,
            stockMovements:
              v.stock > 0
                ? {
                    create: {
                      type: StockMovementType.IN,
                      quantity: v.stock,
                      reason: "Stock initial",
                      adminId:admin.id
                    },
                  }
                : undefined,
          },
        });
      }

      return updated;
    });

    // ================= CLOUDINARY : seulement après le succès en base =================
    // allSettled : un destroy qui échoue ne fait pas échouer la mise à jour
    await Promise.allSettled(
      publicIdsToDestroy.map((id) => cloudinary.uploader.destroy(id)),
    );

    revalidatePath("/admin/product");
    revalidatePath(`/boutique/${product.slug}`);

    return { ok: true, data: [updatedProduct], message: "Produit mis à jour" };
  } catch (err) {
    // Contrainte @unique sur le SKU
    if ((err as { code?: string }).code === "P2002") {
    return { ok: false, message: "Ce SKU existe déjà" };
  }
  return {
    ok: false,
    message: err instanceof Error ? err.message : "Une erreur est survenue",
  };
  }
}





export async function setProductActive(id: string, isActive: boolean) {
    await requireAdmin()
  const parsed = z
    .object({ id: z.string().min(1), isActive: z.boolean() })
    .safeParse({ id, isActive });

  if (!parsed.success) {
    return { ok: false, message: "Données invalides" };
  }

  try {
    const product = await prisma.product.update({
      where: { id: parsed.data.id },
      data: { isActive: parsed.data.isActive },
    });

    revalidatePath("/admin/product");
    revalidatePath(`/boutique/${product.slug}`);

    return {
      ok: true,
      message: parsed.data.isActive ? "Produit réactivé" : "Produit désactivé",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Une erreur est survenue",
    };
  }
}



// updateVariant(variantId, { sku, color, size, priceOverride }) : modification sur place, sans stock.
// addVariant(productId, { sku, color, size, priceOverride, stock }) : création, avec un mouvement IN si stock > 0, comme dans createProduct.
// removeVariant(variantId) : compte les orderItems et les stockMovements. Si les deux valent 0, suppression. Sinon, isActive = false.

// export async function 

export async function addProductImage(data: AddProductImageInput) {
    await requireAdmin()

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
    await requireAdmin()

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
    await requireAdmin()

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
  await requireAdmin()
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

// . Les actions que je te suggère
// updateVariant(variantId, { sku, color, size, priceOverride }) : modification sur place, sans stock.
// addVariant(productId, { sku, color, size, priceOverride, stock }) : création, avec un mouvement IN si stock > 0, comme dans createProduct.
// removeVariant(variantId) : compte les orderItems et les stockMovements. Si les deux valent 0, suppression. Sinon, isActive = false.


// Ta fonction deleteProduct fait un prisma.product.delete. Le onDelete: Cascade de ProductVariant → Product va essayer de supprimer les variantes… et va échouer pour la même raison (mouvements et commandes). En plus, OrderItem → product n'a pas de cascade non plus. Dès qu'un produit a un stock initial ou une commande, sa suppression plantera. Et ta fonction supprime les images Cloudinary avant le delete : elles seront effacées alors que le produit, lui, reste en base.

// Pour un produit, la bonne pratique est la même : désactiver (isActive = false, le champ existe déjà sur Product) plutôt que supprimer, et ne supprimer vraiment qu'un produit sans aucun historique.
export type Suggestion = Awaited<
  ReturnType<typeof searchProductSuggestions>
>[number];
