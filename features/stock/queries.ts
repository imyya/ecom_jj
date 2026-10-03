import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const size = Number(process.env.ELEMENTS_BY_PAGE) || 5;

async function buildWhere(params?: 
  {
  status?: string;
  // pageNumber?: number;
  search?:string
}): Promise<Prisma.ProductVariantWhereInput> {
  const where: Prisma.ProductVariantWhereInput= {
    isActive:true,
  }; 

  if(params?.search){
    where.product = {
      name:{
        contains: params.search, mode: "insensitive"
      }
    }
  }
  if(params?.status === "out"){
    //disponible <=0 aka stock-reservedStock<=0 aka stock <=reservedStock
    where.stock={
      lte: prisma.productVariant.fields.reservedStock
    };
  }
  if(params?.status === "low")
  {
    // 0 < stock - reservedStock <= minStock
  const ids = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "ProductVariant" WHERE ("stock" - "reservedStock") > 0 AND ("stock" - "reservedStock") <= "minStock"`;
  where.id = {in: ids.map((v)=>v.id)}

  }
  // ...(params?.search
  //   ? { product:{name: { contains: params.search, mode: "insensitive" } } }
  //   : {}),
  // ...(params?.status && params?.status === "low" ? 

  return where
}

export const ListVariants = async (
  params
  // status,
  // pageNumber,
  // search
: {
  status?: string;
  pageNumber?: number;
  search?:string
}) => {
  return await prisma.productVariant.findMany({
    where: await buildWhere(params),
    
      // status === "low"
      //   ? { 
      //     isActive:true,
      //       stock: {
      //         lte: 10,
      //       },
      //     }
      //   : status === "out"
      //     ? {
      //         isActive:true,
      //         stock: {
      //           equals: 0,
      //         },
      //       }
      //     : {
      //       isActive:true
      //     },

    include: {
      product: {
        include: {
          images: {
            take: 1,
          },
        },
      },
    },
    skip: params.pageNumber ? (params.pageNumber - 1) * size : 0,
    take: size,
    orderBy: {
      sku: "desc",
    },
  });
};

export const countTotalVariants = async ( params: { status?: string, search?:string }) => {
  return await prisma.productVariant.count({
    where: await buildWhere(params)
      // status === "low"
      //   ? {
      //       isActive: true,
      //       stock: {
      //         lte: 10,
      //       },
      //     }
      //   : status === "out"
      //     ? {
      //         isActive: true,

      //         stock: {
      //           equals: 0,
      //         },
      //       }
      //     : {
      //         isActive: true,
      //       },
  });
};

export const ListLowStockVariants = async () => {
  return await prisma.productVariant.count({
    where: {
      isActive: true,
      stock: {
        lte: 10,
      },
    },
  });
};
export const ListOutOfStockVariants = async () => {
  return await prisma.productVariant.count({
    where: {
      isActive: true,
      stock: {
        equals: 0,
      },
    },
  });
};

export const countAllVariants = async () => {
  return await prisma.productVariant.count({
    where: {
      isActive: true,
    },
  });
};
export type VariantListItem = Awaited<ReturnType<typeof ListVariants>>[number];
