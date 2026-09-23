import "server-only";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

function buildWhere(params?: {
  categorySlug?: string;
  search?: string;
  isActive?: boolean;
  size?: string;
  color?: string;
 priceMin?: number;
  priceMax?: number
}): Prisma.ProductWhereInput {
  return {
    //isActive: true,
    ...(params?.categorySlug
      ? { category: { slug: params.categorySlug } }
      : {}),
    ...(params?.search
      ? { name: { contains: params.search, mode: "insensitive" } }
      : {}),
    ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    ...(params?.priceMin !== undefined || params?.priceMax !== undefined
      ? {
          basePrice: {
            ...(params?.priceMin !== undefined ? { gte: params.priceMin } : {}),
            ...(params?.priceMax !== undefined ? { lte: params.priceMax } : {}),
          },
        }
      : {}),
    // ...(params?.size ? { variants: { some: { size: params.size } } } : {}),
    // ...(params?.color ? { variants: { some: { color: params.color } } } : {}),
    ...(params?.size && params.color ? {variants:{some:{size:params.size, color:params.color}}} //si le filtre est fait simultanement sur les size et couleur sinon si cest separement.  
    : params?.size ? {variants:{some:{size:params?.size}}}
    :params?.color ? {variants:{some:{color:params?.color}}}
     :{}
)
  };
}
export const listProducts = async (params?: {
  categorySlug?: string;
  pageNumber?: number;
  search?: string;
  isActive?: boolean;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
}) => {
  const products = await prisma.product.findMany({
    where: buildWhere(params),
    //  {
    // isActive:true,
    // ...(params?.categorySlug? {category:{slug:params.categorySlug}} :{})// le spread ... spread un objet dans lobjet englobant which is lobject where ici et si pas de categ-slug param un objet vide sera spread dans where{}
    // }
    include: {
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
      category: true,
    },
    skip: params?.pageNumber ? (params?.pageNumber - 1) * 5 : 0,
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });
  return products;
};

export const countTotalProducts = async (params?: {
  categorySlug?: string;
  search?: string;
  isActive?: boolean;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
}) => {
  return await prisma.product.count({
    where: buildWhere(params),
  });
};

export const getProductBySlug = async (params: { slug: string }) => {
  return await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
      category: true,
      variants: true,
    },
  });
};

export const listBestSellers = async () => {
  return await prisma.product.findMany({
    where: {
      isBestSeller: true,
      isActive:true
    },
    include: {
      images: {
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });
};

export type ProductListItem = Awaited<ReturnType<typeof listProducts>>[number];
export type ProductBySlug = Awaited<ReturnType<typeof getProductBySlug>>;
export type BestSellersListItem = Awaited<
  ReturnType<typeof listBestSellers>
>[number];
