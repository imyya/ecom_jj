import { buttonVariants } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ProductCard from "@/features/product/components/ProductCard";
import ProductSearch from "@/features/product/components/ProductSearch";
import { countTotalProducts, listProducts } from "@/features/product/queries";
import { getPageNumbers } from "@/lib/pagination";
import { Search } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function Page({ searchParams }: PageProps<"/boutique">) {
  const { category, page, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const searchQuery = typeof search === "string" ? search : undefined;

  const [products, totalCount] = await Promise.all([
    listProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      pageNumber: Number(page || 1),
      search: searchQuery,
    }),
    countTotalProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      search: searchQuery,
    }),
  ]);
  const totalPages = Math.ceil(totalCount / 5);
  const pages = getPageNumbers(Number(page), totalPages);
  //   const totalNumber = await countTotalProducts({
  //     categorySlug: typeof category === "string" ? category : undefined,
  //   });

  return (
    <Container className="py-12 lg:py-16">
      <ProductSearch
        initialValue={searchQuery}
        category={typeof category === "string" ? category : undefined}
      ></ProductSearch>
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
          {pages.map((p, i) => {
            if (p === "ellipsis") {
              return (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else {
              return (
                <PaginationItem key={i}>
                  <Link
                    href={`/boutique?page=${p}${category ? `&category=${category}` : ""}`}
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
        </PaginationContent>
      </Pagination>
    </Container>
  );
}
