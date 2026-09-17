"server only"

import prisma from "@/lib/prisma"

export const  listDeliveryZones = async ()=>{
    return await prisma.deliveryZone.findMany({
        where:{
            isActive:true,
            orderBy: {name:"asc"}
        }
    })
    
}

export type DeliveryZone = Awaited<ReturnType<typeof listDeliveryZones>>[number]