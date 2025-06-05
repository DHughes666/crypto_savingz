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
