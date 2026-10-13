import "server-only";
import prisma from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma";

export class OrderError extends Error {}

export async function cancelOrderTx(tx: Prisma.TransactionClient, orderId: string, note?: string) {
  const { count } = await tx.order.updateMany({
    where: { id: orderId, status: OrderStatus.PAIEMENT_EN_ATTENTE },
    data: { status: OrderStatus.ANNULEE },
  });
  if (count === 0) throw new OrderError("Cette commande n'est plus en attente de paiement");

  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { variantId: true, quantity: true },
  });
  for (const item of items) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { reservedStock: { decrement: item.quantity } },
    });
  }
  await tx.orderStatusHistory.create({
    data: { orderId, status: OrderStatus.ANNULEE, note },
  });
}

const EXPIRATION_HOURS = 72;

export async function cancelExpiredOrders() {
  const limit = new Date(Date.now() - EXPIRATION_HOURS * 3_600_000);
  const expired = await prisma.order.findMany({
    where: { status: OrderStatus.PAIEMENT_EN_ATTENTE, createdAt: { lt: limit } },
    select: { id: true },
  });

  let cancelled = 0;
  for (const order of expired) {
    try {
      await prisma.$transaction((tx) =>
        cancelOrderTx(tx, order.id, `Annulée automatiquement : sans paiement après ${EXPIRATION_HOURS}h`),
      );
      cancelled++;
    } catch (err) {
      if (!(err instanceof OrderError)) console.error("[cancelExpiredOrders]", order.id, err);
    }
  }
  return cancelled;
}
