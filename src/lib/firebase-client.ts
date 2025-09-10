// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// ⚡ Configuración de tu proyecto Firebase "Mwise"
// Estas variables de entorno se definen en .env.local y son cargadas por Next.js
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// 🔹 Inicializar Firebase solo una vez
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔹 Inicializar servicios
const auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// 🔹 Conectar al Auth Emulator en desarrollo
if (typeof window !== 'undefined' && window.location.hostname === "localhost") {
  console.log("Connecting to Firebase Auth Emulator at http://127.0.0.1:9099");
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  } catch (e) {
    console.warn("Could not connect to Firebase Auth Emulator. Already connected or another issue occurred.", e);
  }
}

// 🔹 Exportar app y servicios para usar en todo el proyecto
export { app, auth, db, storage };
