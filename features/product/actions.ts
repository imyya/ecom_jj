"use server";

import prisma from "@/lib/prisma";

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
export type Suggestion = Awaited<ReturnType<typeof searchProductSuggestions>>[number]

