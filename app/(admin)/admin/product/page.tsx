import { listCategories } from "@/features/category/queries";
import {
  countTotalProducts,
  listAdminProducts,
} from "@/features/product/queries";
import { cn, formatPrice } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRightLeft,
  ImageOff,
  Pencil,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getPageNumbers } from "@/lib/pagination";
import { RotateCcw } from "lucide-react";
import ProductDetailsDialog from "@/features/product/components/ProductDetailsDialog";
import ToggleProductStatus from "@/features/product/components/ToggleProductStatus";

const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

const Page = async ({ searchParams }: PageProps<"/admin/product">) => {
  const { search, category, status, priceMin, priceMax, size, color, page } =
    await searchParams;
  const currentPage = Number(page) || 1;
  const searchQuery = typeof search === "string" ? search : undefined;
  const [products, totalCount, categories] = await Promise.all([
    listAdminProducts({
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

  // useEffect(()=>{

  // },[products])
  console.log("the page", page);
  console.log("the total count", totalCount);
  console.log("the products", products);

  const hasActiveFilters = Boolean(
    search || category || status || priceMin || priceMax || size || color,
  );

  const totalPages = Math.ceil(totalCount / pageSize);
  const pages = getPageNumbers(Number(currentPage), totalPages);
  const buildPageHref = (targetPage: number) => {
    console.log("target page", targetPage);
    const params = new URLSearchParams();
    if (typeof search === "string" && search) params.set("search", search);
    if (typeof category === "string" && category)
      params.set("category", category);
    if (typeof status === "string" && status) params.set("status", status);
    if (typeof priceMin === "string" && priceMin)
      params.set("priceMin", priceMin);
    if (typeof priceMax === "string" && priceMax)
      params.set("priceMax", priceMax);
    params.set("page", String(targetPage));
    return `/admin/product?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-8xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Produits</h1>
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
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm cursor-pointer"
        >
          <option className="cursor-pointer" value="">
            Toutes les catégories
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug} className="cursor-pointer">
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={typeof status === "string" ? status : ""}
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm cursor-pointer"
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
          className="rounded-sm border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer"
        >
          Filtrer
        </button>
        {hasActiveFilters && (
          <Link
            href="/admin/product"
            title="Réinitialiser"
            aria-label="Réinitialiser"
            className="rounded-sm p-2 text-neutral-500 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4" />
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white mb-8">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {p.images[0]?.url ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="size-4 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-slate-900">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {p.category.name}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatPrice(p.basePrice)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500",
                    )}
                  >
                    {p.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="pr-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ProductDetailsDialog product={p} />
                    <Link
                      href={`/admin/product/${p.slug}/edit`}
                      title="Modifier"
                      aria-label={`Modifier ${p.name}`}
                      className="inline-flex items-center justify-center rounded-sm p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-slate-900"
                    >
                      <Pencil className="size-4" />
                    </Link>

                    <ToggleProductStatus
                      id={p.id}
                      name={p.name}
                      isActive={p.isActive}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-6 text-center text-neutral-500">
          Aucun produit ne correspond à ces filtres.
        </p>
      )}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Link
              href={buildPageHref(currentPage - 1)}
              className={cn(
                "flex items-center mr-3",
                "hover:bg-neutral-100",
                currentPage == 1 ? "pointer-cursor opacity-5" : "",
              )}
              // aria-disabled={Number(page) === totalPages}
              // tabIndex={Number(page) === totalPages ? -1 : undefined}
              // className={Number(page) === totalPages? "pointer-cursor opacity-5" : undefined}
            >
              <ChevronLeft className="size-4" />
              <p className="text-sm font-semibold">Previous</p>
            </Link>
          </PaginationItem>
          {pages.map((p, i) => {
            if (p === "ellipsis") {
              return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else {
              return (
                <PaginationItem key={i} >
                  <Link
                    href={buildPageHref(p)}
                    className={buttonVariants({
                      variant: currentPage === p ? "outline" : "ghost",
                      size: "icon",
                    })}
                    aria-current={currentPage === p ? "page" : undefined}
                  >
                    {p}
                  </Link>
                  {/* <PaginationLink href={`/boutique?page=${p}${category ? `&category=${category}`:""}`}  isActive= {currentPage==p} >{p}</PaginationLink> */}
                </PaginationItem>
              );
            }
          })}
          <PaginationItem>
            <Link
              href={buildPageHref(currentPage + 1)}
              // aria-disabled={Number(page) === totalPages}
              // tabIndex={Number(page) === totalPages ? -1 : undefined}
              className={cn(
                "flex items-center mr-3",
                "hover:bg-neutral-100", 
                currentPage === totalPages ? "pointer-cursor opacity-5" : "",
              )}
              //  className=`{currentPage === totalPages? "pointer-none opacity-5" : undefined}`
            >
              <p className="text-sm font-semibold">Next</p>
              <ChevronRight className="size-4" />
            </Link>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Page;
