import { bestSellers } from "@/lib/constants/bestSellers";
import React from "react";
import BestSellerCard from "../BestSellerCard";
import { ArrowRight } from "lucide-react";

export default function BestSellers() {
  return (
    <section className="w-full pt-10 p-20 flex flex-col gap-4 mb-10 bg-stne-50 ">
      <div className="flex justify-between ">
        <p className="font-bold text-slate-900 text-2xl">Best Sellers</p>
        <div className="flex items-center gap-3 font-semibold" >
          <p className="text-sm text-primary">Voir tous les produits</p>
          <ArrowRight className="size-3 text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 ">
        {bestSellers.map((c) => (
          <BestSellerCard key={c.name} {...c} />
        ))}
      </div>
    </section>
  );
}
