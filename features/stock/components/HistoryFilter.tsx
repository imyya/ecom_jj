"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const STOCK_HISTORY_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "IN", label: "Entree" },
  { value: "OUT", label: "Sortie" },
] as const;

type HistoryFilterValue = (typeof STOCK_HISTORY_FILTERS)[number]["value"];

export function HistoryFilter() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const defaultValue = searchParams.get("status");
  const [activeFilter, setActiveFilter] = useState<HistoryFilterValue | string>(
    defaultValue ?? "all",
  );


  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-neutral-300">
      {STOCK_HISTORY_FILTERS.map((filter, index) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => {
            setActiveFilter(filter.value);
            const params = new URLSearchParams(searchParams.toString());

            if (filter.value === "all") {
              params.delete("type");
              params.delete("page")
            } else {
              params.delete("page");
              params.set("type", filter.value);
            }
            router.replace(`${pathName}?${params.toString()}`);
          }}
          className={`px-4 py-2 text-sm cursor-pointer ${
            filter.value === activeFilter
              ? "bg-neutral-900 font-medium text-white"
              : "text-neutral-600 hover:bg-neutral-50"
          } ${index > 0 ? "border-l border-neutral-300" : ""}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
