"use client"
import Link from 'next/link';
import React from 'react'
import { ShoppingBagIcon } from './icons';
import { useCartStore } from '@/features/cart/store';

export default function CartIcon() {
    const itemCount = useCartStore((state)=>state.items.reduce((sum,i)=>sum+i.quantity,0))
  return (
    <Link href="/cart" aria-label="Panier" className="relative text-neutral-600 hover:text-neutral-900">
        <ShoppingBagIcon/>
        {itemCount >0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
          {itemCount}
        </span>
        )}
    </Link>
  )
}
