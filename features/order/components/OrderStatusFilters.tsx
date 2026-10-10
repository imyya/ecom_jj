"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_STYLES } from "../utils";

const ALL = "ALL";

const items = [
  { value: ALL, label: "Tous les statuts" },
  ...Object.entries(ORDER_STATUS_STYLES).map(([value, { label }]) => ({ value, label })),
];

export function OrderStatusFilter() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("status");
  const value = current && Object.hasOwn(ORDER_STATUS_STYLES, current) ? current : ALL;

  const onChange = (next: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!next || next === ALL) params.delete("status");
    else params.set("status", next);
    params.delete("page");
    router.replace(`${pathName}?${params.toString()}`);
  };

  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-56 bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
