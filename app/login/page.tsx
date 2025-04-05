"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { login, isAuthenticated } = useAuth()

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setError("")

    console.log("Attempting login with password:", password)

    // Small delay to ensure state updates properly
    setTimeout(() => {
      const loginSuccess = login(password)
      console.log("Login result:", loginSuccess)

      if (loginSuccess) {
        console.log("Login successful, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        console.log("Login failed")
        setError("Invalid password. Please try again.")
        setIsLoggingIn(false)
      }
    }, 100)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200 p-4 sm:p-0">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold dark:text-white">Contact Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to manage your contacts</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded">{error}</div>}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Password: 1202WarrenSt (case sensitive)</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

