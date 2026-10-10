import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getOrderById } from "@/features/order/queries";
import { ORDER_STATUS_STYLES } from "@/features/order/utils";
import { WaitingOrderActions } from "@/features/order/components/WaitingOrderActions";

const formatDate = (d: Date) =>
  d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" });

const Page = async ({ params }: PageProps<"/admin/orders/[id]">) => {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const status = ORDER_STATUS_STYLES[order.status];
  const clientName =
    [order.customer?.firstName ?? order.guestFirstName, order.customer?.lastName ?? order.guestLastName]
      .filter(Boolean)
      .join(" ") || "—";
  const clientPhone = order.customer?.phone || order.guestPhone || "—";
  const clientEmail = order.customer?.email || order.guestEmail;

  const hoursPending =
    order.status === "PAIEMENT_EN_ATTENTE"
      ? Math.floor((Date.now() - order.createdAt.getTime()) / 3_600_000)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* En-tête */}
      <Link href="/admin/orders" className="mb-4 flex items-center gap-2 text-sm text-neutral-600 hover:text-slate-900">
        <ArrowLeft className="size-4" />
        Commandes
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
        <span className={cn("rounded-sm px-2.5 py-0.5 text-xs font-medium", status.className)}>
          {status.label}
        </span>
        <span className="text-sm text-neutral-500">Créée le {formatDate(order.createdAt)}</span>
        {hoursPending !== null && hoursPending >= 24 && (
          <span className="text-sm font-medium text-red-700">En attente depuis {hoursPending}h</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Articles */}
          <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <h2 className="border-b border-neutral-200 px-5 py-3 font-semibold text-slate-900">
              Articles ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {item.product.images[0]?.url ? (
                      <Image src={item.product.images[0].url} alt={item.productName} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageOff className="size-4 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="font-medium text-slate-900">{item.productName}</span>
                    <span className="text-sm text-neutral-500">
                      {item.variantLabel} · <span className="font-mono text-xs">{item.sku}</span>
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-neutral-500">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                    <p className="font-semibold text-slate-900">{formatPrice(item.lineTotal)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totaux */}
            <dl className="space-y-2 border-t border-neutral-200 bg-neutral-50 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Livraison</dt>
                <dd>{formatPrice(order.deliveryFee)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Remise</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Historique des statuts */}
          <section className="rounded-lg border border-neutral-200 bg-white">
            <h2 className="border-b border-neutral-200 px-5 py-3 font-semibold text-slate-900">Historique</h2>
            <ol className="flex flex-col gap-4 px-5 py-4">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-neutral-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{ORDER_STATUS_STYLES[h.status].label}</span>
                    <span className="text-xs text-neutral-500">{formatDate(h.changedAt)}</span>
                    {h.note && <span className="text-sm text-neutral-600">{h.note}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-6">
          {/* Actions */}

          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Actions</h2>
          {
            order.status === "PAIEMENT_EN_ATTENTE" ? (
            <WaitingOrderActions orderId={order.id} orderNumber={order.orderNumber} total={order.total}/>
        )
            : (
            <p className="text-sm text-neutral-500">Aucune action disponible.</p>

            )
        }
          </section>

          {/* Client */}
          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Client</h2>
            <dl className="space-y-1 text-sm">
              <dd className="font-medium text-slate-900">{clientName}</dd>
              <dd className="text-neutral-600">{clientPhone}</dd>
              {clientEmail && <dd className="text-neutral-600">{clientEmail}</dd>}
              <dd className="pt-1 text-xs text-neutral-400">{order.customer ? "Client enregistré" : "Invité"}</dd>
            </dl>
          </section>

          {/* Livraison */}
          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Livraison</h2>
            <dl className="space-y-1 text-sm text-neutral-600">
              <dd className="font-medium text-slate-900">{order.deliveryZone?.name ?? "Zone non renseignée"}</dd>
              {order.deliveryQuartier && <dd>{order.deliveryQuartier}</dd>}
              {order.deliveryAddress && <dd>{order.deliveryAddress}</dd>}
              {order.deliveryNotes && <dd className="pt-1 italic">« {order.deliveryNotes} »</dd>}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Page;
