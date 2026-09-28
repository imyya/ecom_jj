import { listCategories } from "@/features/category/queries";
import { ProductForm } from "@/features/product/components/ProductForm";
import { getProductBySlug } from "@/features/product/queries";
import { notFound } from "next/navigation";
import React from "react";

const Page = async ({ params }: PageProps<"/admin/product/[slug]/edit">) => {
  const { slug } = await params;
 const [product, categories] = await Promise.all([
    getProductBySlug({ slug }),
    listCategories(),
  ]);
    if (!product) { 
    notFound();
  }

  return(
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">
        Modifier « {product.name} »
      </h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
};

export default Page;
