import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri, ResponseType } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { auth } from "./firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID!, // This is now used universally
    responseType: ResponseType.IdToken,
    redirectUri: makeRedirectUri({
      // ❌ no useProxy — it's been removed in newer versions
      // ✅ default behavior is proxy in Expo Go, so no need to set manually
    }),
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type === "success") {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      }
    };
    signInWithGoogle();
  }, [response]);

  return { promptAsync, request };
};
