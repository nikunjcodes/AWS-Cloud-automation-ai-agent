import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import Sidebar from "@/components/sidebar"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Cloud Navigator - AI-Driven Cloud Automation Platform",
  description:
    "Automate your cloud infrastructure with AI-driven orchestration for faster deployments and optimized costs.",
  generator: "v0.dev",
  keywords: ["cloud automation", "AI", "AWS", "infrastructure as code", "DevOps"],
  authors: [{ name: "Cloud Navigator Team" }],
  openGraph: {
    title: "Cloud Navigator - AI-Driven Cloud Automation Platform",
    description: "Automate your cloud infrastructure with AI-driven orchestration",
    images: [{ url: "/og-image.png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning  className="dark scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
