'use client'
import { bestSellers } from "@/lib/constants/bestSellers";
import React from "react";
import BestSellerCard from "../BestSellerCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Variants, motion } from "motion/react";
import Container from "../ui/Container";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      // staggerDirection: 1,  // 1 = gauche→droite (défaut), -1 = droite→gauche
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function BestSellers() {
  return (
    <section className="">
      <Container className="mx-auto max-w-7xl px-6 lg:px-12 py-12 lg:py-16 flex flex-col gap-4">

      <div className="flex justify-between">
        <p className="font-bold text-slate-900 text-2xl">Best Sellers</p>
        <Link
          href="/boutique"
          className="flex items-center gap-3 font-semibold text-primary hover:text-primary-hover transition"
        >
          <span className="text-sm">Voir tous les produits</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <motion.div
        variants={container}
        initial = "hidden"
         whileInView="show"
        viewport={{once:false, amount:0.2}}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 "
      >
        {bestSellers.map((c) => (
          <motion.div key={c.name} variants={item}>
            <BestSellerCard key={c.name} {...c} />
          </motion.div>
        ))}
      </motion.div>
      </Container>
    </section>
  );
}
