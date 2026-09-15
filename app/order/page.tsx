import React from 'react';

const Page =async ({ searchParams }: PageProps<"/order">) => {
    const {variantId, quantity} = await searchParams
    
    return (
        <div>
            
        </div>
    );
}

export default Page;
