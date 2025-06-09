import express from "express";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Middleware: Ensure user is admin (basic role check for now)
router.use(authenticate, async (req, res, next) => {
  const firebaseId = req.firebaseId;

  const user = await prisma.user.findUnique({ where: { firebaseId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isAdmin = user.email.endsWith("@yourdomain.com"); // Replace with proper role logic
  if (!isAdmin) return res.status(403).json({ error: "Unauthorized" });

  (req as any).adminUser = user;
  next();
});

router.post("/send-notification", async (req, res) => {
  const { title, message } = req.body;
  const sender = (req as any).adminUser;

  try {
    // 1. Save broadcast record
    await prisma.broadcastNotification.create({
      data: {
        title,
        message,
        senderId: sender.id,
      },
    });

    // 2. Get all users
    const users = await prisma.user.findMany();

    // 3. Loop through and create individual notifications
    const notifications = users.map((user) =>
      prisma.notification.create({
        data: {
          title,
          message,
          userId: user.id,
        },
      })
    );

    // 4. (Optional) Send FCM push notifications
    const pushMessages = users
      .filter((u) => u.pushToken)
      .map((user) => ({
        token: user.pushToken!,
        notification: {
          title,
          body: message,
        },
      }));

    const [savedNotifications] = await Promise.all([
      Promise.all(notifications),
      pushMessages.length
        ? admin
            .messaging()
            .sendEach(
              pushMessages.map((msg) => ({
                token: msg.token,
                notification: msg.notification,
              }))
            )
        : null,
    ]);

    res.json({
      success: true,
      count: savedNotifications.length,
      message: "Notification sent to all users",
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
