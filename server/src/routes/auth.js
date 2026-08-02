import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y clave son requeridos." });
  }

  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin) {
    return res.status(401).json({ message: "Credenciales invalidas." });
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Credenciales invalidas." });
  }

  const token = jwt.sign(
    { sub: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    token,
    user: {
      id: admin.id,
      username: admin.username
    }
  });
});

export default router;
