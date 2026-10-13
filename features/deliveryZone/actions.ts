"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { DeliveryZoneSchema, type DeliveryZoneResult } from "./schema";

function revalidateZones() {
  revalidatePath("/admin/delivery-zones");
  revalidatePath("/order");
}

export async function saveDeliveryZone(
  zoneId: string | null,
  formData: FormData,
): Promise<DeliveryZoneResult> {
  await requireAdmin(["SUPER_ADMIN", "GESTIONNAIRE"]);

  const parsed = DeliveryZoneSchema.safeParse({
    name: formData.get("name"),
    fee: formData.get("fee"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { name, fee } = parsed.data;

  const duplicate = await prisma.deliveryZone.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(zoneId ? { id: { not: zoneId } } : {}),
    },
    select: { id: true },
  });
  if (duplicate) {
    return { ok: false, fieldErrors: { name: ["Une zone avec ce nom existe déjà"] } };
  }

  try {
    if (zoneId) {
      await prisma.deliveryZone.update({ where: { id: zoneId }, data: { name, fee } });
    } else {
      await prisma.deliveryZone.create({ data: { name, fee } });
    }
  } catch (err) {
    console.error("[saveDeliveryZone]", err);
    return { ok: false, message: "Une erreur est survenue, réessaie" };
  }

  revalidateZones();
  return { ok: true };
}

export async function setDeliveryZoneActive(
  zoneId: string,
  isActive: boolean,
): Promise<DeliveryZoneResult> {
  await requireAdmin(["SUPER_ADMIN", "GESTIONNAIRE"]);

  try {
    await prisma.deliveryZone.update({ where: { id: zoneId }, data: { isActive } });
  } catch (err) {
    console.error("[setDeliveryZoneActive]", err);
    return { ok: false, message: "Une erreur est survenue, réessaie" };
  }

  revalidateZones();
  return { ok: true };
}
