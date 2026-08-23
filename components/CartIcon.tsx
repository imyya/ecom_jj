"use client"
import Link from 'next/link';
import React from 'react'
import { ShoppingBagIcon } from './icons';

export default function CartIcon() {
    const itemCount = 0;
  return (
    <Link href="/panier" aria-label="Panier" className="relative text-neutral-600 hover:text-neutral-900">
        <ShoppingBagIcon/>
        {itemCount >0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
          {itemCount}
        </span>
        )}
    </Link>
  )
}
