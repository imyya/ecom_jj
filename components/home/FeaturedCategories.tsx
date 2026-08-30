import { categories } from '@/lib/constants/categories'
import React from 'react'
import CategoryCard from '../CategoryCard'

export default function FeaturedCategories() {
  return (
    <section className='w-full h flex flex-col gap-4 pt-10 p-20 bg-stone-50'>
      
      <div className='flex flex-col justify-between '>
        <p className='font-bold text-slate-900 text-2xl'>Featured Categories</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-3 '>
        {categories.map((c) => (
          <CategoryCard key={c.name} name={c.name} src={c.src} />
        ))}
      </div>
    </section>
  )
}
