import "dotenv/config";

export default {
  expo: {
    name: "savingz-tatum",
    slug: "savingz-tatum",
    version: "1.0.0",
    scheme: "savingztatum", // ✅ Add this line
    extra: {
      COINGECKO_API: process.env.COINGECKO_API,
      API_URL: process.env.API_URL,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      GOOGLE_EXPO_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    },
  },
};
