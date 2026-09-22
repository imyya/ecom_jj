import BestSellers from "@/components/home/BestSellers";
import BrandStory from "@/components/home/BrandStory";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import Hero from "@/components/home/Hero";
import { CategoryListItem, listCategories } from "@/features/category/queries";
import { BestSellersListItem, listBestSellers } from "@/features/product/queries";
import Image from "next/image";

export default async function Home() {
    const categs: CategoryListItem[] = await listCategories()
    const bestSellers:BestSellersListItem[] = await listBestSellers()

  return (
    <div >
      <Hero/>
      <FeaturedCategories categories={categs}/>
      <BestSellers bestSellers={bestSellers}/>
      <BrandStory/>
    </div>
  );
}
