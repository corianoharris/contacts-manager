"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useContact } from "@/context/contact-context"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { state } = useContact()
  const router = useRouter()

  useEffect(() => {
    if (!state.authenticated) {
      router.push("/login")
    }
  }, [state.authenticated, router])

  if (!state.authenticated) {
    return null
  }

  return <>{children}</>
}

