"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, formatPrice } from "@/lib/utils";
import type { AdminProductListItem } from "../queries";

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", className)}>
    {children}
  </span>
);

const ProductDetailsDialog = ({ product }: { product: AdminProductListItem }) => {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Voir ${product.name}`}
        className="inline-flex cursor-pointer items-center justify-center rounded-sm p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-slate-900"
      >
        <Eye className="size-4" />
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{product.name}</DialogTitle>
          <DialogDescription>
            {product.category.name} · {product.isActive ? "Actif" : "Inactif"}
          </DialogDescription>
        </DialogHeader>

        {/* ---------- Images ---------- */}
        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Images</h3>
          {product.images.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative size-20 shrink-0 overflow-hidden rounded-md bg-neutral-100"
                >
                  <Image
                    src={img.url}
                    alt={img.altText || product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">Aucune image</p>
          )}
        </section>

        {/* ---------- Informations ---------- */}
        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Informations</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-neutral-500">Prix normal</dt>
            <dd>{formatPrice(product.basePrice)}</dd>

            <dt className="text-neutral-500">Prix promo</dt>
            <dd>{product.promoPrice ? formatPrice(product.promoPrice) : "—"}</dd>

            <dt className="text-neutral-500">Description</dt>
            <dd className="whitespace-pre-line">{product.description || "—"}</dd>
          </dl>

          <div className="flex flex-wrap gap-2 pt-1">
            {product.isActive ? (
              <Badge className="bg-green-100 text-green-700">Actif</Badge>
            ) : (
              <Badge className="bg-neutral-200 text-neutral-600">Inactif</Badge>
            )}
            {product.isFeatured && <Badge className="bg-blue-100 text-blue-700">Mis en avant</Badge>}
            {product.isNew && <Badge className="bg-purple-100 text-purple-700">Nouveau</Badge>}
            {product.isBestSeller && <Badge className="bg-amber-100 text-amber-700">Meilleure vente</Badge>}
          </div>
        </section>

        {/* ---------- Variantes & stock ---------- */}
        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Variantes & stock</h3>
          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Couleur</th>
                  <th className="px-3 py-2">Taille</th>
                  <th className="px-3 py-2">Prix</th>
                  <th className="px-3 py-2 text-right">Physique</th>
                  <th className="px-3 py-2 text-right">Réservé</th>
                  <th className="px-3 py-2 text-right">Disponible</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => {
                  const available = v.stock - v.reservedStock;
                  return (
                    <tr
                      key={v.id}
                      className={cn("border-t border-neutral-100", !v.isActive && "opacity-50")}
                    >
                      <td className="px-3 py-2 font-mono">{v.sku}</td>
                      <td className="px-3 py-2">{v.color || "—"}</td>
                      <td className="px-3 py-2">{v.size || "—"}</td>
                      <td className="px-3 py-2">
                        {formatPrice(v.priceOverride ?? product.promoPrice ?? product.basePrice)}
                      </td>
                      <td className="px-3 py-2 text-right">{v.stock}</td>
                      <td className="px-3 py-2 text-right">{v.reservedStock}</td>
                      <td className="px-3 py-2 text-right font-medium">{available}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {!v.isActive && (
                            <Badge className="bg-neutral-200 text-neutral-600">Désactivée</Badge>
                          )}
                          {v.isActive && available <= 0 && (
                            <Badge className="bg-red-100 text-red-700">Rupture</Badge>
                          )}
                          {v.isActive && available > 0 && available <= v.minStock && (
                            <Badge className="bg-orange-100 text-orange-700">Stock faible</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- SEO ---------- */}
        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">SEO</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-neutral-500">Titre</dt>
            <dd>{product.seoTitle || "Non renseigné"}</dd>
            <dt className="text-neutral-500">Description</dt>
            <dd>{product.seoDescription || "Non renseignée"}</dd>
          </dl>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
