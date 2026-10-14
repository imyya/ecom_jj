import "server-only";
import { eachDayOfInterval, format, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";

import { ListLowStockVariants, ListOutOfStockVariants } from "@/features/stock/queries";

// Ventes par jour, avec les jours sans vente à 0
export async function getSalesByDay(from: Date) {
  const orders = await prisma.order.findMany({
    where: { status: { in: SALE_STATUSES }, createdAt: { gte: from } },
    select: { createdAt: true, total: true },
  });

  const totals = new Map<string, number>();
  for (const o of orders) {
    const key = format(o.createdAt, "yyyy-MM-dd");
    totals.set(key, (totals.get(key) ?? 0) + o.total);
  }

  return eachDayOfInterval({ start: from, end: new Date() }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return {
      label: format(day, "d MMM", { locale: fr }),
      amount: totals.get(key) ?? 0,
    };
  });
}

export async function getTopProducts(from: Date, limit = 5) {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: SALE_STATUSES }, createdAt: { gte: from } } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    select: { id: true, name: true },
  });
  const names = new Map(products.map((p) => [p.id, p.name]));

  return rows.map((r) => ({
    name: names.get(r.productId) ?? "Produit supprimé",
    quantity: r._sum.quantity ?? 0,
    revenue: r._sum.lineTotal ?? 0,
  }));
}

export async function getTopCategories(from: Date, limit = 5) {
  return prisma.$queryRaw<{ name: string; quantity: number; revenue: number }[]>`
    SELECT c."name" AS name,
           SUM(oi."quantity")::int AS quantity,
           SUM(oi."lineTotal")::int AS revenue
    FROM "OrderItem" oi
    JOIN "Order" o ON o."id" = oi."orderId"
    JOIN "Product" p ON p."id" = oi."productId"
    JOIN "Category" c ON c."id" = p."categoryId"
    WHERE o."status"::text = ANY(${SALE_STATUSES})
      AND o."createdAt" >= ${from}
    GROUP BY c."id", c."name"
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;
}


// Une commande compte comme vente une fois le paiement confirmé
export const SALE_STATUSES: OrderStatus[] = [
  OrderStatus.PAIEMENT_CONFIRME,
  OrderStatus.EN_PREPARATION,
  OrderStatus.PRETE_A_EXPEDIER,
  OrderStatus.EN_LIVRAISON,
  OrderStatus.LIVREE,
];

async function salesSince(from: Date) {
  const result = await prisma.order.aggregate({
    where: { status: { in: SALE_STATUSES }, createdAt: { gte: from } },
    _sum: { total: true },
    _count: true,
  });
  return { amount: result._sum.total ?? 0, orders: result._count };
}

export async function getDashboardKpis() {
  const now = new Date();

  const [today, week, month, byStatus, customers, lowStock, outOfStock] = await Promise.all([
    salesSince(startOfDay(now)),
    salesSince(startOfWeek(now, { weekStartsOn: 1 })),
    salesSince(startOfMonth(now)),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.customer.count(),
    ListLowStockVariants(),
    ListOutOfStockVariants(),
  ]);

  const ordersByStatus = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count._all]),
  ) as Partial<Record<OrderStatus, number>>;

  return { today, week, month, ordersByStatus, customers, lowStock, outOfStock };
}
