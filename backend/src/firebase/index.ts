import admin from "firebase-admin";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const serviceAccountPath = path.resolve(
  process.env.FIREBASE_ADMIN_SDK_PATH || ""
);

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `❌ Firebase service account file not found at: ${serviceAccountPath}`
  );
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
