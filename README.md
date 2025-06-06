# 🪙 CryptoSaver — A Crypto Savings Mobile App

CryptoSaver is a cross-platform mobile app built with **Expo React Native**, powered by **Firebase Authentication**, a **Node.js + Express backend**, and a **Neon PostgreSQL database via Prisma ORM**. Users can securely register, log in, and track their cryptocurrency savings.

---

## 🚀 Features

- 📱 Expo React Native mobile app
- 🔐 Firebase Authentication (Email & Password)
- 🌐 Express.js backend (Node.js)
- 🧩 Prisma ORM + Neon PostgreSQL
- 🔄 User registration syncing between Firebase & Neon
- 📊 Dashboard with total savings and grouped coins
- 🔧 Secure API with token-based authentication

---

## 🧠 Developer Notes & Key Learnings

### 📦 Expo React Native

- Always include a properly configured `metro.config.js` when using advanced features or asset loading.
- React Native apps do **not** support `localhost` to connect to your backend — use your local IP address (get it via `ipconfig` on Windows or `ifconfig` on macOS/Linux).
- Expo reads environment variables from `.env`, but only those prefixed with `EXPO_PUBLIC_` are accessible in the frontend.

### 🔐 Firebase Auth with React Native

- Use `firebase/auth/react-native` and `@react-native-async-storage/async-storage` for correct persistence.
- After sign-in or registration with Firebase, call your backend’s `/register` endpoint to create the user in your PostgreSQL DB.

### 🌍 Backend API Access

- The backend must run on the same Wi-Fi network as the mobile device.
- Use `npx expo start -c` after changing `.env` or `app.config.ts` to clear Expo’s cache.
- Add a `ping` route in your Express app for quick connectivity checks.

---

## 📁 Folder Structure

```bash
crypto_savings/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── firebase/
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma
├── crypto_savings/
│   ├── screens/
│   ├── firebase/
│   ├── app.config.ts
│   ├── metro.config.js
│   └── .env
```

---

## 🛠 Setup Instructions

### ✅ 1. Clone the repo & install dependencies

```bash
git clone https://github.com/yourname/crypto_savings.git
cd crypto_savings

# Frontend
cd crypto_savings
npm install

# Backend
cd ../backend
npm install
```

### ✅ 2. Create `.env` Files

**Frontend: `/crypto_savings/.env`**

```env
EXPO_PUBLIC_API_URL=http://192.168.0.xxx:5000
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

**Backend: `/backend/.env`**

```env
DATABASE_URL=postgresql://your_user:your_password@ep-xxx.neon.tech/neondb?sslmode=require
FIREBASE_ADMIN_SDK_PATH=./serviceAccountKey.json
```

> Replace `192.168.0.xxx` with your actual system IP from `ipconfig`.

---

### ✅ 3. Configure `metro.config.js`

**Create `/crypto_savings/metro.config.js`:**

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("cjs");

module.exports = config;
```

---

### ✅ 4. Run the App

**Start backend:**

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Start frontend:**

```bash
cd crypto_savings
npx expo start --clear
```

---

## 🔧 API Endpoints

| Method | Endpoint             | Auth Required | Description                  |
| ------ | -------------------- | ------------- | ---------------------------- |
| POST   | `/api/user/register` | ✅            | Upserts user in Neon DB      |
| POST   | `/api/user/save`     | ✅            | Save crypto savings          |
| GET    | `/api/user/savings`  | ✅            | Fetch user savings (grouped) |
| GET    | `/api/user/profile`  | ✅            | Fetch user profile + history |
| GET    | `/api/user/ping`     | ❌            | Check backend availability   |

---

## 🤝 Acknowledgements

- [Expo](https://expo.dev)
- [Firebase](https://firebase.google.com)
- [Prisma](https://www.prisma.io)
- [Neon](https://neon.tech)
- [React Native Paper](https://callstack.github.io/react-native-paper)

---

## ✍️ Author

Built with 🔥 and ☕ by **[Your Name]**  
Email: yourname@example.com  
GitHub: [@yourname](https://github.com/yourname)
