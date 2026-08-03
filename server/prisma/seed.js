import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { argenpropProperties } from "../src/data/argenpropProperties.js";

dotenv.config();

const prisma = new PrismaClient();

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function upsertAdminUser() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash }
  });
}

async function seedDebugProperties() {
  await prisma.property.deleteMany({
    where: {
      title: { in: ["PH con patio en Villa Urquiza", "Casa con jardín en Villa Urquiza", "Proyecto de departamentos céntricos"] }
    }
  });

  for (const item of argenpropProperties) {
    const { images, ...property } = item;
    const existing = await prisma.property.findFirst({ where: { title: property.title } });
    if (existing) {
      await prisma.property.update({ where: { id: existing.id }, data: property });
      continue;
    }
    await prisma.property.create({ data: { ...property, slug: `${slugify(property.title)}-${Math.floor(Math.random() * 100000)}`, images: { create: images } } });
  }
}

async function main() {
  await upsertAdminUser();

  if (String(process.env.DEBUG_MODE).toLowerCase() === "true") {
    await seedDebugProperties();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed finalizado.");
  })
  .catch(async (error) => {
    console.error("Error ejecutando seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
