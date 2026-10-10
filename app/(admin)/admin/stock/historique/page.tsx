import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,

} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getPageNumbers } from "@/lib/pagination";

import { SearchBar } from "@/features/stock/components/SearchBar";
import {
  countListStockMovement,
  findVariant,
  ListStockMovements,
} from "@/features/sotckMovement/queries";

import { DatePicker } from "@/features/sotckMovement/components/DatePicker";
import { HistoryFilter } from "@/features/stock/components/HistoryFilter";

const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

const Page = async ({ searchParams }: PageProps<"/admin/stock/historique">) => {
  const { variantId, type, search, adminId, page, from, to } =
    await searchParams;

  const currentPage = Number(page) || 1;
  const fromDate = typeof from === "string" ? new Date(from) : undefined;
  const toDate = typeof to === "string" ? new Date(to) : undefined;
  let toNextDate: Date | undefined
  if(toDate){
    toNextDate= new Date(toDate)
    toNextDate?.setDate(toNextDate.getDate()+1)
  }

  const [movements, totalCount] = await Promise.all([
    ListStockMovements({
      variantId: typeof variantId === "string" ? variantId : undefined,
      type: type === "IN" || type === "OUT" ? type : undefined,
      from: fromDate,
      to: toNextDate,
      search: typeof search === "string" ? search : undefined,
      pageNumber: currentPage,
    }),
    countListStockMovement({
      variantId: typeof variantId === "string" ? variantId : undefined,
      type: type === "IN" || type === "OUT" ? type : undefined,
      search: typeof search === "string" ? search : undefined,
      from: fromDate,
      to: toNextDate,
    }),
  ]);

  const variant= typeof variantId ==="string" ?  await findVariant(variantId) : null



  const totalPages = Math.ceil(totalCount / pageSize);
  const pages = getPageNumbers(Number(currentPage), totalPages);
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if(typeof type === "string" && type ) params.set("type",type)
    if (typeof variantId === "string" && variantId) params.set("variantId", variantId);
    if (typeof search === "string" && search) params.set("search", search);
    if (typeof from === "string" && from) params.set("from", from)
    if (typeof to === "string" && to) params.set("to", to)
    params.set("page", String(targetPage));
    return `/admin/stock/historique?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-8xl px-6 py-12">
      <div className="mb-4 flex flex-col gap-3 ">
        <Link
        href="/admin/stock"
        className="text-lg flex gap-2 items-center">
        <ArrowLeft className="size-4" />
        Stock
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">
          Historique des mouvements de stock
        </h1>
        {
          variant && (
            <p>[ {variant.product.name} [variant.color, variant.size].filter(Boolean).join(" / ")] · ({variant.sku})  ]</p>
          )

          
        }
        
      </div>
      <div className="flex justify-between mt-15 mb-12">
        <div className="flex gap-3">
          <SearchBar subject="sku ou nom de produit" />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <p>De :</p>
            <DatePicker type="from" />
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <p>À :</p>
            <DatePicker type="to" />
          </div>
        </div>
        <div className=" flex justify-end flex-wrap gap-2">
          <HistoryFilter />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Variante</th>
              <th className="px-4 py-3">Sens</th>
              <th className="px-4 py-3">Quantite</th>
              <th className="px-4 py-3">Motif</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Admin</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((v) => (
              <tr
                key={v.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3  text-slate-900">
                  {v.createdAt.toLocaleString("fr-FR",{
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "Africa/Dakar",
                  })}
                </td>
                <td className="px-4 py-3 text-slate-900 font-semibold">
                  {v.variant.product.name}
                </td>
                <td className="px-4 py-3  text-slate-900">
                  <div className="flex flex-col gap 1">
                    <p className="font-medium"> {v.variant.color} - {v.variant.size}</p>
                    <p className="text-neutral-500">{v.variant.sku}</p>
                  </div>
                 
                </td>
                <td className="p-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium",
                      v.type === "OUT"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-50 text-blue-500",
                    )}
                  >
                    {v.type === "OUT" ? "Sortie" : "Entree"}
                  </span>
                </td>
                <td className="px-4 text-slate-700 font-bold">{v.quantity}</td>
                <td className="px-4 py-3 text-slate-700 font-medium">
                  {v.reason}
                </td>
                <td className="px-4 text-slate-600 ">{v.note ?? ""}</td>
                <td className="px-4 text-slate-700 ">{v.admin?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {movements.length === 0 && (
        <p className="mt-6 text-center text-neutral-500 mb-15">
          Aucun movement de stock ne correspond à ces filtres.
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
                currentPage == 1 ? "pointer-events-none opacity-50" : "",
              )}
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
    </div>
  );
};

export default Page;
