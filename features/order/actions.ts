"use server";

import { CreateOrderInput, CreateOrderSchema } from "@/features/order/schema";
import prisma from "@/lib/prisma";
import { z } from "zod";

import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";


type CreateOrderResult =
  | { ok: true; message: string; data: { orderNumber: string; total: number } }
  | { ok: false; message: string };

class OrderError extends Error {}

async function generateOrderNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();

  const count = await tx.order.count({
    where: {
      orderNumber: { startsWith: `JIIRO-${year}-` },
    },
  });

  const sequence = String(count + 1).padStart(6, "0");
  return `JIIRO-${year}-${sequence}`;
}

const createOrder = async (order: CreateOrderInput):Promise<CreateOrderResult> => {
  const parsed = CreateOrderSchema.safeParse(order);
  if (!parsed.success) {
    // return { ok: false, errors: z.flattenError(parsed.error) };
    console.error("[CreateOrder]",parsed.error)
    return { ok: false, message: "Certains champs sont invalides" };

  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let subTotal = 0;
      const customer = parsed.data.customer?.phone
        ? await tx.customer.findUnique({
            where: {
              phone: parsed.data.customer?.phone,
            },
          })
        : null;

      const items = parsed.data.items;
      const orderItems = [];
      for (const i of items) {
        const item = await tx.productVariant.findUnique({
          where: {
            id: i.variantId,
          },
          include: {
            product: true,
          },
        });
        if (!item || !item.isActive || !item.product.isActive) {
          throw new OrderError(
            `Un article de votre panier n'est plus disponible`,
          );
        }

        if (item.stock - item.reservedStock < i.quantity) {
          throw new OrderError(`Stock insuffisant pour ${item.product.name}`); // on a besoin de throw pour que la transactionfasse un rollback
        }
        const unitPrice =
          item.priceOverride ??
          item.product.promoPrice ??
          item.product.basePrice;
        subTotal += unitPrice * i.quantity;
        orderItems.push({
          productId: item.productId,
          variantId: item.id,
          productName: item.product.name,
          variantLabel: [item.color, item.size].filter(Boolean).join("/"),
          sku: item.sku,
          unitPrice,
          quantity: i.quantity,
          lineTotal: unitPrice * i.quantity,
        });
        // await tx.productVariant.update({
        //     where:{id: i.variantId},
        //     data:{reservedStock:{increment: i.quantity}}
        // })
        const reserved = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedStock" = "reservedStock" + ${i.quantity}
        WHERE "id" = ${i.variantId}
        AND "stock" - "reservedStock" >= ${i.quantity}
        `;
        if (reserved === 0)
          throw new OrderError(`Stock insuffisant pour ${item.product.name}`);
      }
      const orderNumber = await generateOrderNumber(tx);
      return await tx.order.create({
        data: {
          guestEmail: parsed.data.customer?.email, //si customer est absent ca donne undefined et prisma ignore undefined donc la colonne rest a null
          guestFirstName: parsed.data.customer?.firstName,
          guestLastName: parsed.data.customer?.lastName,
          guestPhone: parsed.data.customer?.phone,
          deliveryAddress: parsed.data.deliveryAddress,
          deliveryZoneId: parsed.data.deliveryZoneId,
          deliveryQuartier: parsed.data.deliveryQuartier,
          customerId: customer?.id ?? null,
          subtotal: subTotal,
          total: subTotal,
          statusHistory: {
            create: {
              status: OrderStatus.PAIEMENT_EN_ATTENTE,
              note: "Commande créée",
            },
          },
          orderNumber: orderNumber,
          items: { create: orderItems },
        },
      });
    });
    return {
      ok: true,
      data: {"orderNumber":result.orderNumber,
        "total":result.total},
      message: "Order added successfully",
    };
  } catch (err) {
    if (err instanceof OrderError)
      return {
        ok: false,
        message: err.message,
      };

    console.error("[createOrder]", err);
    return { ok: false, message: "Une erreur est survenue" };
  }
};

export const confirmWaitingOrder = async (orderId: string) => {
  // on recupere order -> orderItem -> quantity
  // on fait order -> orderItem -> productVariant -> reserved - quantity
  // on fait productVariant -> stock - quantity
  await requireAdmin(["SUPER_ADMIN", "GESTIONNAIRE"]);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: {
            select: {
              variantId: true,
              quantity: true,
            },
            // include: {
            //   variant: {
            //     select: { id: true },
            //   },
            // },
          },
        },
      });
      if (!order) throw new OrderError("Commande introuvable");

      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: OrderStatus.PAIEMENT_EN_ATTENTE },
        data: {
          status: OrderStatus.PAIEMENT_CONFIRME,
        },
      });
      //used updatedManay bc it returns count contrairmnt a Update. et on veut faire le check k le status est tjrs en PAIEMENT_EN_ATTENTE et le changer dans la mm operatioon
      if (count === 0)
        throw new OrderError(
          "Cette commande n'est plus en attente de paiement",
        );

      const data = order.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));

      for (const v of data) {
        await tx.productVariant.update({
          where: {
            id: v.variantId,
          },
          data: {
            reservedStock: { decrement: v.quantity },
            stock: { decrement: v.quantity },
          },
        });
      }
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PAIEMENT_CONFIRME,
        },
      });
    });

    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/stock`);

    return {
      ok: true,
      data: [],
      message: "Paiement confirmé",
    };
  } catch (err) {
    if (err instanceof OrderError)
      return {
        ok: false,
        message: err.message,
      };

    console.error("[confirmWaitingOrder]", err);
    return { ok: false, message: "Une erreur est survenue" };
  }
};


export const cancelWaitingOrder=async(orderId:string, note?:string)=>{
    await requireAdmin(["SUPER_ADMIN","GESTIONNAIRE"])
try{
    const result = await prisma.$transaction(async(tx)=>{
        const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: {
            select: {
              variantId: true,
              quantity: true,
            },
          },
        },
      });
      if (!order) throw new OrderError("Order introuvable");

            const { count } = await tx.order.updateMany({
        where: { id: orderId, status: OrderStatus.PAIEMENT_EN_ATTENTE },
        data: {
          status: OrderStatus.ANNULEE,
        },
      });
      if (count === 0)
        throw new OrderError(
          "Cette commande n'est plus en attente de paiement",
        );

              const data = order.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));

      for (const v of data) {
        await tx.productVariant.update({
          where: {
            id: v.variantId,
          },
          data: {
            reservedStock: { decrement: v.quantity },
          },
        });
      }
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.ANNULEE,
          note:note
        },
      })
    })

    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/stock`);

    return {
      ok: true,
      data: [],
      message: "Commande annulée",
    };


}catch(err){
     if (err instanceof OrderError)
      return {
        ok: false,
        message: err.message,
      };

    console.error("[cancelWaitingOrder]", err);
    return { ok: false, message: "Une erreur est survenue" };
}
}
export default createOrder;
