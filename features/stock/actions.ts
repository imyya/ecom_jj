"use server";
import prisma from "@/lib/prisma";
import { AdjustStockInput, AdjustStockSchema } from "./schema";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { StockMovementType } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export type AdjustStockResult =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<keyof AdjustStockInput, string[]>>;
    };

export const adjustStock = async (data: AdjustStockInput):Promise<AdjustStockResult> => {
  const admin = await requireAdmin(['SUPER_ADMIN','GESTIONNAIRE']);
  const parsed = AdjustStockSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Certains champs sont invalides",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { variantId, delta, reason,note } = parsed.data;

  //first take the corresponding variant
  try {
    const variant = await prisma.productVariant.findUnique({
      where: {
        id: parsed.data.variantId,
      },
      select:{
        id:true
      }
    });

    if (!variant) {
      return { ok: false, message: "Variante introuvable" };
    }
    //verifie si available stock >= newQuantity <=> (stock - reservedStock) >= newQuantity <=> stock - newQuantity >= reservedStock
    // pour pas faire une diminution qui ne couvre pas le stock reserve NB ici faut se souvenir que quantity sera negative elle mm
    //au cas ou on rajoute du stock ya pas de souci
    // c pareil que de faire stock + newQuantity >= reservedStock



    // const newStock = variant.stock + parsed.data.delta;
    // if (newStock < variant.reservedStock) {
    //   return {
    //     ok: false,
    //     message: "Le stock passe en dessous de la quantite reservee",
    //   };
    // }
    // on va ajouter au stock : stock + newquantity donc naturellement si newquantity est negatif on aura stock - x
    //pour le mouvement on regarde le signe de newQuantity si >0 <=> mouvement IN
    //si newQuantity < 0 <=> mouvement: OUT

    const applied = await prisma.$transaction(async(tx)=>{
        // Vérification + écriture en une seule opération :
      // la base ne modifie la ligne que si la condition est vraie à cet instant.

      const updatedRows = await tx.$executeRaw`
      UPDATE "ProductVariant"
      SET "stock" = "stock" + ${delta}
      WHERE "id" = ${variantId}
      AND "stock" + ${delta} >= "reservedStock"
      `

      if(updatedRows  === 0 ) return false

      await tx.stockMovement.create({
        data:{
              variantId,
        type:
          delta < 0 ? StockMovementType.OUT : StockMovementType.IN,
        quantity: Math.abs(delta),
        adminId: admin.id,
        reason: reason,
        note: note
        }
      })
      return true   
    })

     if (!applied) {
      return {
        ok: false,
        message: "Impossible : le stock passerait sous la quantité réservée par des commandes en attente",
      };
    }

    revalidatePath("/admin/stock");
    return {
      ok: true,
      message: "Stock mis a jour",
    };
  } catch (err) {
    console.error("[adjustStock]", err);
    return { ok: false, message: "Une erreur est survenue, réessaie" };
  }
};

  