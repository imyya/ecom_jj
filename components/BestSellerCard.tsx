"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

type BestSeller = {
  slug: string; // ← à ajouter dans bestSellers.ts
  name: string;
  src: string | StaticImageData;
  price: string;
};

export default function BestSellerCard({ slug, name, src, price }: BestSeller) {
  const handleAddToCart = () => {
    // TODO: logique panier
  };

  return (
    <article className="group relative flex flex-col gap-2">
      {/* image */}
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={src}
          alt={name}
          //width={100}
          // height={400}
          sizes="(max-width: 768px) 100vw, 25vw"
          className="w-full h- object-cover transition duration-300 group-hover:scale-105"
        />

        {/* bouton panier — au-dessus du lien étendu grâce à z-10 */}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`Ajouter ${name} au panier`}
          className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-sm
                     bg-white px-3 py-1 text-sm font-medium 
                     transition hover:bg-white/90"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {/* infos */}
      <div className="flex flex-col">
        <h3 className="font-bold text-slate-900 text-lg">
          <Link
            href={`/boutique/${slug}`}
            className="after:absolute after:inset-0 after:content-['']
                       hover:text-primary transition"
          >
            {name}
          </Link>
        </h3>
        <p className="text-sm font-medium text-primary">{price} FCFA</p>
      </div>
    </article>
  );
}
