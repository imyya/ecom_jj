"use client";
import React, { useEffect, useRef, useState } from "react";
import { searchProductSuggestions, Suggestion } from "../actions";
import { ImageOff, Search, SearchAlertIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const ProductSearch = ({
  initialValue,

}: {
  initialValue?: string;
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathName = usePathname();
  

    const handleChange = useDebouncedCallback(async(search: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const results = await searchProductSuggestions(search);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        if (search){
        params.set("search", search);
        } 
        else{
          params.delete("search")
        } 
        params.delete("page")
      router.replace(`${pathName}?${params.toString()}`);
    }, 300);

      useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsOpen(false);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            handleChange(e.target.value)}}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Rechercher un produit..."
          className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="rounded-sm border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50"
        >
          <Search className="size-4" />
        </button>
      </form>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-sm border border-neutral-200 bg-white shadow-lg">
          {suggestions.map((p) => (
            <Link
              key={p.id}
              href={`/boutique/${p.slug}`}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-neutral-100">
            {p.images[0]?.url ? (
                  <Image
                    src={p.images[0].url}
                    alt={p.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="size-4 text-neutral-300" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{p.name}</span>
                <span className="text-xs text-neutral-500">
                  {formatPrice(p.basePrice)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
