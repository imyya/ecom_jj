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
import { countTotalProducts, listProducts } from "@/features/product/queries";
import { getPageNumbers } from "@/lib/pagination";
import Link from "next/link";
import React from "react";

export default async function Page({ searchParams }: PageProps<"/boutique">) {
  const { category, page } = await searchParams;
  const currentPage = Number(page) || 1;

  const [products, totalCount] = await Promise.all([
    listProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      pageNumber: Number(page || 1),
    }),
    countTotalProducts({
      categorySlug: typeof category === "string" ? category : undefined,
    }),
  ]);
  const totalPages = Math.ceil(totalCount / 5);
  const pages = getPageNumbers(Number(page), totalPages);
  //   const totalNumber = await countTotalProducts({
  //     categorySlug: typeof category === "string" ? category : undefined,
  //   });

  return (
    <Container className="py-12 lg:py-16">
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
                    href={`/boutique?page=${p}${category ? `&category=${category}`:""}`}
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
