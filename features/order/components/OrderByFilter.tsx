"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ORDER_BY_FILTERS = [
  { value: "desc", label: "Plus recent" },
  { value: "asc", label: "Plus ancien" },
] as const;

type OrderByFilterType = "asc" | "desc";

export function OrderByFilter() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const defaultValue = searchParams.get("order");
  const [activeFilter, setActiveFilter] = useState<OrderByFilterType | string>(
    defaultValue ?? "desc",
  );

  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-neutral-300">
      {ORDER_BY_FILTERS.map((filter, index) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => {
            setActiveFilter(filter.value);
            const params = new URLSearchParams(searchParams.toString());
            if (filter.value === "desc") {
              params.delete("page");
              params.delete("order");
            } else {
              params.delete("page");
              params.set("order", filter.value);
            }
            router.replace(`${pathName}?${params.toString()}`);
          }}
          className={`px-4 py-2 text-sm cursor-pointer ${
            filter.value === activeFilter
              ? "bg-orange-700 font-medium text-white"
              : "text-neutral-600 hover:bg-neutral-50"
          } ${index > 0 ? "border-l border-neutral-300" : ""}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
