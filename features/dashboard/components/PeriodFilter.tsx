"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
] as const;

export function PeriodFilter() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("period") ?? "30d";

  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-neutral-300 bg-white">
      {OPTIONS.map((o, i) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === active}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("period", o.value);
            router.replace(`${pathName}?${params.toString()}`);
          }}
          className={cn(
            "cursor-pointer px-4 py-2 text-sm",
            i > 0 && "border-l border-neutral-300",
            o.value === active
              ? "bg-neutral-900 font-medium text-white"
              : "text-neutral-600 hover:bg-neutral-50",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
