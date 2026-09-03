'use client'
import { categories } from '@/lib/constants/categories'
import React from 'react'
import CategoryCard from '../CategoryCard'
import {motion, Variants} from "motion/react"
import Container from '../ui/Container'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 }, // délai entre chaque enfant
  },
};

const item:Variants = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};


export default function FeaturedCategories() {
  return (
    <section className=' bg-stone-50'>
      <Container className='flex flex-col gap-4 py-12 lg:py-16'>

      <div className='flex flex-col justify-between '>
        <p className='font-bold text-slate-900 text-2xl animate-in fade-in slide-in-from-bottom-7 duration-700'>Nos Catégories</p>
      </div>
      <motion.div className='grid grid-cols-1 md:grid-cols-4 gap-3 '
      variants={container}
      initial = "hidden"
      whileInView="show"
      viewport={{once:true, amount:0.2}}
      >
        {categories.map((c) => (
          <motion.div
          key={c.slug}
          variants={item}
          whileHover={{scale: 1.07}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}

          >
          <CategoryCard name={c.name} src={c.src} slug={c.slug} />
          </motion.div>
        ))}
        </motion.div>
      </Container>
      


    </section>
  )
}
