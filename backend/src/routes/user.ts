import express from "express";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

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

const cryptoIdMap: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
};

router.post("/save", authenticate, async (req, res) => {
  const firebaseId = (req as any).firebaseId;
  const { amount, crypto } = req.body;

  const user = await prisma.user.findUnique({
    where: { firebaseId },
  });

  if (!user) {
    console.error("User not found in database for firebaseId:", firebaseId);
    return res.status(404).json({ error: "User not found" });
  }

  // Fetch live crypto price from CoinGecko
  const priceRes = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price`,
    {
      params: {
        ids: cryptoIdMap[crypto], // see below
        vs_currencies: "usd",
      },
    }
  );

  const price = priceRes.data?.[cryptoIdMap[crypto]]?.usd;

  if (!price) return res.status(400).json({ error: "Failed to fetch price" });

  const cryptoQty = parseFloat(amount) / price;

  const saving = await prisma.saving.create({
    data: {
      userId: user.id,
      amount: parseFloat(amount),
      crypto,
      cryptoQty,
    },
  });

  res.json(saving);
});

router.get("/savings", authenticate, async (req, res) => {
  const firebaseId = (req as any).firebaseId;
  const user = await prisma.user.findUnique({
    where: { firebaseId },
    include: { savings: true },
  });

  if (!user) {
    console.error("User not found in database for firebaseId:", firebaseId);
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user.savings);
});

router.get("/profile", authenticate, async (req, res) => {
  const firebaseId = (req as any).firebaseId;

  const user = await prisma.user.findUnique({
    where: { firebaseId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      savings: {
        select: {
          amount: true,
          crypto: true,
          timestamp: true,
        },
      },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
});

router.get("/notifications", authenticate, async (req, res) => {
  const firebaseId = (req as any).firebaseId;

  const user = await prisma.user.findUnique({
    where: { firebaseId },
    select: { id: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  // Placeholder notifications — replace with DB table later
  const notifications = [
    {
      id: 1,
      title: "🎉 Welcome to CryptoSaver!",
      message: "Your journey to smart crypto saving starts now.",
      date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "🚀 BTC up 4% today!",
      message: "You’re earning while others are guessing.",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  res.json(notifications);
});

export default router;
