import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import Container from "@/components/ui/Container";

const ORDER_NUMBER_FORMAT = /^JIIRO-\d{4}-\d{6}$/;

const Page = async ({ searchParams }: PageProps<"/order/confirmation">) => {
  const { n } = await searchParams;
  if (typeof n !== "string" || !ORDER_NUMBER_FORMAT.test(n)) redirect("/boutique");

  const whatsappText = encodeURIComponent(`Bonjour, j'ai passé la commande n°${n}`);
  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${whatsappText}`;

  return (
    <Container className="py-16 lg:py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
        <CheckCircle2 className="size-14 text-green-600" />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold font-heading text-slate-900 sm:text-3xl">
            Merci pour votre commande !
          </h1>
          <p className="text-neutral-600">Votre commande a bien été enregistrée.</p>
        </div>

        <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Numéro de commande</p>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900">{n}</p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-neutral-600">
          <p className="font-medium text-slate-900">Et maintenant ?</p>
          <p>
            Nous vous contactons sur WhatsApp sous 24h pour confirmer votre commande et organiser
            la livraison. Le paiement se fait à la livraison.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <a
            href={whatsappUrl}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-sm border border-green-700 px-6 font-bold text-green-700 transition hover:bg-green-50"
          >
            <SiWhatsapp />
            Nous écrire
          </a>
          <Link
            href="/boutique"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-sm bg-primary px-6 font-bold text-slate-50 transition hover:bg-primary-hover"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default Page;
