import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validatePropertyPayload } from "../validators.js";
import { randomSuffix, slugify } from "../utils/slug.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "") || ".jpg";
    cb(null, `${Date.now()}-${randomSuffix()}${extension}`);
  }
});

const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_UPLOAD_MAX_MB = IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024);
const IMAGE_UPLOAD_TOO_LARGE_MESSAGE = `La imagen supera el tamano permitido de ${IMAGE_UPLOAD_MAX_MB} MB. Elegi un archivo mas liviano.`;

const upload = multer({
  storage,
  limits: {
    fileSize: IMAGE_UPLOAD_MAX_BYTES
  }
});

function parsePropertyBody(req) {
  const body = req.body || {};
  const parsedImages = Array.isArray(body.images)
    ? body.images
    : JSON.parse(body.images || "[]");

  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    category: body.category,
    operationStatus: body.operationStatus,
    price: Number(body.price),
    currency: body.currency,
    totalM2: Number(body.totalM2),
    coveredM2: Number(body.coveredM2),
    rooms: Number(body.rooms),
    bathrooms: Number(body.bathrooms),
    garageSpots: Number(body.garageSpots),
    address: String(body.address || "").trim(),
    neighborhood: String(body.neighborhood || "").trim(),
    city: String(body.city || "").trim(),
    branch: String(body.branch || "").trim(),
    published: String(body.published).toLowerCase() !== "false",
    images: parsedImages
  };
}

const includeImages = {
  images: {
    orderBy: {
      sortOrder: "asc"
    }
  }
};

router.use(requireAuth);

router.get("/properties", async (_req, res) => {
  const properties = await prisma.property.findMany({
    include: includeImages,
    orderBy: { createdAt: "desc" }
  });
  res.json(properties);
});

router.post("/properties", async (req, res) => {
  const payload = parsePropertyBody(req);
  const validationError = validatePropertyPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const baseSlug = slugify(payload.title);
  let slug = `${baseSlug}-${randomSuffix()}`;

  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  const property = await prisma.property.create({
    data: {
      ...payload,
      slug,
      images: {
        create: payload.images.map((image, index) => ({
          url: String(image.url),
          alt: image.alt ? String(image.alt) : null,
          sortOrder:
            Number.isInteger(image.sortOrder) && image.sortOrder >= 0
              ? image.sortOrder
              : index
        }))
      }
    },
    include: includeImages
  });

  return res.status(201).json(property);
});

router.put("/properties/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalido." });
  }

  const payload = parsePropertyBody(req);
  const validationError = validatePropertyPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Propiedad no encontrada." });
  }

  let slug = existing.slug;
  if (existing.title !== payload.title) {
    const baseSlug = slugify(payload.title);
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...payload,
      slug,
      images: {
        deleteMany: {},
        create: payload.images.map((image, index) => ({
          url: String(image.url),
          alt: image.alt ? String(image.alt) : null,
          sortOrder:
            Number.isInteger(image.sortOrder) && image.sortOrder >= 0
              ? image.sortOrder
              : index
        }))
      }
    },
    include: includeImages
  });

  return res.json(property);
});

router.delete("/properties/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalido." });
  }

  await prisma.property.delete({ where: { id } });
  return res.status(204).send();
});

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: IMAGE_UPLOAD_TOO_LARGE_MESSAGE });
    }

    if (error) {
      console.error("Error al subir imagen:", error.message);
      return res.status(500).json({ message: "No se pudo subir la imagen." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se envio archivo." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({ url: fileUrl });
  });
});

export default router;
