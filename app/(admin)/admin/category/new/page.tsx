import { createCategory } from "@/features/category/actions";
import { listParentOptions } from "@/features/category/queries";
import { CategoryForm } from "@/features/category/components/CategoryForm";

const Page = async () => {
  const parents = await listParentOptions();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Nouvelle catégorie</h1>
      <CategoryForm action={createCategory} parents={parents} submitLabel="Créer la catégorie" />
    </div>
  );
};

export default Page;
