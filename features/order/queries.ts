import { OrderStatus, Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

 const  whereBuilder=(params?: {
  orderStatus?: OrderStatus;
  search?: string;
}):Prisma.OrderWhereInput=>{
    return {
        ...(params?.orderStatus ? {status:params.orderStatus}:{}),
        ...(params?.search ? {
            OR:[
                {
                    orderNumber:{contains:params.search,mode: "insensitive",}
                },
                {
                    customer:{
                        phone:{contains:params.search}
                    },
                },{

                    guestPhone:{contains:params.search}
                }
            ]
        }:{})
    }

}
export const listOrders=async(params?: {
  orderStatus?: OrderStatus;
  pageNumber?: number;
  search?: string;
  order:"asc" | "desc"
})=>{
    return await prisma.order.findMany({
        where:whereBuilder(params),
        include:{
            customer:{
                select:{
                    firstName:true,
                    lastName:true,
                    phone:true
                }
            },
            statusHistory:true,
            items:true,
            deliveryZone:{
                select:{
                    fee:true
                }
            }
        },
        skip: params?.pageNumber ? (params.pageNumber - 1) * pageSize : 0,
        take: pageSize,
        orderBy: { createdAt: params?.order},
    })

}
export const countListOrders=async(params?: {
  orderStatus?: OrderStatus;
  search?: string;
})=>{
return await prisma.order.count({
    where:whereBuilder(params)
})
}

export const getOrderById=async(id:string)=>{
    return await prisma.order.findUnique({
        where:{
            id
                },
    include:{
        customer:{
            select:{
                firstName:true,
                lastName:true,
                phone: true, 
                email: true
            }
        },
        deliveryZone:{
            select:{
                name:true,
                fee:true,
            }
        },
        items:{
            include:{
                product:{
                    select:{
                        images:{
                            take:1,
                            select:{
                                url:true
                            }
                        }
                    }
                }
            }
        },
        statusHistory: { orderBy: { changedAt: "desc" } },
    }
    })

}

export const countPendingOrders=async()=>{
   return await prisma.order.count({
        where:{
            status: OrderStatus.PAIEMENT_EN_ATTENTE
        }
    })
}
export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
export type OrderItem = Awaited<ReturnType<typeof listOrders>>[number];
