import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import {
  getDashboardKpis,
  getSalesByDay,
  getTopCategories,
  getTopProducts,
  isPeriod,
  periodStart,
} from "@/features/dashboard/queries";
import { ORDER_STATUS_STYLES } from "@/features/order/utils";
import type { OrderStatus } from "@/generated/prisma";
import { SalesChart } from "@/features/dashboard/components/SalesChart";
import { RankingList } from "@/features/dashboard/components/RankinList";
import { PeriodFilter } from "@/features/dashboard/components/PeriodFilter";

const Page = async ({ searchParams }: PageProps<"/admin">) => {
  const { period: rawPeriod } = await searchParams;
  const period = isPeriod(rawPeriod) ? rawPeriod : "30d";
  const from = periodStart(period);
  // const kpis = await getDashboardKpis();

  const [kpis, salesByDay, topProducts, topCategories] = await Promise.all([
    getDashboardKpis(),
    getSalesByDay(from),
    getTopProducts(from),
    getTopCategories(from),
  ]);
  const pending = kpis.ordersByStatus.PAIEMENT_EN_ATTENTE ?? 0;
  const periodTotal = salesByDay.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">
        Tableau de bord
      </h1>

      {/* Chiffre d'affaires */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SalesCard
          label="Aujourd’hui"
          amount={kpis.today.amount}
          orders={kpis.today.orders}
        />
        <SalesCard
          label="Cette semaine"
          amount={kpis.week.amount}
          orders={kpis.week.orders}
        />
        <SalesCard
          label="Ce mois-ci"
          amount={kpis.month.amount}
          orders={kpis.month.orders}
        />
      </section>

      {/* À traiter */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AlertCard
          label="Commandes en attente"
          value={pending}
          href="/admin/orders?status=PAIEMENT_EN_ATTENTE"
          tone={pending > 0 ? "amber" : "neutral"}
        />
        <AlertCard
          label="Ruptures de stock"
          value={kpis.outOfStock}
          href="/admin/stock?status=out"
          tone={kpis.outOfStock > 0 ? "red" : "neutral"}
        />
        <AlertCard
          label="Stocks faibles"
          value={kpis.lowStock}
          href="/admin/stock?status=low"
          tone={kpis.lowStock > 0 ? "amber" : "neutral"}
        />
        <AlertCard
          label="Clients enregistrés"
          value={kpis.customers}
          tone="neutral"
        />
      </section>

      {/* Commandes par statut */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">
          Commandes par statut
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(ORDER_STATUS_STYLES) as OrderStatus[]).map((status) => (
            <li key={status}>
              <Link
                href={`/admin/orders?status=${status}`}
                className="flex flex-col gap-1 rounded-md border border-neutral-100 p-3 hover:bg-neutral-50"
              >
                <span
                  className={cn(
                    "w-fit rounded-sm px-2 py-0.5 text-xs font-medium",
                    ORDER_STATUS_STYLES[status].className,
                  )}
                >
                  {ORDER_STATUS_STYLES[status].label}
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {kpis.ordersByStatus[status] ?? 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Ventes</h2>
        <PeriodFilter />
      </div>

      <section className="mb-6 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-semibold text-slate-900">
            Chiffre d’affaires par jour
          </h3>
          <p className="text-sm text-neutral-500">
            Total :{" "}
            <span className="font-semibold text-slate-900">
              {formatPrice(periodTotal)}
            </span>
          </p>
        </div>
        <SalesChart data={salesByDay} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-900">
            Produits les plus vendus
          </h3>
          <RankingList
            items={topProducts}
            emptyLabel="Aucune vente sur la période"
          />
        </section>
        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-900">
            Catégories les plus vendues
          </h3>
          <RankingList
            items={topCategories}
            emptyLabel="Aucune vente sur la période"
          />
        </section>
      </div>
    </div>
  );
};

function SalesCard({
  label,
  amount,
  orders,
}: {
  label: string;
  amount: number;
  orders: number;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {formatPrice(amount)}
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        {orders} commande{orders > 1 ? "s" : ""}
      </p>
    </div>
  );
}

const TONES = {
  neutral: "bg-neutral-300",
  amber: "bg-amber-500",
  red: "bg-red-600",
};

function AlertCard({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href?: string;
  tone: keyof typeof TONES;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", TONES[tone])} />
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </>
  );

  const className = "rounded-lg border border-neutral-200 bg-white p-5";
  return href ? (
    <Link
      href={href}
      className={cn(className, "transition hover:border-neutral-400")}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default Page;
