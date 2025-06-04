import admin from "../firebase";
import { Request, Response, NextFunction } from "express";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseId = decoded.uid; // ✅ type-safe now
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
