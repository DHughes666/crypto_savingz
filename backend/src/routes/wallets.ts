import express from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

const TATUM_API = "https://api.tatum.io/v3";
const TATUM_API_KEY = process.env.TATUM_API_KEY!;

// POST /wallet/create
router.post("/create", authenticate, async (req, res) => {
  const userId = (req as any).firebaseId;

  try {
    // 1. Create BTC wallet
    const walletRes = await axios.get(`${TATUM_API}/bitcoin/wallet`, {
      headers: { "x-api-key": TATUM_API_KEY },
    });

    const { xpub } = walletRes.data;

    // 2. Store in DB
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        currency: "BTC",
        xpub,
      },
    });

    res.status(201).json(wallet);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Wallet creation failed" });
  }
});

export default router;
