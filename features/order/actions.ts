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
let subTotal = 0
const customer = await prisma.customer.findUnique(
    {
        where:{
            phone:order.customer?.phone 
        }
    }
)

const items = order.items
const orderItems=[]
for(const i of items ){
const item = await prisma.productVariant.findUnique({
    where:{
        id: i.variantId,
    },
    include:{
        product:true
    }
})
if(item){
    if(item.stock - item.reservedStock < i.quantity){
        return {
            ok:false,
            data:[],
            message:"Item not enough"
        }
    }
    const unitPrice = item.priceOverride ?? item.product.promoPrice ?? item.product.basePrice;
    subTotal+= unitPrice * i.quantity
    orderItems.push({
        productId: item.productId,
        variantId: item.id,
        productName: item.product.name,
        variantLabeL: [item.color,item.size].filter(Boolean).join("/"),
        sku:item.sku,
        unitPrice,
        quantity: i.quantity,
        lineTotal: unitPrice * i.quantity
    })
    item.reservedStock++
}}

const newOrder = await prisma.order.create(
   { data:{
        deliveryAddress: order.deliveryAddress ?? '',
        deliveryZoneId:order.deliveryZoneId,
        deliveryQuartier: order.deliveryQuartier ?? '',
        customerId:customer?.id ?? null,
        subtotal: subTotal,
        total:subTotal,
        orderNumber: ll,
        items:{create:orderItems}
    }
}
)
}

