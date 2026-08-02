import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import propertiesRouter from "./routes/properties.js";
import adminRouter from "./routes/admin.js";
import { ensureDebugData } from "./debug/ensureDebugData.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const rawClientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

function normalizeOrigin(value) {
  if (!value) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

function addAllowedOrigin(value, origins) {
  const origin = normalizeOrigin(value);
  if (!origin) {
    return;
  }

  origins.add(origin);

  const url = new URL(origin);
  const hostname = url.hostname;
  if (hostname.startsWith("www.")) {
    url.hostname = hostname.slice(4);
    origins.add(url.origin);
  } else if (!hostname.includes("localhost")) {
    url.hostname = `www.${hostname}`;
    origins.add(url.origin);
  }
}

const allowedOrigins = new Set();
addAllowedOrigin(rawClientOrigin, allowedOrigins);
addAllowedOrigin(process.env.SITE_URL, allowedOrigins);
addAllowedOrigin(process.env.RENDER_EXTERNAL_URL, allowedOrigins);

function isLocalDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === "production" || !origin) {
    return false;
  }

  try {
    const { hostname } = new URL(origin);
    return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
  } catch {
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origen no permitido: ${origin}`));
      }
    }
  })
);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

app.use("/health", healthRouter);
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/admin", adminRouter);

const clientDistDir = path.resolve(__dirname, "..", "..", "client", "dist");

if (process.env.NODE_ENV === "production" && fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDistDir, "index.html"));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ message: "Ruta no encontrada." });
  });
}

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});

ensureDebugData().catch((error) => {
  console.error("No se pudo inicializar debug data:", error.message);
});
