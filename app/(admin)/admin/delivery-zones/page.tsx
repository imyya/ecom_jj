import { cn, formatPrice } from "@/lib/utils";
import { listAdminDeliveryZones } from "@/features/deliveryZone/queries";
import { DeliveryZoneDialog } from "@/features/deliveryZone/components/DeliveryZoneDialog";
import { ToggleDeliveryZone } from "@/features/deliveryZone/components/ToggleDeliveryZone";

const Page = async () => {
  const zones = await listAdminDeliveryZones();
  const activeCount = zones.filter((z) => z.isActive).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Zones de livraison</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {activeCount} zone{activeCount > 1 ? "s" : ""} proposée{activeCount > 1 ? "s" : ""} aux clients
          </p>
        </div>
        <DeliveryZoneDialog />
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Tarif</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr
                key={z.id}
                className={cn(
                  "border-b border-neutral-100 last:border-0 hover:bg-neutral-50",
                  !z.isActive && "text-neutral-400",
                )}
              >
                <td className="px-4 py-3 font-medium">{z.name}</td>
                <td className="px-4 py-3">{z.fee === 0 ? "Gratuite" : formatPrice(z.fee)}</td>
                <td className="px-4 py-3">{z._count.orders}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      z.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500",
                    )}
                  >
                    {z.isActive ? "Active" : "Désactivée"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <DeliveryZoneDialog zone={{ id: z.id, name: z.name, fee: z.fee }} />
                    <ToggleDeliveryZone id={z.id} isActive={z.isActive} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {zones.length === 0 && (
        <p className="mt-6 text-center text-neutral-500">
          Aucune zone pour le moment. Crée la première pour que les clients puissent commander.
        </p>
      )}
    </div>
  );
};

export default Page;
