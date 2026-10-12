import { buttonVariants } from "@/components/ui/button";
import Container from "@/components/ui/Container";
  import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
  } from "@/components/ui/pagination";
import { BoutiqueFilters } from "@/features/product/components/BoutiqueFilters";
import ProductCard from "@/features/product/components/ProductCard";
import ProductSearch from "@/features/product/components/ProductSearch";
import { countTotalProducts, listAvailableColors, listCategoryOptions, listProducts } from "@/features/product/queries";
import { getPageNumbers } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import React from "react";

const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

export default async function Page({ searchParams }: PageProps<"/boutique">) {
  const { search, category, priceMin, priceMax, size, color, page } =
    await searchParams;
  const currentPage = Number(page) || 1;
  const searchQuery = typeof search === "string" ? search : undefined;

  const [products, categories, colors, totalCount] = await Promise.all([
  listProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      pageNumber: currentPage,
      search: searchQuery,
      isActive: true,
      priceMin:
        typeof priceMin === "string" && priceMin ? Number(priceMin) : undefined,
      priceMax:
        typeof priceMax === "string" && priceMax ? Number(priceMax) : undefined,
      size: typeof size === "string" ? size : undefined,
      color: typeof color === "string" ? color : undefined,
    }),
    listCategoryOptions(),
    listAvailableColors(),
    countTotalProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      search: searchQuery,
      isActive: true,
      priceMin:
        typeof priceMin === "string" && priceMin ? Number(priceMin) : undefined,
      priceMax:
        typeof priceMax === "string" && priceMax ? Number(priceMax) : undefined,
      size: typeof size === "string" ? size : undefined,
      color: typeof color === "string" ? color : undefined,
    })
  ]);
  const totalPages = Math.ceil(totalCount / pageSize);
  const pages = getPageNumbers(Number(currentPage), totalPages);
  
    const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (typeof search === "string" && search) params.set("search", search);
    if (typeof category === "string" && category)params.set("category", category);
    if(typeof color === "string" && color) params.set("color",color)
    params.set("page", String(targetPage));
    return `/boutique?${params.toString()}`;
  };

  return (
    <Container className="py-12 lg:py-16">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <ProductSearch initialValue={searchQuery} />
  <BoutiqueFilters categories={categories} colors={colors} />
</div>

      {/* <form method="GET" className="mb-8 flex gap-2 items-center">
        {category && <input type="hidden" name="category" value={category} />}

        <input
          defaultValue={searchQuery}
          name="search"
          type="text"
          placeholder="Rechercher un produit..."
          className=" w-full max-w-sm rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-sm border border-neutral-300 px-3 py-1 h-8 text-sm hover:bg-neutral-50 flex items-center"
        >
          <Search className="size-4" />
        </button>
      </form> */}
      {products.length === 0 ? (
        <p className="text-neutral-500">Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
        <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Link
              href={buildPageHref(currentPage - 1)}
              className={cn(
                "flex items-center mr-3",
                "hover:bg-neutral-100",
                currentPage == 1 ? "pointer-events-none opacity-50" : "",
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
              className={cn(
                "flex items-center ml-3",
                "hover:bg-neutral-100",
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "",
              )}
            >
              <p className="text-sm font-semibold">Next</p>
              <ChevronRight className="size-4" />
            </Link>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Container>
  );
}
