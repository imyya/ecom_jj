"use server"
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


export const adjustStock = async (data: AdjustStockInput) => {
 const admin= await requireAdmin();
  const parsed = AdjustStockSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false,
        message: "Certains champs sont invalides",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,

        };
  }
  //first take the corresponding variant
  try {
    const variant = await prisma.productVariant.findUnique({
      where: {
        id: parsed.data.variantId,
      },
    });



    if(!variant) throw new Error("No variant found for this id")
    //verifie si available stock >= newQuantity <=> (stock - reservedStock) >= newQuantity <=> stock - newQuantity >= reservedStock
// pour pas faire une diminution qui ne couvre pas le stock reserve NB ici faut se souvenir que quantity sera negative elle mm
//au cas ou on rajoute du stock ya pas de souci 
// c pareil que de faire stock + newQuantity >= reservedStock

    const newStock = variant.stock + parsed.data.delta
    if (newStock < variant.reservedStock){
        return {
            ok:false,
            message:"Le stock passe en dessous de la quantite reservee"
        }
    }
    // on va ajouter au stock : stock + newquantity donc naturellement si newquantity est negatif on aura stock - x
    //pour le mouvement on regarde le signe de newQuantity si >0 <=> mouvement IN
    //si newQuantity < 0 <=> mouvement: OUT

    const updatedVariant = await prisma.productVariant.update({
        where:{
            id:parsed.data.variantId
        },
        data:{
            stock:{
                increment:parsed.data.delta
            },
        }
    })

    const stockMovement = await prisma.stockMovement.create({
        data:{
            variantId: variant.id,
            type: parsed.data.delta < 0 ? StockMovementType.OUT : StockMovementType.IN,
            quantity: Math.abs(parsed.data.delta),
            adminId: admin.id,
            reason: parsed.data.reason
        }
    })


    revalidatePath("admin/stock")
    return{
        ok:true,
        message:"Stock modifie avec succes",
        data:[updatedVariant]
    }

  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Une erreur est survenue",
    };
  }
};
