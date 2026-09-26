import { listCategories } from "@/features/category/queries";
import { ProductForm } from "@/features/product/components/ProductForm";

const NewProductPage = async () => {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">
        Nouveau produit
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
};

export default NewProductPage;
