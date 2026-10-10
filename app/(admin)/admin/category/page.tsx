import Link from "next/link";
import { CornerDownRight, Pencil, Plus } from "lucide-react";
import { listAdminCategories } from "@/features/category/queries";

const Page = async () => {
  const categories = await listAdminCategories();
  const total = categories.reduce((n, c) => n + 1 + c.children.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catégories</h1>
          <p className="mt-1 text-sm text-neutral-500">{total} catégories</p>
        </div>
        <Link
          href="/admin/category/new"
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-slate-50 hover:bg-primary-hover"
        >
          <Plus className="size-4" />
          Nouvelle catégorie
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Produits</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <CategoryRows key={c.id} category={c} />
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <p className="mt-6 text-center text-neutral-500">Aucune catégorie pour le moment.</p>
      )}
    </div>
  );
};

type AdminCategory = Awaited<ReturnType<typeof listAdminCategories>>[number];

function CategoryRows({ category }: { category: AdminCategory }) {
  return (
    <>
      <tr className="border-b border-neutral-100 hover:bg-neutral-50">
        <td className="px-4 py-3 font-medium text-slate-900">
          {category.name}
          {category.children.length > 0 && (
            <span className="ml-2 text-xs font-normal text-neutral-400">
              {category.children.length} sous-catégorie{category.children.length > 1 ? "s" : ""}
            </span>
          )}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{category.slug}</td>
        <td className="px-4 py-3 text-neutral-700">{category._count.products}</td>
        <td className="px-4 py-3 text-right">
          <EditLink id={category.id} name={category.name} />
        </td>
      </tr>

      {category.children.map((child) => (
        <tr key={child.id} className="border-b border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50">
          <td className="py-3 pr-4 pl-8 text-neutral-700">
            <span className="flex items-center gap-2">
              <CornerDownRight className="size-3.5 text-neutral-300" />
              {child.name}
            </span>
          </td>
          <td className="px-4 py-3 font-mono text-xs text-neutral-500">{child.slug}</td>
          <td className="px-4 py-3 text-neutral-700">{child._count.products}</td>
          <td className="px-4 py-3 text-right">
            <EditLink id={child.id} name={child.name} />
          </td>
        </tr>
      ))}
    </>
  );
}

function EditLink({ id, name }: { id: string; name: string }) {
  return (
    <Link
      href={`/admin/category/${id}/edit`}
      title="Modifier"
      aria-label={`Modifier ${name}`}
      className="inline-flex items-center justify-center rounded-sm p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-slate-900"
    >
      <Pencil className="size-4" />
    </Link>
  );
}

export default Page;
