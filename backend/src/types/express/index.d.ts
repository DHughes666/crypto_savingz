// backend/src/types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      firebaseId?: string;
    }
  }
}
