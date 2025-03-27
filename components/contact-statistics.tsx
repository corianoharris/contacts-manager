"use client"

import { useContact } from "@/context/contact-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Calendar } from "lucide-react"
import { ContactStatus } from "@/types/contact"

export default function ContactStatistics() {
  const { state } = useContact()
  const { contacts } = state

  // Calculate statistics
  const totalContacts = contacts.length
  const activeContacts = contacts.filter(
    (contact) => contact.status === ContactStatus.Active
  ).length
  const inactiveContacts = contacts.filter(
    (contact) => contact.status === ContactStatus.Inactive
  ).length

  // Calculate contacts contacted in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentlyContacted = contacts.filter((contact) => {
    if (!contact.lastContactedAt) return false
    const contactDate = new Date(contact.lastContactedAt)
    return contactDate >= thirtyDaysAgo
  }).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalContacts}</div>
          <p className="text-xs text-muted-foreground">All contacts in your database</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeContacts}</div>
          <p className="text-xs text-muted-foreground">
            {totalContacts > 0 ? Math.round((activeContacts / totalContacts) * 100) : 0}% of total contacts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Contacts</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveContacts}</div>
          <p className="text-xs text-muted-foreground">
            {totalContacts > 0 ? Math.round((inactiveContacts / totalContacts) * 100) : 0}% of total contacts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recently Contacted</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentlyContacted}</div>
          <p className="text-xs text-muted-foreground">Contacts in the last 30 days</p>
        </CardContent>
      </Card>
    </div>
  )
}

