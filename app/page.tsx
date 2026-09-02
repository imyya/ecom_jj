import BestSellers from "@/components/home/BestSellers";
import BrandStory from "@/components/home/BrandStory";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import Hero from "@/components/home/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <div >
      <Hero/>
      <FeaturedCategories/>
      <BestSellers/>
      <BrandStory/>
    </div>
  );
}
