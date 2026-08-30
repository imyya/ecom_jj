import React from "react";
import Image from "next/image";
import heroImage from "@/public/images/hero-image-pane.png";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-900 flex justify-between bg-amer-50 h-1/3 ">
      <div className="flex flex-col pl-20 items-cente justify-center flex-1 gap-5">
        <div className="flex flex-col justify-center items-cent mb-4 ">
          <h1 className="text-6xl font-bold font-heading">
            Découvrez notre stock de
          </h1>
          <h1 className="text-6xl font-bold font-heading">
            plus de 13 000 chapeaux,
          </h1>
          <h1 className="text-6xl font-bold font-heading">
            bonnets et casquettes !
          </h1>
        </div>

        <div className="flex flex-col gap-4 h-[20%]">
        <p className="font-light">À partir de <strong className="text-primary font-bold">2500&nbsp;FCFA</strong></p>


          <button className="hover:cursor-pointer hover:bg-primary-hover text-center w-30 bg-primary h-10 rounded-sm text-slate-50 font-bold animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-bot">
            Get Started
          </button>
        </div>
      </div>
      <Image
        src={heroImage}
        alt="Hats, beanies and caps from our inventory"
        priority
        className="h-full w-xl object-cover"
      />
    </section>
  );
}
