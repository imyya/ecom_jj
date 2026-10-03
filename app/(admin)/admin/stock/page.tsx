import { listCategories } from "@/features/category/queries";
import {
  countTotalProducts,
  listAdminProducts,
} from "@/features/product/queries";
import { cn, formatPrice } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageOff, Pencil } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { getPageNumbers } from "@/lib/pagination";
import { RotateCcw } from "lucide-react";
import ProductDetailsDialog from "@/features/product/components/ProductDetailsDialog";
import ToggleProductStatus from "@/features/product/components/ToggleProductStatus";
import { StockFilter } from "@/features/stock/components/StockFilter";
import {
  countAllVariants,
  countTotalVariants,
  ListLowStockVariants,
  ListOutOfStockVariants,
  ListVariants,
} from "@/features/stock/queries";
import { SearchBar } from "@/features/stock/components/SearchBar";
const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

const Page = async ({ searchParams }: PageProps<"/admin/stock">) => {
  const { search, status, page } = await searchParams;

  const currentPage = Number(page) || 1;
  //   const searchQuery = typeof search === "string" ? search : undefined;
  const [variants, totalVariants, totalCount, lowStock, outOfStock] =
    await Promise.all([
      ListVariants({
        status: typeof status === "string" ? status : undefined,
        pageNumber: Number(page || 1),
      }),
      countAllVariants(),
      countTotalVariants({
        status: typeof status === "string" ? status : undefined,
      }),
      ListLowStockVariants(),
      ListOutOfStockVariants(),
    ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pages = getPageNumbers(Number(currentPage), totalPages);
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (typeof status === "string" && status) params.set("status", status);
    // if (typeof search === "string" && search) params.set("search", search);
    params.set("page", String(targetPage));
    return `/admin/stock?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-8xl px-6 py-12">
      <div className="mb-4 flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Stock</h1>
        <div className="flex gap-3">
          <p className="text-sm text-neutral-500">
            {totalVariants} variantes suivies
          </p>
          <span className=""> · </span>
          <p className="text-sm text-neutral-500">
            {outOfStock + lowStock} en alerte
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 ">
        <div className="flex flex-col bg-white border border-neutral-200 rounded-sm h-30 pl-5 pt-5 gap-3 shadow">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-4xl bg-amber-500"></span>
            <p className="text-lg text-neutral-500">Stock Faible</p>
          </div>
          <p className="text-3xl font-bold">{lowStock} </p>
        </div>
        <div className="flex flex-col bg-white border border-neutral-200 rounded-sm h-30 pt-5 pl-5 gap-3 shadow">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-4xl bg-red-700"></span>
            <p className="text-lg text-neutral-500">Rupture de stock</p>
          </div>
          <p className="text-3xl font-bold">{outOfStock}</p>
        </div>
      </div>
      <div className="flex justify-between mt-10">

      <div className="">
      <SearchBar/>

      </div>
      <div className="mb-6 flex justify-end flex-wrap gap-2">
        <StockFilter />
      </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Variante</th>
              <th className="px-4 py-3">Disponible</th>
              <th className="px-4 py-3">Réservé</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr
                key={v.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative size-15 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {v.product.images[0]?.url ? (
                      <Image
                        src={v.product.images[0].url}
                        alt={v.product.name}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="size-4 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-900">
                      {v.product.name}
                    </span>
                    <span className="text-sm text-neutral-600">{v.sku}</span>
                  </div>
                </td>
                {/* <td className="px-4 py-3 text-neutral-600">{v.product.name}</td> */}
                <td className="px-4 py-3 font-medium text-slate-900">
                  {v?.color} - {v?.size}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      v.stock < 10 ? " text-red-700" : "text-slate-900",
                    )}
                  >
                    {v.stock}
                  </span>
                </td>
                <td className="px-4 text-neutral-500">{v.reservedStock}</td>
                <td className="p-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      v.stock === 0
                        ? "bg-red-100 text-pink-400"
                        : v.stock <= 10
                          ? "bg-orange-100 text-orange-400"
                          : "bg-neutral-100 text-neutral-500",
                    )}
                  >
                    {v.stock === 0
                      ? "Rupture de stock"
                      : v.stock <= 10
                        ? "Stock faible"
                        : "_"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {variants.length === 0 && (
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
                <PaginationItem key={i}>
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
