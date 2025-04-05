"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    // Use try-catch to handle potential localStorage errors
    try {
      const auth = localStorage.getItem("auth")
      if (auth === "true") {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const login = (password: string) => {
    console.log("Login attempt with password:", password)

    // Hardcoded password as specified - ensure exact match
    if (password === "1202WarrenSt") {
      console.log("Password matched, setting authenticated state")

      // Use try-catch to handle potential localStorage errors
      try {
        localStorage.setItem("auth", "true")
      } catch (error) {
        console.error("Error setting localStorage:", error)
      }

      setIsAuthenticated(true)
      return true
    }

    console.log("Password did not match")
    return false
  }

  const logout = () => {
    console.log("Logging out")
    setIsAuthenticated(false)

    // Use try-catch to handle potential localStorage errors
    try {
      localStorage.removeItem("auth")
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

