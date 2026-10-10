import { notFound } from "next/navigation";
import { updateCategory } from "@/features/category/actions";
import { getCategoryById, listParentOptions } from "@/features/category/queries";
import { CategoryForm } from "@/features/category/components/CategoryForm";

const Page = async ({ params }: PageProps<"/admin/category/[id]/edit">) => {
  const { id } = await params;
  const [category, parents] = await Promise.all([getCategoryById(id), listParentOptions(id)]);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Modifier « {category.name} »</h1>
      <CategoryForm
        action={updateCategory.bind(null, id)}
        parents={parents}
        defaultValues={category}
        hasChildren={category._count.children > 0}
        submitLabel="Enregistrer"
      />
    </div>
  );
};

export default Page;
