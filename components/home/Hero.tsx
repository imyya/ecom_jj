import React from "react";
import Image from "next/image";
import heroImage from "@/public/images/hero-image-pane.png";
import { Button } from "../ui/button";
import Link from "next/link";
import Container from "../ui/Container";

export default function Hero() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-900   h-1/3 ">
      <Container className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 py-12 lg:py-0">

      <div className="flex flex-col justify-center flex-1 gap-5">
          <h1 className="text-5xl font-bold font-heading">
            Découvrez notre stock de
            <br />
            plus de 13&nbsp;000 chapeaux,
            <br />
            bonnets et casquettes&nbsp;!
          </h1>

        <div className="flex flex-col gap-4 h-[20%]">
          <p className="font-light">
            À partir de{" "}
            <strong className="text-primary font-bold">2500&nbsp;FCFA</strong>
          </p>

          <Link
            href="/boutique"
            className="inline-flex items-center justify-center w-fit px-6 h-10 rounded-sm
             bg-primary text-slate-50 font-bold hover:bg-primary-hover transition
             animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
      <Image
        src={heroImage}
        alt="Chapeaux, bonnets et casquettes de notre collection"
        priority
        className="h-full w-xl object-cover"
      />
      </Container>
    </section>
  );
}
