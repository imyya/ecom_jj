import Container from '@/components/ui/Container';
import { listProducts } from '@/features/product/queries';
import React from 'react';

export default async function Page({searchParams}:PageProps<"/boutique">) {
    const {category} = await searchParams;
    const products = await listProducts({
        categorySlug: typeof category === "string" ? category : undefined
    })
    return (
        <Container className="py-12 lg:py-16">
            </Container>
    );
}

