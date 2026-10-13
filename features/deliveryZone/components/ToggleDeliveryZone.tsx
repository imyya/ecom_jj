"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { setDeliveryZoneActive } from "../actions";

export function ToggleDeliveryZone({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => void (await setDeliveryZoneActive(id, !isActive)))}
      className={cn(
        "cursor-pointer rounded-sm px-2.5 py-1 text-xs font-medium transition disabled:opacity-50",
        isActive
          ? "text-neutral-600 hover:bg-neutral-100"
          : "text-green-700 hover:bg-green-50",
      )}
    >
      {isActive ? "Désactiver" : "Réactiver"}
    </button>
  );
}
