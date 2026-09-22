import Container from "@/components/ui/Container";
import Link from "next/link";

export default function Page() {
  return (
    <Container className="py-16 lg:py-24">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold font-heading text-slate-900 sm:text-4xl">
          À propos de Jiiro
        </h1>
        <p className="mt-4 text-neutral-600">
          Jiiro est née d'une idée simple : chaque tête mérite un couvre-chef
          bien choisi. Chapeaux, bonnets, casquettes — on a réuni un stock de
          plus de 13 000 pièces pour que vous trouviez celle qui vous va,
          sans compromis sur la qualité.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Notre approche
          </h2>
          <p className="mt-2 text-neutral-600">
            Des matières confortables, des finitions soignées, et un style
            qui s'adapte à votre quotidien — du marché au bureau, de la rue
            à la plage.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Livraison rapide
          </h2>
          <p className="mt-2 text-neutral-600">
            Basés à Dakar, on livre partout où vous êtes — rapidement, et
            avec un suivi simple depuis la commande jusqu'à la livraison.
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Une question ?
        </h2>
        <p className="mt-2 text-neutral-600">
          Écrivez-nous directement sur WhatsApp, on répond vite.
        </p>
        <Link
          href="/boutique"
          className="mt-4 inline-block border border-neutral-900 px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-primary hover:text-white"
        >
          Voir la boutique
        </Link>
      </div>
    </Container>
  );
}
