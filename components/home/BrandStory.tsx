import Image from "next/image";
import Link from "next/link";
import brandStory from "@/public/images/story-image.png"
/**
 * Section "présentation de la marque" de l'accueil (§5.1 du CDC).
 * Server Component pur — aucune interactivité, donc pas de "use client".
 */
export default function BrandStory() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image
            src={brandStory}
            alt="Un modèle portant un bonnet Jiiro"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Conçu pour chaque tête
          </h2>
          <p className="mt-4 text-neutral-600">
            Chaque pièce Jiiro est pensée pour durer : des matières
            confortables, des finitions soignées, et un style qui s'adapte à
            votre quotidien — du marché au bureau, de la rue à la plage.
          </p>
          <Link
            href="/boutique"
            className="mt-6 inline-block border border-neutral-900 px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-primary hover:text-white"
          >
            Découvrir la collection
          </Link>
        </div>
      </div>
    </section>
  );
}