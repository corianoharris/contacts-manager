"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast as useShadcnToast } from "@/components/ui/use-toast"

type ToastType = "success" | "error" | "info"

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast } = useShadcnToast()

  const showToast = (message: string, type: ToastType = "success") => {
    toast({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant: type === "error" ? "destructive" : "default",
    })
  }

  return <ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

