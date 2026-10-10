"server only"
import prisma from "@/lib/prisma"

export const listCategories = async(name?:string)=>{
    return await prisma.category.findMany({
        where:{
            parentId:null,
            name:name
        },
        include:{
            products:{
                take:1,
                include:{
                    images:{
                        take:1,
                    }
                }
            }
        },
        orderBy: {name:"asc"}
    })
}


export const listAdminCategories = async () => {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
};


export const getCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });
};

// Seules les catégories principales peuvent être parentes (2 niveaux max)
export const listParentOptions = async (excludeId?: string) => {
  return prisma.category.findMany({
    where: { parentId: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};



export type CategoryListItem = Awaited<ReturnType<typeof listCategories>>[number]