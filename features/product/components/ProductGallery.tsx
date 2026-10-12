"use client";
import React, { useState } from "react";
import { ProductBySlug } from "../queries";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
type coverType = {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  position: number;
};
const ProductGallery = ({ product }: { product: ProductBySlug }) => {
  const [cover, setCover] = useState<coverType | null>(
    product?.images[0] ?? null,
  );
  if (!product) return <p>Aucune image pour ce produit</p>;
    const isOutOfStock = product.variants.every((v) => v.stock - v.reservedStock <= 0);


  const onImageClick = (image: coverType) => {
    if (!image) return;
    setCover(image);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
               {/* {isOutOfStock && (
  <span className="absolute top-3 left-2 z-10 rounded-sm bg-neutral-900 px-2 py-1 text-xs font-medium text-white">
    Rupture de stock
  </span>
)} */}
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText ?? product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={cn("object-cover", isOutOfStock? "opacity-50":"")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="size-10 text-neutral-300" />
          </div>
        )}
      </div>

      {product.images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {product.images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 "
            >
              <Image
                src={img.url}
                alt={img.altText ?? product.name}
                fill
                sizes="120px"
                className="object-cover cursor-pointer"
                onClick={() => onImageClick(img)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
