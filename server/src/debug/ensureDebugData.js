import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { randomSuffix, slugify } from "../utils/slug.js";
import { argenpropProperties } from "../data/argenpropProperties.js";

export async function ensureDebugData() {
  if (String(process.env.DEBUG_MODE).toLowerCase() !== "true") {
    return;
  }

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash }
  });

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
    await prisma.property.create({
      data: { ...property, slug: `${slugify(property.title)}-${randomSuffix()}`, images: { create: images } }
    });
  }
}
