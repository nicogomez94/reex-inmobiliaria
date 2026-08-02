import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { randomSuffix, slugify } from "../utils/slug.js";

const debugProperties = [
  {
    title: "PH con patio en Villa Urquiza",
    description:
      "Casa luminosa con ambientes amplios, patio y cocina integrada. Una opción cómoda para vivir cerca del centro.",
    category: "PROPIEDADES",
    operationStatus: "EN_VENTA",
    price: 185000,
    currency: "USD",
    totalM2: 78,
    coveredM2: 70,
    rooms: 3,
    bathrooms: 2,
    garageSpots: 1,
    address: "Ubicación reservada",
    neighborhood: "Villa Urquiza",
    city: "Ciudad de Buenos Aires",
    branch: "Villa Urquiza",
    published: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
        alt: "Living de PH en Villa Urquiza",
        sortOrder: 0
      }
    ]
  },
  {
    title: "Proyecto de departamentos céntricos",
    description:
      "Unidades funcionales con excelente ubicación y financiación durante obra.",
    category: "EMPRENDIMIENTOS",
    operationStatus: "EN_POZO",
    price: 89000,
    currency: "USD",
    totalM2: 48,
    coveredM2: 42,
    rooms: 2,
    bathrooms: 1,
    garageSpots: 0,
    address: "Ubicación reservada",
    neighborhood: "Villa Urquiza",
    city: "Ciudad de Buenos Aires",
    branch: "Villa Urquiza",
    published: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        alt: "Proyecto de departamentos en Villa Urquiza",
        sortOrder: 0
      }
    ]
  }
];

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

  const currentCount = await prisma.property.count();
  if (currentCount > 0) {
    return;
  }

  for (const item of debugProperties) {
    const { images, ...property } = item;
    await prisma.property.create({
      data: {
        ...property,
        slug: `${slugify(property.title)}-${randomSuffix()}`,
        images: {
          create: images
        }
      }
    });
  }
}
