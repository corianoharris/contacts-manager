"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Users, UserCheck, UserX, Clock, ChevronDown, ChevronUp, Bell, Edit, Trash2 } from "lucide-react"
import type { Contact } from "@/lib/airtable"

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentlyContacted: 0,
    neverContacted: [] as Contact[],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contacts
        const contactsRes = await fetch("/api/contacts")
        if (!contactsRes.ok) throw new Error("Failed to fetch contacts")
        const contactsData = await contactsRes.json()
        setContacts(contactsData)

        // Fetch stats
        const statsRes = await fetch("/api/stats")
        if (!statsRes.ok) throw new Error("Failed to fetch statistics")
        const statsData = await statsRes.json()
        setStats(statsData)
      } catch (err) {
        setError("Failed to load data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete contact")

      // Update contacts list
      setContacts(contacts.filter((contact) => contact.id !== id))

      // Update stats
      const statsRes = await fetch("/api/stats")
      if (!statsRes.ok) throw new Error("Failed to fetch updated statistics")
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (err) {
      console.error(err)
      alert("Failed to delete contact")
    }
  }

  const handleMarkAsContacted = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "updateLastContacted" }),
      })

      if (!res.ok) throw new Error("Failed to update contact")

      // Update contacts list
      const updatedContact = await res.json()
      setContacts(contacts.map((contact) => (contact.id === id ? updatedContact : contact)))

      // Update stats
      const statsRes = await fetch("/api/stats")
      if (!statsRes.ok) throw new Error("Failed to fetch updated statistics")
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (err) {
      console.error(err)
      alert("Failed to update contact")
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-gray-600 mt-1">Manage your contacts, track communication, and stay in touch.</p>
        </div>
        <Link
          href="/add-contact"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Contact
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Contacts</h2>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">All contacts in your database</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Active Contacts</h2>
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-500">
                {stats.active > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : "0%"} of total contacts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Inactive Contacts</h2>
              <p className="text-3xl font-bold">{stats.inactive}</p>
              <p className="text-sm text-gray-500">
                {stats.inactive > 0 ? `${Math.round((stats.inactive / stats.total) * 100)}%` : "0%"} of total contacts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Recently Contacted</h2>
              <p className="text-3xl font-bold">{stats.recentlyContacted}</p>
              <p className="text-sm text-gray-500">Contacts in the last 30 days</p>
            </div>
          </div>
        </div>
      </div>

      {stats.neverContacted.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contact Reminders</h2>
          {stats.neverContacted.map((contact) => (
            <div key={contact.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-amber-500 mr-3" />
                <p>
                  <span className="font-medium">{contact.name}</span> has never been contacted.
                </p>
              </div>
              <button
                onClick={() => handleMarkAsContacted(contact.id)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-sm text-gray-500">
            {showFilters ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option value="">All</option>
                  <option value="Client">Client</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.role || "Customer Service"}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <Link href={`/edit-contact/${contact.id}`}>
                      <button className="text-gray-500 hover:text-gray-700 mr-2">
                        <Edit className="h-5 w-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contact.category === "Client"
                        ? "bg-blue-100 text-blue-800"
                        : contact.category === "Health"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {contact.category || "Client"}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-gray-500">{contact.phone || "(345) 678-9023"}</p>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  {contact.lastContactedAt ? (
                    <p>Last contacted {new Date(contact.lastContactedAt).toLocaleDateString()}</p>
                  ) : (
                    <p>Never contacted</p>
                  )}
                </div>
              </div>
              <div className="border-t px-4 py-3 bg-gray-50 flex justify-between items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contact.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {contact.status || "active"}
                </span>
                <button
                  onClick={() => handleMarkAsContacted(contact.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark as contacted
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 mt-4">
          Showing {contacts.length} of {contacts.length} contacts
        </div>
      </div>
    </div>
  )
}

