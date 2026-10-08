import { Prisma, StockMovementType } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

const whereBuilder = (params: {
  variantId?: string;
  type?: StockMovementType;
  adminId?: string;
  from?: Date;
  to?: Date;
  search?: string;
}): Prisma.StockMovementWhereInput => {
  return {
    ...(params.variantId ? { variant: { id: params.variantId } } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.adminId ? { adminId: params.adminId } : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lt: params.to } : {}),
          },
        }
      : {}),
    // ...(params.to ? { createdAt: { lt: params.to } } : {}),
  ...(params.search ? 
    {
    OR:
      [
      {
        variant: {
          sku: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      },
      { variant:
        {product: {
          name:{
            contains: params.search,
            mode: "insensitive",

          }
        }}
      },
    
  ]}:{})
  };
};
export const ListStockMovements = async (params: {
  variantId?: string;
  type?: StockMovementType;
  adminId?: string;
  from?: Date;
  to?: Date;
  search?: string;
  pageNumber?: number;
}) => {
  return await prisma.stockMovement.findMany({
    where: whereBuilder(params),
    include: {
      variant: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      admin: {
        select: {
          name: true,
        },
      },
    },
    skip: params?.pageNumber ? (params.pageNumber - 1) * pageSize : 0,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
};

export const countListStockMovement = async (params: {
  variantId?: string;
  type?: StockMovementType;
  adminId?: string;
  search?: string;
  from?: Date;
  to?: Date;
}) => {
  return await prisma.stockMovement.count({
    where: whereBuilder(params),
  });
};

export const findVariant =async (variantId:string)=>{
  return await prisma.productVariant.findUnique({
    where:{
      id:variantId
    },
    include:{
      product:{
        select:{
          name:true
        }
      }
    }
  })
}
export type StockMovementItem = Awaited<
  ReturnType<typeof ListStockMovements>
>[number];
