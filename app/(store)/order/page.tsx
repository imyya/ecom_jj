import Container from "@/components/ui/Container";
import { listDeliveryZones } from "@/features/deliveryZone/queries";
import CheckoutForm from "@/features/order/components/CheckoutForm";
import React from "react";

const Page = async ({ searchParams }: PageProps<"/order">) => {
  const { variantId, quantity } = await searchParams;
  const deliveryZones = await listDeliveryZones();
  return (
    <Container className="py-12 lg:py-16">
      <h1 className="mb-8 text-2xl font-bold font-heading text-slate-900">
        Vos informations
      </h1>
      <CheckoutForm deliveryZones={deliveryZones} />
    </Container>
  );
};

export default Page;
