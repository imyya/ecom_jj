import { getProductBySlug } from "@/features/product/queries";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ImageOff } from "lucide-react";

const Page = async ({ params }: PageProps<"/boutique/[slug]">) => {
  const { slug } = await params;
  const product = await getProductBySlug({ slug });

  if (!product) {
    notFound();
  }

  const cover = product.images[0];

  return (
    <Container className="py-12 lg:py-16">
      {/* fil d'ariane */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/boutique" className="hover:text-neutral-900 transition">Boutique</Link>
        <span className="mx-2">/</span>
        <Link href={`/boutique?category=${product.category.slug}`} className="hover:text-neutral-900 transition">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
        {/* galerie */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.altText ?? product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="size-10 text-neutral-300" />
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={img.url} alt={img.altText ?? product.name} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* infos */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            {product.isNew && (
              <span className="mt-2 inline-block rounded-sm bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                Nouveau
              </span>
            )}
          </div>

          {product.promoPrice ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{formatPrice(product.promoPrice)}</span>
              <span className="text-lg text-neutral-400 line-through">{formatPrice(product.basePrice)}</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-primary">{formatPrice(product.basePrice)}</span>
          )}

          {product.description && (
            <p className="leading-relaxed text-neutral-600">{product.description}</p>
          )}

          {<product className="variants"></product>.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-900">Choisir une option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const available = v.stock - v.reservedStock > 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!available}
                      className="rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {[v.color, v.size].filter(Boolean).join(" / ")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 font-bold text-slate-50 transition hover:bg-primary-hover sm:w-fit"
          >
            Commander via WhatsApp
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Page;
