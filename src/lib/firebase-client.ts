// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDonMCR4tSZTlv_uRPHzH6pk1ElAqNB2fA",
  authDomain: "mws-77649371.firebaseapp.com",
  projectId: "mws-77649371",
  storageBucket: "mws-77649371.appspot.com",   // 👈 CORREGIDO
  messagingSenderId: "103676365098",
  appId: "1:103676365098:web:a5327213b4b85e6f77f653",
  measurementId: "G-Q703NWB9Q8"
}

// Inicializar Firebase solo si no existe
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Exportar servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

