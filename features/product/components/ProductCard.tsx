"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";
import { ProductListItem } from "../queries";
import { formatPrice } from "@/lib/utils";
import { ImageOff, Plus } from "lucide-react";

const ProductCard = ({ product }: { product: ProductListItem }) => {
  const handleAddToCart = () => {
    // TODO: logique panier
  };
  return (
    <article className="group relative flex flex-col gap-2">
      {/* image */}
      {/* <div className="relative overflow-hidden rounded-lg"> */}
      <div className="relative group aspect-square overflow-hidden rounded-lg bg-neutral-100">
        {product.images[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="w-full h- object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="size-8 text-neutral-300" />
          </div>
        )}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`Ajouter ${product.name} au panier`}
          className="hidden md:group-hover:flex absolute top-3 right-2 z-10  items-center gap-1 rounded-sm bg-white px-3 py-1 text-sm font-medium transition hover:bg-white/90 cursor-pointer"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {/*         
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          //width={100}
          // height={400}
          sizes="(max-width: 768px) 100vw, 25vw"
          className="w-full h- object-cover transition duration-300 group-hover:scale-105"
        />
      </div> */}

      <div className="flex flex-col">
        <h3 className="font-bold text-slate-900 text-lg">
          <Link
            href={`/boutique/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']
                               hover:text-primary transition"
          >
            {product.name}
          </Link>
        </h3>
        {product.promoPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">
              {formatPrice(product.promoPrice)}
            </span>
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(product.basePrice)}
            </span>
          </div>
        ) : (
          <span className="text-primary font-medium">
            {formatPrice(product.basePrice)}
          </span>
        )}

        {/* <p className="text-sm font-medium text-primary">{product.basePrice} FCFA</p> */}
      </div>
    </article>
  );
};

export default ProductCard;
