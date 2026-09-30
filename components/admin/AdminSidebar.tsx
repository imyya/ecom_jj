import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/features/auth/actions";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/product", label: "Produits", icon: Package },
  { href: "/admin/category", label: "Catégories", icon: FolderTree },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white ">
      <div className="border-b border-neutral-200 px-5 py-5">
        <p className="text-lg font-bold tracking-tight text-slate-900">
          JI<span className="text-primary">I</span>RO
        </p>
        <p className="text-xs text-neutral-400">Back-office</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {ADMIN_NAV.map((link) => {
          const isActive =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link   
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-slate-900"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
            <div className="border-t border-neutral-200 p-3 mb-2">
        <div className="flex items-center justify-between rounded-md px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
              MA
            </div>
            <span className="text-sm font-medium text-slate-900">Mamya Aidara</span>
          </div>
          <button
          onClick={()=>{
            logout()
          }}
            type="button"
            aria-label="Déconnexion"
            className="text-neutral-400 transition hover:text-destructive cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        </div>
    </aside>
  );
}
