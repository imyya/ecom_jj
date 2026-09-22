"use client";
import React, { useEffect, useRef, useState } from "react";
import { searchProductSuggestions, Suggestion } from "../actions";
import { ImageOff, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ProductSearch = ({
  initialValue,
  category,
}: {
  initialValue?: string;
  category?: string;
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(()=> {
      const timeout = setTimeout(async () => {
          console.log("the category",category)
          const results = await searchProductSuggestions(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (category) params.set("category", category);
      router.replace(`/boutique?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

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
    <div ref={containerRef} className="relative w-full max-w-sm mb-10">
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
          onChange={(e) => setQuery(e.target.value)}
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
