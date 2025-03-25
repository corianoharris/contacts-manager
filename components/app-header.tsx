"use client"

import { useRouter } from "next/navigation"
import { useContact } from "@/context/contact-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export default function AppHeader() {
  const { state, dispatch } = useContact()
  const router = useRouter()

  const handleLogout = () => {
    dispatch({ type: "SET_AUTHENTICATED", payload: false })
    router.push("/login")
  }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Contact Management</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}

