"use client"
import Image from "next/image";
import Link from "next/link";
import brandStory from "@/public/images/story-image.png";
import Container from "../ui/Container";
import {Variants,motion} from "motion/react"

const imageVariant:Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const textVariant:Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.15 } },
};

export default function BrandStory() {
  return (
    <section className="">
      <Container className="grid grid-cols-1 items-center gap-8 py-16 sm:py-24 md:grid-cols-2 md:gap-16">
        <motion.div
          variants={imageVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
         className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image
            src={brandStory}
            alt="Un modèle portant un bonnet Jiiro"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          variants={textVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Conçu pour chaque tête
          </h2>
          <p className="mt-4 text-neutral-600">
            Chaque pièce Jiiro est pensée pour durer : des matières
            confortables, des finitions soignées, et un style qui s'adapte à
            votre quotidien — du marché au bureau, de la rue à la plage.
          </p>
          <Link
            href="/boutique"
            className="mt-6 inline-block border border-neutral-900 px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-primary hover:text-white rounded-sm"
          >
            Découvrir la collection
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
