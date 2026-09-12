import Container from '@/components/ui/Container';
import ProductCard from '@/features/product/components/ProductCard';
import { listProducts } from '@/features/product/queries';
import React from 'react';

export default async function Page({searchParams}:PageProps<"/boutique">) {
    const {category} = await searchParams;
    const products = await listProducts({
        categorySlug: typeof category === "string" ? category : undefined
    })

    return (
        <Container className="py-12 lg:py-16">
             {products.length === 0 ? (
        <p className="text-neutral-500">Aucun produit trouvé.</p>
      ) :
            (<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

            {
                products.map((p)=>
                    <ProductCard key={p.id} product={p}/>
                )
            }
            </div>)}
        </Container>
    );
}

