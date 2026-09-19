"use server"
import prisma from "@/lib/prisma"

export const listCategories = async()=>{
    return await prisma.category.findMany({
        where:{
            parentId:null
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

export type CategoryListItem = Awaited<ReturnType<typeof listCategories>>[number]