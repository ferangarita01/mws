"use client"

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback,
} from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getToken: async () => null,
})

/**
 * Sync Firebase ID token with your backend API route.
 */
async function syncSession(user: User | null) {
  try {
    if (user) {
      const idToken = await user.getIdToken(true) // Force refresh
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("[Auth Sync] Failed:", errorData.message)
      }
    } else {
      await fetch("/api/auth/session", { method: "DELETE" })
    }
  } catch (err) {
    console.error("[Auth Sync] Error syncing session cookie:", err)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isSyncing = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userState) => {
      if (isSyncing.current) return // prevent race condition
      isSyncing.current = true
      setLoading(true)

      setUser(userState)
      await syncSession(userState)

      setLoading(false)
      isSyncing.current = false
    })

    return () => unsubscribe()
  }, [])

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null
    try {
      return await auth.currentUser.getIdToken()
    } catch (err) {
      console.error("[Auth] Error getting ID token:", err)
      return null
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access user and session state.
 */
export function useAuth() {
  return useContext(AuthContext)
}
