import "server-only"
import prisma from "@/lib/prisma"

function buildWhere(params?:{categorySlug?:string}){
    return {
        isActive: true,
        ...(params?.categorySlug? {category:{slug:params.categorySlug}}:{})
    }
}
export const listProducts=async(params?:{categorySlug?:string,pageNumber?:number})=>{
    const products = await prisma.product.findMany({
        where: buildWhere(params)
      //  {
           // isActive:true,
           // ...(params?.categorySlug? {category:{slug:params.categorySlug}} :{})// le spread ... spread un objet dans lobjet englobant which is lobject where ici et si pas de categ-slug param un objet vide sera spread dans where{}
       // }
       ,
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

export const countTotalProducts=async(params?:{categorySlug?:string})=>{
    return await prisma.product.count({

        where:buildWhere(params)
    }
    )

}

export const getProductBySlug = async(params:{slug:string})=>{
    return await prisma.product.findUnique({
        where:{
            slug:params.slug
        },
        include:{
            images:{
                orderBy:{position:"asc"},
                
            },
            category:true,
            variants:true
        }
    })
}

export type ProductListItem = Awaited<ReturnType<typeof listProducts>>[number];
export type ProductBySlug = Awaited<ReturnType<typeof getProductBySlug>>