// app/ClientAnalytics.tsx (Client Component)
"use client"

import { useEffect, useState } from "react"

export default function ClientAnalytics() {
  const [AnalyticsComponent, setAnalyticsComponent] = useState<React.ReactNode>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      import("@vercel/analytics/next").then((mod) => {
        setAnalyticsComponent(<mod.Analytics />)
      })
    }
  }, [])

  return <>{AnalyticsComponent}</>
}
