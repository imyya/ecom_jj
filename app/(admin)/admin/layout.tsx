import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/product", label: "Produits" },
  { href: "/admin/category", label: "Catégories" },
  { href: "/admin/orders", label: "Commandes" },
];

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full bg-">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-red-100 p-4">
        <p className="mb-6 px-2 text-lg font-semibold text-slate-900">Jiiro Admin</p>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
