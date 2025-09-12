import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MuWise - Music Rights Management",
  description: "Simplify songwriter split agreements, manage contracts, and track rights with ease.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  )
}