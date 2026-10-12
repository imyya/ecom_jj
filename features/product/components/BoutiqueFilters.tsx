"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ALL = "ALL";

type Props = {
  categories: { slug: string; name: string }[];
  colors: string[];
};

export function BoutiqueFilters({ categories, colors }: Props) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? ALL;
  const color = searchParams.get("color") ?? ALL;
  const activeCount = [category, color].filter((v) => v !== ALL).length;

  const setParam = (key: "category" | "color", value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.replace(`${pathName}?${params.toString()}`);
  };

  const categoryItems = [
    { value: ALL, label: "Toutes les catégories" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];
  const colorItems = [
    { value: ALL, label: "Toutes les couleurs" },
    ...colors.map((c) => ({ value: c, label: c })),
  ];

  const fields = (
    <>
      <Select items={categoryItems} value={category} onValueChange={(v) => setParam("category", v)}>
        <SelectTrigger className="h-10 w-full bg-white md:w-52" aria-label="Catégorie">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select items={colorItems} value={color} onValueChange={(v) => setParam("color", v)}>
        <SelectTrigger className="h-10 w-full bg-white md:w-48" aria-label="Couleur">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colorItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Link
          href="/boutique"
          className="text-sm font-medium text-neutral-500 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          Réinitialiser
        </Link>
      )}
    </>
  );

  return (
    <>
      {/* Ordinateur : filtres en ligne */}
      <div className="hidden items-center gap-3 md:flex">{fields}</div>

      {/* Mobile : bouton + panneau */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="h-10 gap-2 bg-white" />}>
            <SlidersHorizontal className="size-4" />
            Filtres
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                {activeCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl bg-white">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4 pb-8">{fields}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
