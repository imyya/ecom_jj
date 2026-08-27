"use client";
import React, { useState } from "react";
import { MenuIcon, XIcon } from "../icons";
import Link from "next/link";

export default function MobileMenuButton({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        className="text-neutral-600 hover:text-neutral-900"
      >
        {isOpen ? <XIcon /> : <MenuIcon />}
      </button>
      {isOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-neutral-200 bg-white px-4 py-4">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
