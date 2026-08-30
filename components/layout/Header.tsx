import Link from "next/link";
import React from "react";
import { SearchIcon, UserIcon } from "../icons";
import CartIcon from "../CartIcon";
import MobileMenuButton from "../mobile/MobileMenuButton";
import { NAV_LINKS } from "@/lib/constants/navLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-neutral-900"
        >
          JI<span className="text-primary">I</span>RO
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/recherche"
            aria-label="Rechercher"
            className="hidden text-neutral-600 hover:text-neutral-900 sm:block"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="hidden text-neutral-600 hover:text-neutral-900 sm:block"
          >
            <UserIcon />
          </Link>
          <CartIcon />
          <MobileMenuButton links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
