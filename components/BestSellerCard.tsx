"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BestSellersListItem } from "@/features/product/queries";
import { formatPrice } from "@/lib/utils";

type BestSeller = {
  slug: string; // ← à ajouter dans bestSellers.ts
  name: string;
  src: string | StaticImageData;
  price: string;
};

export default function BestSellerCard({
  bestSeller,
}: {
  bestSeller: BestSellersListItem;
}) {
  const handleAddToCart = () => {
    // TODO: logique panier
  };

  return (
    <article className="group relative flex flex-col gap-2">
      {/* image */}
      <Link href={`/boutique/${bestSeller.slug}`}>
        <div className="relative overflow-hidden rounded-lg aspect-[3/1] bg-neutral-100">
          <Image
            src={bestSeller.images[0].url}
            alt={bestSeller.name}
            // width={100}
            // height={100}
            fill
            // sizes="(max-width: 768px) 100vw, 25vw"
            // sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            sizes="(max-width: 767px) 100vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />

          {/* bouton panier — au-dessus du lien étendu grâce à z-10 */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Ajouter ${bestSeller.name} au panier`}
            className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-sm
                     bg-white px-3 py-1 text-sm font-medium 
                     transition hover:bg-white/90 cursor-pointer"
          >
            <Plus className="size-4" />
            Ajouter
          </button>
        </div>

        {/* infos */}
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-900 text-lg">
            <Link
              href={`/boutique/${bestSeller.slug}`}
              className="after:absolute after:inset-0 after:content-['']
                       hover:text-primary transition"
            >
              {bestSeller.name}
            </Link>
          </h3>
          {bestSeller.promoPrice ? (
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">
                {formatPrice(bestSeller.promoPrice)}
              </span>
              <span className="text-md text-neutral-400 line-through">
                {formatPrice(bestSeller.basePrice)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">
              {formatPrice(bestSeller.basePrice)}
            </span>
          )}{" "}
        </div>
      </Link>
    </article>
  );
}
