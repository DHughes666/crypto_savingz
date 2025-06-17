import crypto from "crypto";

const ENCRYPTION_KEY = process.env.MNEMONIC_ENCRYPTION_KEY || ""; // 32 characters
const IV_LENGTH = 16; // AES block size in bytes

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    "❌ MNEMONIC_ENCRYPTION_KEY must be exactly 32 characters long."
  );
}

/**
 * Encrypts a mnemonic string using AES-256-CBC
 * Returns a string like: iv:encrypted
 */
export function encryptMnemonic(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypts an encrypted mnemonic string using AES-256-CBC
 * Input format must be: iv:encryptedHex
 */
export function decryptMnemonic(encryptedText: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedTextBuffer = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}
