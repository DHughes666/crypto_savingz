import express from "express";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// 🔧 Ping route for debugging
router.get("/ping", (req, res) => {
  res.send("pong");
});

router.post("/register", authenticate, async (req, res) => {
  const firebaseId = req.firebaseId!;
  const { email } = req.body;

  const user = await prisma.user.upsert({
    where: { firebaseId },
    update: {},
    create: { firebaseId, email },
  });

  res.json(user);
});

router.post("/save", authenticate, async (req, res) => {
  const firebaseId = req.firebaseId!;
  const { amount, crypto } = req.body;

  const user = await prisma.user.findUnique({ where: { firebaseId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const saving = await prisma.saving.create({
    data: {
      userId: user.id,
      amount: parseFloat(amount),
      crypto,
    },
  });

  res.json(saving);
});

router.get("/savings", authenticate, async (req, res) => {
  console.log("GET /savings hit");

  const firebaseId = req.firebaseId!;
  const user = await prisma.user.findUnique({
    where: { firebaseId },
    include: { savings: true },
  });

  if (!user) {
    console.log("User not found in database for firebaseId:", firebaseId);
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user.savings);
});

router.get("/profile", authenticate, async (req, res) => {
  const firebaseId = req.firebaseId!;
  const user = await prisma.user.findUnique({
    where: { firebaseId },
    select: {
      id: true,
      email: true,
      savings: {
        select: {
          amount: true,
          crypto: true,
          timestamp: true,
        },
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
});

export default router;
