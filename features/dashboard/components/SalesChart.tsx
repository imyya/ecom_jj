"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} 
from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils";

const chartConfig = {
  amount: { label: "Ventes", color: "#2563eb" },
} satisfies ChartConfig;

export function SalesChart({ data }: { data: { label: string; amount: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} margin={{ top: 8, left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="#ececec" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(v: number) => v.toLocaleString("fr-FR")}
        />
        <ChartTooltip
          cursor={{ fill: "#f5f5f5" }}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-medium text-slate-900">{formatPrice(Number(value))}</span>
              )}
            />
          }
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
