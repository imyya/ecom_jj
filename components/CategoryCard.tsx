import { ArrowRight } from 'lucide-react'
import Image, { StaticImageData } from 'next/image'
import React from 'react'

type categProps={
name:string,
src:string | StaticImageData,
slug:string
}
export default function CategoryCard({name,src}:categProps ){
  return (
    <div className='relative h-44 flex flex-col justify-end cursor-pointer'>
        <Image fill alt='' sizes="(max-width:768px) 100vw, 33vw" src={src} className='object-cover'></Image>
        <div className='absolute flex w-full justify-between px-4 pb-4'>
            <p className='text-xl font-bold text-white capitalize'>{name}</p>
            <ArrowRight className='size-5 text-slate-50'/>
        </div>
      
    </div>
  )
}
