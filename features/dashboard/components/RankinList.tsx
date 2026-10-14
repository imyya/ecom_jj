import { formatPrice } from "@/lib/utils";

type Item = { name: string; quantity: number; revenue: number };

export function RankingList({ items, emptyLabel }: { items: Item[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-neutral-400">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.revenue), 1);

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.name} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-900">{item.name}</span>
            <span className="shrink-0 tabular-nums text-neutral-600">
              {formatPrice(item.revenue)}
              <span className="ml-2 text-xs text-neutral-400">{item.quantity} vendus</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100">
            <div
              className="h-2 rounded-full bg-[#2563eb]"
              style={{ width: `${(item.revenue / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
