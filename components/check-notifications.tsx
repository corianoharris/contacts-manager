"use client"

import { useState, useEffect } from "react"
import { differenceInDays } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Contact } from "@/types/contact"

interface CheckNotificationsProps {
  contacts: Contact[]
}

export function CheckNotifications({ contacts }: CheckNotificationsProps) {
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string }>>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  // Check for contacts that haven't been contacted in 30 days
  useEffect(() => {
    const newNotifications: Array<{ id: string; message: string }> = []

    contacts.forEach((contact) => {
      // Skip if this notification was dismissed
      if (dismissed.includes(contact.id)) return

      const lastContactedDate = contact.lastContactedAt ? new Date(contact.lastContactedAt) : null

      // If never contacted
      if (!lastContactedDate) {
        newNotifications.push({
          id: contact.id,
          message: `${contact.name} has never been contacted.`,
        })
        return
      }

      // If contacted more than 30 days ago
      const daysSinceContact = differenceInDays(new Date(), lastContactedDate)
      if (daysSinceContact >= 30) {
        newNotifications.push({
          id: contact.id,
          message: `${contact.name} hasn't been contacted in ${daysSinceContact} days.`,
        })
      }
    })

    setNotifications(newNotifications)
  }, [contacts, dismissed])

  // No notifications to show
  if (notifications.length === 0) {
    return null
  }

  // Dismiss a notification
  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id])
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Alert key={notification.id} className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 mt-0.5" />
            <div>
              <AlertTitle>Contact Reminder</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}

