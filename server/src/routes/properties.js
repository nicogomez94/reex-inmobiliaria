import { Router } from "express";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";

const router = Router();

const propertyInclude = {
  images: {
    orderBy: {
      sortOrder: "asc"
    }
  }
};

router.get("/", async (req, res) => {
  const { category, operationStatus } = req.query;

  const where = {
    published: true
  };

  if (category) {
    where.category = category;
  }

  if (operationStatus) {
    where.operationStatus = operationStatus;
  }

  const properties = await prisma.property.findMany({
    where,
    include: propertyInclude,
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(properties);
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  const property = await prisma.property.findUnique({
    where: { slug },
    include: propertyInclude
  });

  if (!property || !property.published) {
    return res.status(404).json({ message: "Propiedad no encontrada." });
  }

  return res.json(property);
});

router.get("/:slug/qr", async (req, res) => {
  const { slug } = req.params;

  const property = await prisma.property.findUnique({
    where: { slug },
    select: { slug: true }
  });

  if (!property) {
    return res.status(404).json({ message: "Propiedad no encontrada." });
  }

  const rawSiteUrl = process.env.SITE_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const siteUrl = /^https?:\/\//i.test(rawSiteUrl)
    ? rawSiteUrl
    : `https://${rawSiteUrl}`;

  const propertyUrl = `${siteUrl}/propiedades/ficha/${property.slug}`;
  const qrBuffer = await QRCode.toBuffer(propertyUrl, { type: "png", width: 400 });

  res.set("Content-Type", "image/png");
  res.set("Content-Disposition", `inline; filename="qr-${slug}.png"`);
  return res.send(qrBuffer);
});

export default router;
