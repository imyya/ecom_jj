import { cn, formatPrice } from "@/lib/utils";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye } from "lucide-react";
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

import { DatePicker } from "@/features/sotckMovement/components/DatePicker";
import { HistoryFilter } from "@/features/stock/components/HistoryFilter";
import { countListOrders, listOrders } from "@/features/order/queries";
import { OrderStatus } from "@/generated/prisma";
import { isOrderStatus } from "@/features/order/schema";
import { ORDER_STATUS_STYLES } from "@/features/order/utils";
import { OrderStatusFilter } from "@/features/order/components/OrderStatusFilters";
import { OrderByFilter } from "@/features/order/components/OrderByFilter";

const pageSize = Number(process.env.ELEMENTS_BY_PAGE) || 5;

const Page = async ({ searchParams }: PageProps<"/admin/orders">) => {
  const { status, order, search, page } = await searchParams;

  const currentPage = Number(page) || 1;

  const [orders, totalCount] = await Promise.all([
    listOrders({
      orderStatus: isOrderStatus(status) ? status : undefined,
      search: typeof search === "string" ? search : undefined,
      pageNumber: currentPage,
      order: order === "asc" || order === "desc" ? order : "desc",
    }),
    countListOrders({
      orderStatus: isOrderStatus(status) ? status : undefined,
      search: typeof search === "string" ? search : undefined,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pages = getPageNumbers(Number(currentPage), totalPages);
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (typeof search === "string" && search) params.set("search", search);
    if (typeof status === "string" && status) params.set("status", status);
    if (typeof order === "string" && order) params.set("order", order);
    params.set("page", String(targetPage));
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-8xl px-6 py-12">
      <div className="mb-4 flex flex-col gap-3 ">
        <h1 className="text-3xl font-bold text-slate-900">Les commandes</h1>
      </div>
      <div className="flex justify-between mt-15 mb-12">
        <div className="flex gap-3">
          <SearchBar subject="n° commande, Tel client " />
        </div>
        <OrderStatusFilter/>
        {/* <div className="flex gap-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <p>De :</p>
            <DatePicker type="from" />
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <p>À :</p>
            <DatePicker type="to" />
          </div>
        </div> */}
        <div className=" flex justify-end flex-wrap gap-2">
          <OrderByFilter/>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <th className="px-4 py-3">N° de commande </th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Articles</th>
              <th className="px-4 py-3">Sous-total</th>
              <th className="px-4 py-3">Frais Livraison</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((v) => (
              <tr
                key={v.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3 text-slate-900 font-mono font-semibold">
                  {v.orderNumber}
                </td>
                <td className="px-4 py-3  text-slate-900">
                  {v.createdAt.toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "Africa/Dakar",
                  })}
                </td>
                <td className="px-4 py-3  text-slate-900">
                  <div className="flex flex-col gap 1">
                    <p className="font-medium">
                      {[
                        v.customer?.firstName ?? v.guestFirstName,
                        v.customer?.lastName ?? v.guestLastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}{" "}
                    </p>
                    <p className="text-neutral-500">
                      {v.customer?.phone ?? v.guestPhone ?? "—"}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  {v.items.reduce((a, i) => i.quantity + a, 0)}
                </td>
                <td className="px-4 text-slate-700 ">{formatPrice(v.subtotal)}</td>
                <td className="px-4 text-slate-700 ">{formatPrice(v.deliveryZone?.fee ?? 0)}</td>
                <td className="px-4 text-slate-700 font-bold">{formatPrice(v.total)}</td>
                <td className="px-4 py-3 text-slate-700 font-medium">
                  <span
                    className={cn(
                      "inline-flex rounded-sm px-2.5 py-0.5 text-xs font-medium",
                      ORDER_STATUS_STYLES[v.status].className,
                    )}
                  >
                    {ORDER_STATUS_STYLES[v.status].label}
                  </span>
                </td>
                <td className=" text-slate-600 ">
                  <Link
                  className="flex items-center justify-center"
                  title="Voir details"
                  href={`/admin/orders/${v.id}`}>
                  <Eye  className="size-4 blue-orange-400" />

                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <p className="mt-6 text-center text-neutral-500 mb-15">
          Aucune commande ne correspond à ces filtres.
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
