import Link from "next/link";
//import { Facebook, Instagram } from "lucide-react";
import {SiInstagram, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";

const FOOTER_LINKS = {
  boutique: [
    { href: "/boutique", label: "Tous les produits" },
    { href: "/boutique?category=bonnets", label: "Bonnets" },
    { href: "/boutique?category=casquettes", label: "Casquettes" },
    { href: "/boutique?category=chapeaux", label: "Chapeaux" },
  ],
  aide: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/livraison", label: "Livraison" },
    { href: "/retours", label: "Politique de retour" },
  ],
  legal: [
    { href: "/cgv", label: "Conditions générales de vente" },
    { href: "/confidentialite", label: "Politique de confidentialité" },
    { href: "/mentions-legales", label: "Mentions légales" },
  ],
};

// TODO: remplacer les liens "#" par les vrais comptes Jiiro une fois fournis (§34 CDC)
const SOCIAL_LINKS = [
  { href: "https://instagram.com/jiiro", label: "Instagram", Icon: SiInstagram },
  { href: "https://facebook.com/jiiro", label: "Facebook", Icon: SiFacebook },
  { href: "https://tiktok.com/@jiiro", label: "TikTok", Icon: SiTiktok },
  { href: "https://wa.me/221XXXXXXXXX", label: "WhatsApp", Icon: SiWhatsapp },
];

/**
 * Footer global du site (§5.1) — vit dans app/layout.tsx, PAS dans les
 * composants de l'accueil, puisqu'il doit apparaître sur toutes les pages.
 * Server Component pur, aucune interactivité.
 */
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-semibold tracking-tight text-white">JIIRO</p>
            <p className="mt-3 text-sm text-neutral-400">
              Bonnets, casquettes et accessoires — mode moderne, accessible et pratique.
            </p>
            <div className="mt-4 flex gap-4">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 transition-colors hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Boutique" links={FOOTER_LINKS.boutique} />
          <FooterColumn title="Aide" links={FOOTER_LINKS.aide} />
          <FooterColumn title="Légal" links={FOOTER_LINKS.legal} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-800 pt-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jiiro. Tous droits réservés.</p>
          <p>Paiement sécurisé — Wave, Orange Money, carte bancaire</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}