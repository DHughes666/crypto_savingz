import express from "express";
import axios from "axios";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const TATUM_API_KEY = process.env.TATUM_API_KEY!;
const TATUM_API_URL = process.env.TATUM_API_URL || "https://api.tatum.io";

// 👇 POST /api/wallets
router.post("/", authenticate, async (req, res) => {
  const userId = (req as any).firebaseId;

  try {
    const existing = await prisma.wallet.findFirst({ where: { userId } });
    if (existing) return res.json(existing);

    const currency = "ETH"; // You can later allow switching this
    const response = await axios.post(
      `${TATUM_API_URL}/v3/ethereum/wallet`,
      {},
      { headers: { "x-api-key": TATUM_API_KEY } }
    );

    const { xpub } = response.data;

    // Derive address from xpub
    const addrRes = await axios.get(
      `${TATUM_API_URL}/v3/ethereum/address/${xpub}/0`,
      { headers: { "x-api-key": TATUM_API_KEY } }
    );

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        address: addrRes.data,
        currency,
        xpub, // ✅ Required field
        provider: "Tatum",
      },
    });

    res.json(wallet);
  } catch (err) {
    console.error("Wallet creation failed:", err);
    res.status(500).json({ error: "Wallet creation failed" });
  }
});

export default router;
