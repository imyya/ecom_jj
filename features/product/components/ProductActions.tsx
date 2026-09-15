"use client"
import React, { useState } from 'react';
import { ProductBySlug } from '../queries';
import {SiWhatsapp } from "react-icons/si";
import { useCartStore } from '@/features/cart/store';
import { cn } from '@/lib/utils';

const ProductActions = ({product}:{product:ProductBySlug}) => {
  const  [selectedVariantId, setSelectedVariantId] =useState('')
  const addItem = useCartStore((state)=>state.addItem);
  const selectVariant = (variantId:string)=>{
    if(!variantId) return
    setSelectedVariantId(variantId)
  }
  

    return (
        <div className='flex flex-col gap-10'>
             { product && product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-900">Choisir une option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const available = v.stock - v.reservedStock > 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={()=>selectVariant(v.id)}
                      disabled={!available}
                      className={cn("cursor-pointer rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40",
                        v.id === selectedVariantId &&  "border-primary bg-primary/5 text-primary"
                      )}
                    >
                      {[v.color, v.size].filter(Boolean).join(" / ")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3">

         <button
           disabled={selectedVariantId===''}
           onClick={()=>{
            const variant = product?.variants.find((v)=>v.id === selectedVariantId)
            if(!variant) return
            if(!product) return
            addItem({
            productId: product?.id,
            variantId: variant.id,
            productName: product?.name,
            variantLabel: [variant.color, variant.size].filter(Boolean).join("/"),
            sku: variant.sku,
            unitPrice: variant.priceOverride ?? product?.promoPrice ?? product?.basePrice,
            quantity:1,
            imageUrl: product.images[0]?.url
            
            })
           }}
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 font-bold text-slate-50 transition hover:bg-primary-hover sm:w-fit cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ajouter au panier
          </button>
            <button
            disabled={selectedVariantId===''}
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-green-700 px-6 font-bold text-slate-50 transition hover:bg-green-900 cursor-pointer sm:w-fit disabled:cursor-not-allowed disabled:opacity-40"
          >
            Commander via WhatsApp <SiWhatsapp/>
          </button>
          </div>


        </div>
    );
}

export default ProductActions;
