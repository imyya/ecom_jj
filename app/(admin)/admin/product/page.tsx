import { listCategories } from "@/features/category/queries";
import { countTotalProducts, listProducts } from "@/features/product/queries";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const Page = async ({ searchParams }: PageProps<"/admin/product">) => {
  const { search, category, status, priceMin, priceMax, size, color, page } =
    await searchParams;
  const currentPage = Number(page) || 1;
  const searchQuery = typeof search === "string" ? search : undefined;
  const [products, totalCount, categories] = await Promise.all([
    listProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      pageNumber: Number(page || 1),
      search: searchQuery,
      isActive:
        status === "active" ? true : status === "inactive" ? false : undefined,
      priceMin:
        typeof priceMin === "string" && priceMin ? Number(priceMin) : undefined,
      priceMax:
        typeof priceMax === "string" && priceMax ? Number(priceMax) : undefined,
      size: typeof size === "string" ? size : undefined,
      color: typeof color === "string" ? color : undefined,
    }),
    countTotalProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      search: searchQuery,
      isActive:
        status === "active" ? true : status === "inactive" ? false : undefined,
      priceMin:
        typeof priceMin === "string" && priceMin ? Number(priceMin) : undefined,
      priceMax:
        typeof priceMax === "string" && priceMax ? Number(priceMax) : undefined,
      size: typeof size === "string" ? size : undefined,
      color: typeof color === "string" ? color : undefined,
    }),
    listCategories(),
  ]);

  return(
  <div className="mx-auto max-w-5xl px-6 py-12">
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-900">Produits</h1>
      <Link
        href="/admin/product/new"
        className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-slate-50 hover:bg-primary-hover"
      >
        Nouveau produit
      </Link>
    </div>

    <form method="GET" className="mb-6 flex flex-wrap gap-2">
      <input
        type="text"
        name="search"
        defaultValue={typeof search === "string" ? search : ""}
        placeholder="Rechercher..."
        className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
      />
      <select
        name="category"
        defaultValue={typeof category === "string" ? category : ""}
        className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={typeof status === "string" ? status : ""}
        className="rounded-sm border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="inactive">Inactifs</option>
      </select>
      <input
        type="number"
        name="priceMin"
        defaultValue={typeof priceMin === "string" ? priceMin : ""}
        placeholder="Prix min"
        className="w-28 rounded-sm border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        type="number"
        name="priceMax"
        defaultValue={typeof priceMax === "string" ? priceMax : ""}
        placeholder="Prix max"
        className="w-28 rounded-sm border border-neutral-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded-sm border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
      >
        Filtrer
      </button>
    </form>

    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-neutral-500">
          <th className="py-2">Produit</th>
          <th className="py-2">Catégorie</th>
          <th className="py-2">Prix</th>
          <th className="py-2">Statut</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-b border-neutral-100">
            <td className="py-2 font-medium text-slate-900">{p.name}</td>
            <td className="py-2 text-neutral-600">{p.category.name}</td>
            <td className="py-2 text-neutral-600">
              {formatPrice(p.basePrice)}
            </td>
            <td className="py-2">
              <span
                className={p.isActive ? "text-green-700" : "text-neutral-400"}
              >
                {p.isActive ? "Actif" : "Inactif"}
              </span>
            </td>
            <td className="py-2 text-right">
              <Link
                href={`/admin/product/${p.id}/edit`}
                className="text-primary hover:text-primary-hover"
              >
                Modifier
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {products.length === 0 && (
      <p className="mt-6 text-center text-neutral-500">
        Aucun produit ne correspond à ces filtres.
      </p>
    )}
  </div>
  );
};

export default Page;
