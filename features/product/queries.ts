import "server-only"
import prisma from "@/lib/prisma"

export const listProducts=async(params?:{categorySlug?:string,pageNumber?:number})=>{
    const products = await prisma.product.findMany({
        where:{
            isActive:true,
            ...(params?.categorySlug? {category:{slug:params.categorySlug}} :{})// le spread ... spread un objet dans lobjet englobant which is lobject where ici et si pas de categ-slug param un objet vide sera spread dans where{}
        },
        include:{
            images:{
                orderBy:{position:"asc"},
                take:1
            },
            category:true
        },
        skip:params?.pageNumber ? (params?.pageNumber-1) * 5 : 0,
        take:5,
        orderBy:{
            createdAt:"desc"
        }
    })
    return products
}

export type ProductListItem = Awaited<ReturnType<typeof listProducts>>[number];

