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
import { StockMovementType } from "@/generated/prisma";

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
  const variants =  parsed.data.variants.map((v)=>({
          ...v,
           stockMovements: v.stock >0 ? {
            create:{type:StockMovementType.IN, quantity:v.stock, reason: "Stock initial"}
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
}

// export async function updateProduct(data: UpdateProductInput) {
//   const parsed = UpdateProductInputSchema.safeParse(data);
//   if (!parsed.success) {
//     return { ok: false, errors: z.flattenError(parsed.error) };
//   }

//   try {
//     const product = await prisma.product.findUnique({
//       where: {
//         id: parsed.data.id,
//       },
//       include:{
//         images:true,
//         variants:true
//       }
//     });

//     if (!product) throw new Error("Product not found");

//     const imagesSent = parsed.data.images
//     const existingImagesById = new Map(product.images.map((img)=>[img.id, img]))//ceci cree un dictionnnaire avec l'id en key et limage en value et faire existingImagesId.get(unId) renvoie soit limage en base soit undefined si rien
//     const imagesToBeCreated = []
//     const imagesToBeUpdated = []
//     const imagesToBeDeleted = []
//     if(imagesSent){

//       for(const img of imagesSent){
//         if (img.dbId && (existingImagesById.has(img.dbId) )){
//           imagesToBeUpdated.push(img)
//         }
//         else{
//           imagesToBeCreated.push(img)
//         }
        
//       }
//     }

//     const productImages = product.images



//     const updatedProduct = await prisma.product.update({
//       where: {
//         id: parsed.data.id,
//       },
//       data: {
//         name: parsed.data.name,
//         description: parsed.data.description,
//         categoryId: parsed.data.categoryId,
//         basePrice: parsed.data.basePrice,
//         promoPrice: parsed.data.promoPrice,
//         isActive: parsed.data.isActive,
//         isFeatured: parsed.data.isFeatured,
//         isNew: parsed.data.isNew,
//         isBestSeller: parsed.data.isBestSeller,
//         seoTitle: parsed.data.seoTitle,
//         seoDescription: parsed.data.seoDescription,
//       },
//     });

//     return {
//       ok: true,
//       data: [updatedProduct],
//       message: "Product updated successfully",
//     };
//   } catch (err) {
//     return {
//       ok: false,
//       message: err instanceof Error ? err.message : "error occured",
//     };
//   }
// }


export async function updateProduct(data: UpdateProductInput) {
  const parsed = UpdateProductInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      include: { images: true },
    });

    if (!product) throw new Error("Produit introuvable");

    // ---------- 1. Calcul : quoi créer / mettre à jour / supprimer ----------
    const imagesSent = parsed.data.images;
    type SentImage = NonNullable<typeof imagesSent>[number];

    const existingImages = new Map(product.images.map((img) => [img.id, img]));

    const imagesToBeCreated: SentImage[] = [];
    const imagesToBeUpdated: (SentImage & { dbId: string })[] = [];//le type veut dire une images envoyees dont on est sur qu'elle a un dbId
    let imagesToBeDeleted: typeof product.images = [];
    const publicIdsToDestroy: string[] = [];

    if (imagesSent) {
      for (const img of imagesSent) {
        if (!img.dbId) {
          imagesToBeCreated.push(img);
        } else if (existingImages.has(img.dbId)) {
          imagesToBeUpdated.push({ ...img, dbId: img.dbId });//on a du faire dbId:img.dbId malgre le fait k ...img spread le dbId c a cause de ts et aussi le dbId:img.dbId va ecraser le dbId du spread

          // Image remplacée : l'ancien fichier Cloudinary devient inutile
          const old = existingImages.get(img.dbId)!;
          if (old.publicId && old.publicId !== img.publicId) {
            publicIdsToDestroy.push(old.publicId);
          }
        } else {
          // dbId qui n'appartient pas à ce produit => requete anormale
          throw new Error("Image invalide");
        }
      }

      // En base mais plus dans le formulaire => a supprimer
      const sentIds = new Set(imagesSent.map((img) => img.dbId).filter(Boolean));//ici filter(Boolean) permet denlever les undefined
      imagesToBeDeleted = product.images.filter((img) => !sentIds.has(img.id));

      for (const img of imagesToBeDeleted) {
        if (img.publicId) publicIdsToDestroy.push(img.publicId);
      }
    }

    // ---------- 2. Écriture en base : tout ou rien ----------
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

      if (imagesToBeDeleted.length > 0) {
        await tx.productImage.deleteMany({
          where: { id: { in: imagesToBeDeleted.map((img) => img.id) } },
        });
      }

      for (const { dbId, ...img } of imagesToBeUpdated) {
        await tx.productImage.update({
          where: { id: dbId },
          data: img,
        });
      }

      if (imagesToBeCreated.length > 0) {
        await tx.productImage.createMany({
          data: imagesToBeCreated.map(({ dbId, ...img }) => ({
            ...img,
            productId: product.id,
          })),
        });
      }

      return updated;
    });

    // ---------- 3. Cloudinary : seulement APRÈS le succès en base ----------
    // allSettled : un destroy qui échoue ne fait pas échouer la mise à jour
    await Promise.allSettled(
      publicIdsToDestroy.map((id) => cloudinary.uploader.destroy(id)),
    );

    revalidatePath("/admin/product");
    revalidatePath(`/boutique/${product.slug}`);

    return {
      ok: true,
      data: [updatedProduct],
      message: "Produit mis à jour",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Une erreur est survenue",
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


// updateVariant(variantId, { sku, color, size, priceOverride }) : modification sur place, sans stock.
// addVariant(productId, { sku, color, size, priceOverride, stock }) : création, avec un mouvement IN si stock > 0, comme dans createProduct.
// removeVariant(variantId) : compte les orderItems et les stockMovements. Si les deux valent 0, suppression. Sinon, isActive = false.

// export async function 

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

// . Les actions que je te suggère
// updateVariant(variantId, { sku, color, size, priceOverride }) : modification sur place, sans stock.
// addVariant(productId, { sku, color, size, priceOverride, stock }) : création, avec un mouvement IN si stock > 0, comme dans createProduct.
// removeVariant(variantId) : compte les orderItems et les stockMovements. Si les deux valent 0, suppression. Sinon, isActive = false.


// Ta fonction deleteProduct fait un prisma.product.delete. Le onDelete: Cascade de ProductVariant → Product va essayer de supprimer les variantes… et va échouer pour la même raison (mouvements et commandes). En plus, OrderItem → product n'a pas de cascade non plus. Dès qu'un produit a un stock initial ou une commande, sa suppression plantera. Et ta fonction supprime les images Cloudinary avant le delete : elles seront effacées alors que le produit, lui, reste en base.

// Pour un produit, la bonne pratique est la même : désactiver (isActive = false, le champ existe déjà sur Product) plutôt que supprimer, et ne supprimer vraiment qu'un produit sans aucun historique.
export type Suggestion = Awaited<
  ReturnType<typeof searchProductSuggestions>
>[number];
