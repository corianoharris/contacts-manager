"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserPlus, RefreshCw, Edit, Trash2, ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react"

// Format birthday to only show month and day
const formatBirthday = (dateString?: string): string => {
  if (!dateString) return ""

  try {
    // Check if it's in the --MM-DD format (year hidden)
    if (dateString.startsWith("--")) {
      // Parse month and day from --MM-DD format
      const parts = dateString.substring(2).split("-")
      if (parts.length === 2) {
        return `${parts[0]}/${parts[1]}`
      }
      return ""
    }

    // Regular date format
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""

    // Format as MM/DD
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${month}/${day}`
  } catch (error) {
    console.error("Error formatting birthday:", error)
    return ""
  }
}

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  status?: string
  category?: string
  lastContactedAt?: string
  role?: string
  birthday?: string
}

interface ContactStats {
  total: number
  active: number
  inactive: number
  recentlyContacted: number
  neverContacted: Contact[]
}

// Default empty stats
const defaultStats: ContactStats = {
  total: 0,
  active: 0,
  inactive: 0,
  recentlyContacted: 0,
  neverContacted: [],
}

const CONTACTS_PER_PAGE = 8

// Last contacted options
const LAST_CONTACTED_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "never", label: "Never Contacted" },
]

// All possible categories
const ALL_CATEGORIES = [
  "Kitchen Table",
  "Inside House",
  "Outside House",
  "Mentor",
  "Referral",
  "Recruiter",
  "Client",
  "Employer",
  "Woman",
  "Family",
  "Friend",
  "Business",
  "Other",
]

export default function DashboardPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactingId, setContactingId] = useState<string | null>(null)
  const [contactError, setContactError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [lastContactedFilter, setLastContactedFilter] = useState("all")
  // Remove or comment out this line:
  // const [categories, setCategories] = useState<string[]>([])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch contacts
      console.log("Fetching contacts...")
      const contactsResponse = await fetch("/api/contacts")

      if (!contactsResponse.ok) {
        throw new Error(`Failed to fetch contacts: ${contactsResponse.status}`)
      }

      const contactsData = await contactsResponse.json()
      const validContacts = Array.isArray(contactsData) ? contactsData : []
      setContacts(validContacts)
      setFilteredContacts(validContacts)

      // Remove or comment out this code in the fetchData function:
      // Extract unique categories
      // const uniqueCategories = Array.from(new Set(validContacts.map(contact => contact.category).filter(Boolean))) as string[]
      // setCategories(uniqueCategories)

      try {
        // Fetch stats
        console.log("Fetching stats...")
        const statsResponse = await fetch("/api/contacts/stats")

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log("Stats data:", statsData)
          setStats(statsData || defaultStats)
        } else {
          console.warn(`Stats API returned ${statsResponse.status}, using default stats`)
          setStats(defaultStats)
        }
      } catch (statsErr) {
        console.warn("Error fetching stats, using default stats:", statsErr)
        setStats(defaultStats)
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (contacts.length === 0) return

    let result = [...contacts]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.phone?.includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((contact) => contact.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((contact) => contact.category === categoryFilter)
    }

    // Apply last contacted filter
    if (lastContactedFilter !== "all") {
      const now = new Date()

      if (lastContactedFilter === "never") {
        result = result.filter((contact) => !contact.lastContactedAt)
      } else {
        let daysAgo = 0

        switch (lastContactedFilter) {
          case "7days":
            daysAgo = 7
            break
          case "30days":
            daysAgo = 30
            break
          case "90days":
            daysAgo = 90
            break
        }

        if (daysAgo > 0) {
          const cutoffDate = new Date(now)
          cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

          result = result.filter((contact) => {
            if (!contact.lastContactedAt) return false
            const contactDate = new Date(contact.lastContactedAt)
            return contactDate >= cutoffDate
          })
        }
      }
    }

    setFilteredContacts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [contacts, searchQuery, statusFilter, categoryFilter, lastContactedFilter])

  const handleMarkAsContacted = async (id: string, type: string) => {
    try {
      setContactingId(id)
      setContactError(null)

      console.log(`Marking contact ${id} as contacted via ${type}`)

      // First try the dedicated endpoint
      try {
        const response = await fetch(`/api/contacts/${id}/contacted`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "" }), // Empty string instead of "Other"
        })

        const data = await response.json()

        if (!response.ok) {
          console.error("Error response from contacted endpoint:", data)
          throw new Error(data.error || "Failed to update contact")
        }

        console.log("Contact updated successfully via contacted endpoint:", data)
      } catch (contactedError) {
        console.warn("Error with contacted endpoint, falling back to PATCH method:", contactedError)

        // Fallback to the PATCH method if the dedicated endpoint fails
        const patchResponse = await fetch(`/api/contacts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "updateLastContacted",
            communicationType: "", // Empty string instead of "Other"
          }),
        })

        const patchData = await patchResponse.json()

        if (!patchResponse.ok) {
          console.error("Error response from PATCH endpoint:", patchData)
          throw new Error(patchData.error || "Failed to update contact")
        }

        console.log("Contact updated successfully via PATCH method:", patchData)
      }

      // Refresh the data
      await fetchData()
    } catch (err) {
      console.error("Error updating contact:", err)

      // Check for field name errors specifically
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      if (errorMessage.includes("Unknown field name")) {
        setContactError("There's a configuration issue with the contact fields. Please contact the administrator.")
      } else {
        setContactError(errorMessage)
      }
    } finally {
      setContactingId(null)
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete contact")

      // Update contacts list
      setContacts(contacts.filter((contact) => contact.id !== id))
      setFilteredContacts(filteredContacts.filter((contact) => contact.id !== id))

      // Refresh data to update stats
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Failed to delete contact")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setLastContactedFilter("all")
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / CONTACTS_PER_PAGE)
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * CONTACTS_PER_PAGE,
    currentPage * CONTACTS_PER_PAGE,
  )

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">Error loading dashboard</p>
        <p className="mt-2">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <Link href="/add-contact">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filters</h2>
            <button onClick={clearFilters} className="text-sm text-primary hover:text-primary/80">
              Clear All Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="all">All Categories</option>
                {ALL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Contacted</label>
              <select
                value={lastContactedFilter}
                onChange={(e) => setLastContactedFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                {LAST_CONTACTED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter summary */}
          {(statusFilter !== "all" || categoryFilter !== "all" || lastContactedFilter !== "all" || searchQuery) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1 text-gray-500 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("all")} className="ml-1 text-gray-500 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter("all")} className="ml-1 text-gray-500 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {lastContactedFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Last Contacted: {LAST_CONTACTED_OPTIONS.find((o) => o.value === lastContactedFilter)?.label}
                  <button
                    onClick={() => setLastContactedFilter("all")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {contactError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error updating contact</p>
          <p className="mt-2">{contactError}</p>
          <button onClick={() => setContactError(null)} className="mt-2 text-sm text-red-700 hover:text-red-900">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Total Contacts</h2>
          <p className="text-3xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Active Contacts</h2>
          <p className="text-3xl font-bold">{stats?.active || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Inactive Contacts</h2>
          <p className="text-3xl font-bold">{stats?.inactive || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Recently Contacted</h2>
          <p className="text-3xl font-bold">{stats?.recentlyContacted || 0}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Contacts</h2>
          <p className="text-sm text-gray-500">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedContacts.length > 0 ? (
            paginatedContacts.map((contact) => (
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
                    {contact.birthday && (
                      <p className="text-gray-500 mt-1">Birthday: {formatBirthday(contact.birthday)}</p>
                    )}
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
                    onClick={() => handleMarkAsContacted(contact.id, "")}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Mark as contacted
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              {contacts.length > 0
                ? "No contacts match your current filters. Try adjusting your search criteria."
                : "No contacts found. Add your first contact to get started."}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredContacts.length > CONTACTS_PER_PAGE && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {stats?.neverContacted && stats.neverContacted.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contact Reminders</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <ul className="divide-y divide-gray-200">
              {stats.neverContacted.map((contact) => (
                <li key={contact.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{contact.name}</span> has never been contacted.
                  </div>
                  <button
                    onClick={() => handleMarkAsContacted(contact.id, "")}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Mark as contacted
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={fetchData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:text-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>
    </div>
  )
}

