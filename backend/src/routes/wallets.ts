import express from "express";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { generateWalletAndAddress } from "../lib/ethersClient";
import { encryptMnemonic, decryptMnemonic } from "../lib/cryptoUtils";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Supported EVM chains — you can add "ETH", "POLYGON" later
const supportedChains = ["BNB"];

router.post("/", authenticate, async (req, res) => {
  const firebaseId = (req as any).firebaseId;
  let { currency = "BNB" } = req.body as { currency?: string };
  currency = currency.toUpperCase();

  if (!supportedChains.includes(currency)) {
    console.warn(
      `Invalid currency '${currency}' requested. Defaulting to BNB.`
    );
    currency = "BNB";
  }

  try {
    // ✅ Get user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // ✅ Check for existing wallet
    const existing = await prisma.wallet.findFirst({
      where: { userId, currency },
    });
    if (existing) return res.json(existing);

    // ✅ Generate wallet using ethers.js
    const { address, xpub, mnemonic, privateKey } =
      await generateWalletAndAddress(currency);
    const encryptedMnemonic = encryptMnemonic(mnemonic || "");

    // ⚠️ Store sensitive data carefully (not recommended in plaintext)
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        currency,
        address,
        xpub: xpub || undefined,
        mnemonicEncrypted: encryptedMnemonic,
        provider: "ethers.js",
      },
    });

    // ✅ Send minimal safe data to frontend
    res.json({
      id: wallet.id,
      address: wallet.address,
      currency: wallet.currency,
      provider: wallet.provider,
      createdAt: wallet.createdAt,
    });
  } catch (err: any) {
    console.error("Wallet creation failed:", err.message || err);
    res.status(500).json({ error: "Wallet creation failed" });
  }
});

router.get("/mnemonic/:walletId", authenticate, async (req, res) => {
  const { walletId } = req.params;
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });

  if (!wallet?.mnemonicEncrypted) {
    return res.status(404).json({ error: "Mnemonic not found" });
  }

  try {
    const mnemonic = decryptMnemonic(wallet.mnemonicEncrypted);
    res.json({ mnemonic });
  } catch (err) {
    res.status(500).json({ error: "Failed to decrypt mnemonic" });
  }
});

export default router;
