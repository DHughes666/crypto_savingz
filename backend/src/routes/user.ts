import express from "express";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const router = express.Router();

function calculateLevelFromXP(xp: number) {
  // Simple progression formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100));
}

// 🔐 Register User (called after Firebase registration)
router.post("/register", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;
    const { email } = req.body;

    const user = await prisma.user.upsert({
      where: { firebaseId },
      update: {},
      create: {
        firebaseId,
        email,
        role: "",
        firstName: "",
        lastName: "",
      },
    });

    res.json(user);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

export default router;
