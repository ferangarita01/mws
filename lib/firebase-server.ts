// src/lib/firebase-server.ts
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminApp: App;

function getInitializedAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // ✅ Usar fallback para evitar que truene en el build
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET || "new-prototype-rmkd6.appspot.com";

  // 🚀 Producción en GCP (Cloud Run / Firebase Hosting)
  if (process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_CONFIG) {
    console.log("[firebase-server] Using Application Default Credentials (production)");
    adminApp = initializeApp({
      storageBucket,
    });
  } else {
    console.log("[firebase-server] Using service account credentials (local dev)");
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local"
      );
    }

    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });
  }

  return adminApp;
}

const app = getInitializedAdminApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app).bucket();
export const db = adminDb;