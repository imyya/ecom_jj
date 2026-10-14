import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import Container from "@/components/ui/Container";
import { CONTACT } from "@/lib/constants/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur une commande ou un produit ? Contactez Jiiro.",
};

const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Bonjour Jiiro, ")}`;

export default function ContactPage() {
  return (
    <Container className="py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold font-heading text-slate-900 sm:text-4xl">Contact</h1>
        <p className="mt-3 text-neutral-600">
          Une question sur un produit, une commande ou une livraison ? Le plus rapide, c’est
          WhatsApp.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-green-700 px-6 font-bold text-white transition hover:bg-green-800"
        >
          <SiWhatsapp className="size-5" />
          Nous écrire sur WhatsApp
        </a>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContactItem icon={<Phone className="size-5" />} label="Téléphone">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-primary">
              {CONTACT.phone}
            </a>
          </ContactItem>
          <ContactItem icon={<Mail className="size-5" />} label="Email">
            <a href={`mailto:${CONTACT.email}`} className="hover:text-primary">
              {CONTACT.email}
            </a>
          </ContactItem>
          <ContactItem icon={<MapPin className="size-5" />} label="Adresse">
            {CONTACT.address}
          </ContactItem>
          <ContactItem icon={<Clock className="size-5" />} label="Horaires">
            {CONTACT.hours}
          </ContactItem>
          <ContactItem icon={<SiInstagram className="size-5" />} label="Instagram">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              @jiiro
            </a>
          </ContactItem>
        </ul>
      </div>
    </Container>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4 rounded-lg border border-neutral-200 p-5">
      <span className="text-neutral-500">{icon}</span>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
        <span className="font-medium text-slate-900">{children}</span>
      </div>
    </li>
  );
}
