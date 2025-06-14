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
        streakCount: 0,
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

// 🏆 Get Leaderboard (Top 10 users by total saved)
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        savings: {
          select: {
            amount: true,
          },
        },
      },
    });

    const ranked = users
      .map((user) => {
        const total = user.savings.reduce((sum, s) => sum + s.amount, 0);
        return {
          id: user.id,
          email: user.email,
          name:
            user.firstName || user.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user.email,
          totalSaved: total,
        };
      })
      .sort((a, b) => b.totalSaved - a.totalSaved)
      .slice(0, 10);

    res.json(ranked);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// 🔁 Update User Profile
router.post("/profile/update", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;
    const { firstName, lastName } = req.body;

    const user = await prisma.user.update({
      where: { firebaseId },
      data: { firstName, lastName },
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// 🧾 Get Profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;

    const user = await prisma.user.findUnique({
      where: { firebaseId },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        streakCount: true,
        xp: true,
        level: true,
        lastName: true,
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
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 💰 Save Crypto + XP + Level-Up
router.post("/save", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;
    const { amount, crypto } = req.body;

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const cryptoIdMap: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      BNB: "binancecoin",
      SOL: "solana",
      XRP: "ripple",
      PUMPAI: "pumpai",
      HMSTR: "hamster",
    };

    const priceRes = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: cryptoIdMap[crypto],
          vs_currencies: "usd",
        },
      }
    );

    const price = priceRes.data?.[cryptoIdMap[crypto]]?.usd;
    if (!price) return res.status(400).json({ error: "Price fetch failed" });

    const cryptoQty = parseFloat(amount) / price;

    // 1 XP per $1 saved
    const xpEarned = Math.floor(parseFloat(amount));
    const updatedXP = (user.xp || 0) + xpEarned;
    const newLevel = calculateLevelFromXP(updatedXP);

    const saving = await prisma.saving.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        crypto,
        cryptoQty,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: updatedXP,
        level: newLevel,
        lastSavedDate: new Date(),
      },
    });

    res.json({
      success: true,
      saving,
      xpEarned,
      newXP: updatedXP,
      newLevel,
    });
  } catch (err) {
    console.error("Saving error:", err);
    res.status(500).json({ error: "Failed to save" });
  }
});

// 📊 Get Savings
router.get("/savings", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;
    const user = await prisma.user.findUnique({
      where: { firebaseId },
      include: { savings: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.savings);
  } catch (err) {
    console.error("Fetch savings error:", err);
    res.status(500).json({ error: "Failed to fetch savings" });
  }
});

// 🔔 Get Notifications
router.get("/notifications", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    res.json(notifications);
  } catch (err) {
    console.error("Notifications fetch error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ✅ Mark All Notifications as Read
router.patch("/notifications/read-all", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Mark notifications error:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// 🔢 Get Unread Notification Count
router.get("/notifications/unread-count", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    res.json({ count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ error: "Failed to get count" });
  }
});

// 📲 Save Push Notification Token
router.post("/push-token", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;
    const { token } = req.body;

    await prisma.user.update({
      where: { firebaseId },
      data: { pushToken: token },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Push token error:", err);
    res.status(500).json({ error: "Failed to save token" });
  }
});

// 🛡 Admin: Send Broadcast Notification
router.post("/admin/send-notification", authenticate, async (req, res) => {
  try {
    const firebaseId = (req as any).firebaseId;
    const { title, message } = req.body;

    const sender = await prisma.user.findUnique({ where: { firebaseId } });
    if (!sender || sender.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const tokens = await prisma.deviceToken.findMany();
    if (tokens.length === 0) {
      return res.status(404).json({ error: "No devices to notify" });
    }

    const payload = {
      notification: { title, body: message },
    };

    const fcmRes = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registration_ids: tokens.map((t) => t.token),
        notification: payload.notification,
      }),
    });

    const fcmResult = await fcmRes.json();

    await prisma.broadcastNotification.create({
      data: {
        title,
        message,
        senderId: sender.id,
      },
    });
    if (!sender || sender.role !== "admin")
      return res.status(404).json({ error: "Not an Admin" });

    res.json({ success: true, fcmResult });
  } catch (err) {
    console.error("Admin notification error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

export default router;
