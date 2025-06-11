// src/context/UnifiedAuthProvider.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

interface Saving {
  amount: number;
  crypto: string;
  timestamp: string;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  streakCount: number;
  lastSavedDate: Date;
  xp: number;
  level: number;
  createdAt: string;
  savings: Saving[];
}

interface UnifiedAuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(
  undefined
);

export const UnifiedAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        await ensureUserExistsAndLoadProfile(user);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const ensureUserExistsAndLoadProfile = async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();

      // 🔍 Try fetching profile first
      const profileRes = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(profileRes.data);
    } catch (err: any) {
      // ❌ If not found, register and retry
      if (err.response?.status === 404) {
        try {
          const token = await user.getIdToken();

          // 🧾 Register new user
          await axios.post(
            `${API_URL}/api/user/register`,
            { email: user.email },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // 💤 Small delay to ensure DB commit completes
          await new Promise((res) => setTimeout(res, 500));

          // 🔁 Retry fetching profile
          const retryToken = await user.getIdToken(true); // refresh token
          const retryRes = await axios.get(`${API_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${retryToken}` },
          });
          setUserProfile(retryRes.data);
        } catch (registerErr) {
          console.error("Registration or retry fetch failed:", registerErr);
          setUserProfile(null);
        }
      } else {
        console.error("Fetch profile error:", err.response?.data || err);
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (firebaseUser) {
      setLoading(true);
      await ensureUserExistsAndLoadProfile(firebaseUser);
    }
  };

  return (
    <UnifiedAuthContext.Provider
      value={{ firebaseUser, userProfile, loading, refreshUserProfile }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error("useUnifiedAuth must be used within UnifiedAuthProvider");
  }
  return context;
};
