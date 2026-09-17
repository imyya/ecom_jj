import { listDeliveryZones } from '@/features/deliveryZone/queries';
import React from 'react';

const Page =async ({ searchParams }: PageProps<"/order">) => {
    const {variantId, quantity} = await searchParams
    const deliveryZones = await listDeliveryZones()
    return (
        <div>
            
        </div>
    );
}

export default Page;
