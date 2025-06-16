import express from "express";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// 🔐 Register or sync user (called after Firebase registration or login)
router.post("/register", authenticate, async (req, res) => {
  const firebaseId = (req as any).firebaseId;
  const { email } = req.body;

  if (!firebaseId || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { firebaseId } });

    if (existing) {
      // Optional: update email if it has changed
      if (existing.email !== email) {
        await prisma.user.update({
          where: { firebaseId },
          data: { email },
        });
      }

      return res.status(200).json(existing);
    }

    const user = await prisma.user.create({
      data: {
        firebaseId,
        email,
        role: "user",
        firstName: "",
        lastName: "",
      },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register or sync user" });
  }
});

export default router;
