import Image from 'next/image';
import React from 'react';
import storyImage from "@/public/images/story-image.png" 
const BrandStory = () => {
    return (
        <div className='bg-secondary flex'>
            <Image alt='story Image' src={storyImage} ></Image>
            <div className='flex-1'>
                <h3>Crafted For Every Head</h3>
            </div>
            
        </div>
    );
}

export default BrandStory;
