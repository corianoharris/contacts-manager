"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ContactManagement from "@/components/contact-management"
import AppHeader from "@/components/app-header"
import { useContact } from "@/context/contact-context"

// This component uses the context
export default function ContactAppContent() {
  const { state } = useContact()
  const router = useRouter()

  useEffect(() => {
    if (!state.authenticated) {
      // Changed from isAuthenticated to authenticated
      router.push("/login")
    }
  }, [state.authenticated, router]) // Changed from isAuthenticated to authenticated

  if (!state.authenticated) {
    // Changed from isAuthenticated to authenticated
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <ContactManagement />
      </main>
    </div>
  )
}

