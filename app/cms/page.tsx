// app/cms/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"


export default function CmsPage() {
  const router = useRouter()

  useEffect(() => {
    // replace avoids adding /cms to history, preventing a "back" jump to an empty page
    router.push("/cms/about")
  }, [router])

  // Optional: small fallback UI if someone sees this momentarily
  return null
}
