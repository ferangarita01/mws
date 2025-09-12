// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

let app: App

if (getApps().length === 0) {
  // En desarrollo local: usar variables de entorno
  if (process.env.NODE_ENV === "development") {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("Missing Firebase Admin SDK environment variables for development")
    }

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  } else {
    // En producción (Firebase App Hosting/Cloud Run): usar ADC
    app = initializeApp({
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  }
} else {
  app = getApps()[0]!
}

// Exportar servicios del Admin SDK
export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)
export const adminStorage = getStorage(app)

export default app