import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL manquant dans .env");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Nettoyage du catalogue…");
  // ordre FK-safe : les enfants avant les parents
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Catégories…");
  const [cap, beanies, buckets, snapback] = await Promise.all([
    prisma.category.create({
      data: { name: "Casquettes", slug: "cap", description: "Casquettes ajustables et fittées." },
    }),
    prisma.category.create({
      data: { name: "Bonnets", slug: "beanies", description: "Bonnets pour toutes les saisons." },
    }),
    prisma.category.create({
      data: { name: "Bobs", slug: "buckets", description: "Bobs et chapeaux d'été." },
    }),
    prisma.category.create({
      data: { name: "Snapbacks", slug: "snapback", description: "Snapbacks à visière plate." },
    }),
  ]);

  console.log("Produits…");
  await prisma.product.create({
    data: {
      name: "Casquette Classic Noire",
      slug: "casquette-classic-noire",
      description: "Casquette 6 panneaux en coton lourd, boucle métal réglable.",
      categoryId: cap.id,
      basePrice: 6500,
      isActive: true,
      isBestSeller: true,
      isFeatured: true,
      images: {
        create: [
          { url: "/images/best-seller-cap.png", altText: "Casquette Classic Noire, face", position: 0 },
          { url: "/images/category-card-cap.png", altText: "Casquette Classic Noire, portée", position: 1 },
        ],
      },
      variants: {
        create: [
          { sku: "CAP-CLS-BLK", color: "Noir", size: "Unique", stock: 30 },
          { sku: "CAP-CLS-BEI", color: "Beige", size: "Unique", stock: 18 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Casquette Trucker Mesh",
      slug: "casquette-trucker-mesh",
      description: "Trucker à filet respirant, fermeture snap arrière.",
      categoryId: cap.id,
      basePrice: 7000,
      promoPrice: 5500,
      isActive: true,
      isNew: true,
      images: {
        create: [
          { url: "/images/category-card-cap.png", altText: "Casquette Trucker Mesh", position: 0 },
        ],
      },
      variants: {
        create: [
          { sku: "CAP-TRK-BLK", color: "Noir", size: "Unique", stock: 22 },
          { sku: "CAP-TRK-RED", color: "Rouge", size: "Unique", stock: 10 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Bonnet Côtelé",
      slug: "bonnet-cotele",
      description: "Maille côtelée épaisse, revers double épaisseur.",
      categoryId: beanies.id,
      basePrice: 4500,
      isActive: true,
      isBestSeller: true,
      images: {
        create: [
          { url: "/images/best-seller-beanie.png", altText: "Bonnet Côtelé gris", position: 0 },
          { url: "/images/best-seller-beanie2.png", altText: "Bonnet Côtelé, autre angle", position: 1 },
        ],
      },
      variants: {
        create: [
          { sku: "BEA-COT-GRY", color: "Gris", size: "Unique", stock: 40 },
          { sku: "BEA-COT-BLK", color: "Noir", size: "Unique", stock: 35 },
          { sku: "BEA-COT-CRM", color: "Crème", size: "Unique", stock: 12 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Bonnet Fisherman",
      slug: "bonnet-fisherman",
      description: "Bonnet court style docker, laine mélangée.",
      categoryId: beanies.id,
      basePrice: 5000,
      isActive: true,
      isNew: true,
      isFeatured: true,
      images: {
        create: [
          { url: "/images/category-card-beanie.png", altText: "Bonnet Fisherman", position: 0 },
        ],
      },
      variants: {
        create: [
          { sku: "BEA-FSH-NVY", color: "Marine", size: "Unique", stock: 20 },
          { sku: "BEA-FSH-OLV", color: "Olive", size: "Unique", stock: 15 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Bob Réversible",
      slug: "bob-reversible",
      description: "Bob deux faces : uni d'un côté, imprimé de l'autre.",
      categoryId: buckets.id,
      basePrice: 5500,
      isActive: true,
      isFeatured: true,
      images: {
        create: [
          { url: "/images/best-seller-fedora.png", altText: "Bob Réversible kaki", position: 0 },
          { url: "/images/category-card-bucket.png", altText: "Bob Réversible, face imprimée", position: 1 },
        ],
      },
      variants: {
        create: [
          { sku: "BOB-REV-KHK-SM", color: "Kaki", size: "S/M", stock: 12 },
          { sku: "BOB-REV-KHK-LXL", color: "Kaki", size: "L/XL", stock: 9 },
          { sku: "BOB-REV-BLK-SM", color: "Noir", size: "S/M", stock: 7 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Snapback Flat Visor",
      slug: "snapback-flat-visor",
      description: "Visière plate rigide, structure haute 6 panneaux.",
      categoryId: snapback.id,
      basePrice: 8000,
      promoPrice: 6900,
      isActive: true,
      isBestSeller: true,
      images: {
        create: [
          { url: "/images/category-card-snapback.png", altText: "Snapback Flat Visor", position: 0 },
        ],
      },
      variants: {
        create: [
          { sku: "SNP-FLT-BLK", color: "Noir", size: "Unique", stock: 25 },
          { sku: "SNP-FLT-WHT", color: "Blanc", size: "Unique", stock: 14 },
        ],
      },
    },
  });

  const count = await prisma.product.count();
  console.log(`Seed terminé : ${count} produits.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
