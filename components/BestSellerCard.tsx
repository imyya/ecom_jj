"use client";
import Image, { StaticImageData } from "next/image";
import React from "react";

type bestSeller = {
  name: string;
  src: string | StaticImageData;
  price: string;
};
export default function BestSellerCard(props: bestSeller) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Image
          //fill
          alt=""
          sizes="(max-width:768px) 100vw, 33vw"
          //width={100}
          //height={400}
          src={props.src}
          className="object-cover w-full"
        ></Image>
        <button
          type="button"
          onClick={() => {
            /* ... */
          }}
          className="absolute top-3 left-3 z-10 bg-white  px-3 py-1
                 text-sm font-medium  hover:bg-white/90 transition hover:cursor-pointer"
        >
          + Ajouter
        </button>
      </div>
      <div className="flex flex-col ">
        <p className="font-bold text-slate-900 text-lg">{props.name}</p>
        <p className="text-sm font-semibold text-primary">{props.price}f</p>
      </div>
    </div>
  );
}
