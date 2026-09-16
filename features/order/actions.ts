'use server'

import { CreateOrderInput, CreateOrderSchema } from "@/features/order/schema"
import prisma from "@/lib/prisma";

import { Prisma } from "@/generated/prisma/client";

async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();

  const count = await tx.order.count({
    where: {
      orderNumber: { startsWith: `JIIRO-${year}-` },
    },
  });

  const sequence = String(count + 1).padStart(6, "0");
  return `JIIRO-${year}-${sequence}`;
}


const createOrder= async(order: CreateOrderInput)=>{
const parsed = CreateOrderSchema.safeParse(order)
if (!parsed.success) {
  return { ok: false, errors: parsed.error.flatten() };
}

try{

    const result = await prisma.$transaction(async(tx)=>{
        let subTotal = 0
    const customer = order.customer?.phone ? await tx.customer.findUnique(
        {
            where:{
                phone:order.customer?.phone 
            }
        } 
    ) : null
    
    const items = order.items
    const orderItems=[]
    for(const i of items ){
    const item = await tx.productVariant.findUnique({
        where:{
            id: i.variantId,
        },
        include:{
            product:true
        }
    })
    if(!item)  {
        throw new Error(`Item not found`);
    } 
    
        if(item.stock - item.reservedStock < i.quantity){
           throw new Error(`Stock insuffisant pour ${item.product.name}`); // on a besoin de throw pour que la transactionfasse un rollback
        }
        const unitPrice = item.priceOverride ?? item.product.promoPrice ?? item.product.basePrice;
        subTotal+= unitPrice * i.quantity
        orderItems.push({
            productId: item.productId,
            variantId: item.id,
            productName: item.product.name,
            variantLabel: [item.color,item.size].filter(Boolean).join("/"),
            sku:item.sku,
            unitPrice,
            quantity: i.quantity,
            lineTotal: unitPrice * i.quantity
        })
        await tx.productVariant.update({
            where:{id: i.variantId},
            data:{reservedStock:{increment: i.quantity}}
        })
    
    
    }
      const orderNumber = await generateOrderNumber(tx);
    
    return await tx.order.create(
       { data:{
            deliveryAddress: order.deliveryAddress ,
            deliveryZoneId:order.deliveryZoneId  ,
            deliveryQuartier: order.deliveryQuartier ,
            customerId:customer?.id ?? null,
            subtotal: subTotal,
            total:subTotal,
            orderNumber:orderNumber ,
            items:{create:orderItems}
        }
    })
    })
    return {
        ok:true,
        data:result,
        message:"Order added successfully"
    }
}catch(err){
    return {
        ok:false,
        message: err instanceof Error ? err.message : "error occured"
    }
}


}

export default createOrder