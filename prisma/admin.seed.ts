import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL manquant dans .env");

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "Super Admin";

if (!email || !password) {
  throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env");
}
if (password.length < 7) {
  throw new Error("ADMIN_PASSWORD doit faire au moins 10 caractères");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash(password!, 12);

  const admin = await prisma.admin.upsert({
    where: { email: email!.toLowerCase() },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: email!.toLowerCase(),
      password: hashedPassword,
      name,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Super admin prêt : ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
