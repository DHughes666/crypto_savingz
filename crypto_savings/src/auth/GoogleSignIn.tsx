import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { Button } from "react-native-paper";
import { auth } from "../firebase/config";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import axios from "axios";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
  const {
    EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  } = Constants.expoConfig?.extra || {};

  const { API_URL } = Constants.expoConfig?.extra || {};
  const redirectUri = "https://auth.expo.io/@dresden23i/crypto-saver";
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential).then(async (userCredential) => {
        const token = await userCredential.user.getIdToken();

        await axios.post(
          `${API_URL}/api/user/register`,
          {
            email: userCredential.user.email,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      });
    }
  }, [response]);

  return (
    <Button
      mode="contained"
      onPress={() => promptAsync()}
      disabled={!request}
      style={{ marginVertical: 10 }}
    >
      Sign in with Google
    </Button>
  );
}
