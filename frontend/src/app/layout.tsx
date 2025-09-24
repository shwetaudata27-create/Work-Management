// app/layout.tsx (Server Component)
import type { Metadata } from "next"
import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import ClientAnalytics from "./ClientAnalytics"

export const metadata: Metadata = {
  title: "Work Management",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <ClientAnalytics />
      </body>
    </html>
  )
}
