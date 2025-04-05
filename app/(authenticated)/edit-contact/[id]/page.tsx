"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import type { Contact } from "@/lib/airtable"
import { useToast } from "@/lib/toast-context"
import type React from "react"

type paramsPromise = Promise<{ id: string }>

// Phone number formatting function
const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "")

  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
}

// Format birthday to only show month and day
const formatBirthday = (dateString: string) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  // Get month and day (adding 1 to month since it's 0-indexed)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")

  return `${month}-${day}`
}

// This is a regular function component that uses hooks
function EditContactForm({ id }: { id: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [errorDetails, setErrorDetails] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    status: "active",
    category: "",
    description: "",
    birthday: "",
    birthdayDisplay: "", // For display only (MM-DD)
    hideYear: false, // Add this line
    age: "",
    hasKids: false,
    numberOfKids: 0,
    maritalStatus: "",
    additionalDetails: "",
    contactType: "",
    contactDate: "",
    street: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    country: "",
    notifyBirthday: false,
  })

  useEffect(() => {
    const fetchContact = async () => {
      try {
        // For preview purposes, use mock data instead of API call
        const mockContacts = {
          "1": {
            id: "1",
            name: "Dennis Jr",
            role: "Customer Service",
            email: "dennis@example.com",
            phone: "(345) 678-9023",
            status: "active",
            category: "Kitchen Table",
            description: "Regular customer",
            birthday: "1990-05-15",
            age: 33,
            hasKids: false,
            numberOfKids: 0,
            maritalStatus: "",
            additionalDetails: "Prefers email communication",
            contactType: "Email",
            contactDate: "2023-01-15",
            address: "123 Main St, Springfield, IL, 62701, USA",
            notifyBirthday: true,
          },
          "2": {
            id: "2",
            name: "Kensa Richard",
            role: "Customer Service",
            email: "kensa@example.com",
            phone: "(345) 678-9023",
            status: "active",
            category: "Woman",
            description: "Health consultant",
            birthday: "1985-08-22",
            age: 38,
            hasKids: true,
            numberOfKids: 2,
            maritalStatus: "Married",
            additionalDetails: "Prefers phone calls",
            contactType: "Phone",
            contactDate: "2023-02-20",
            address: "456 Oak Ave, Chicago, IL, 60601, USA",
            notifyBirthday: false,
          },
          "3": {
            id: "3",
            name: "Coriano Harris",
            role: "Customer Service",
            email: "coriano@example.com",
            phone: "(345) 678-9023",
            status: "active",
            category: "Client",
            description: "Premium client",
            birthday: "1978-11-30",
            age: 45,
            hasKids: true,
            numberOfKids: 3,
            maritalStatus: "",
            additionalDetails: "VIP treatment",
            contactType: "In-person",
            contactDate: "2023-03-10",
            address: "789 Pine St, New York, NY, 10001, USA",
            notifyBirthday: true,
          },
        }

        // Check if we have mock data for this ID
        if (mockContacts[id as keyof typeof mockContacts]) {
          const contact = mockContacts[id as keyof typeof mockContacts]

          // Parse address into components if it exists
          let street = ""
          let city = ""
          let stateProvince = ""
          let zipPostalCode = ""
          let country = ""

          if (contact.address) {
            const addressParts = contact.address.split(", ")
            if (addressParts.length >= 1) street = addressParts[0]
            if (addressParts.length >= 2) city = addressParts[1]
            if (addressParts.length >= 3) stateProvince = addressParts[2]
            if (addressParts.length >= 4) zipPostalCode = addressParts[3]
            if (addressParts.length >= 5) country = addressParts[4]
          }

          setFormData({
            name: contact.name || "",
            role: contact.role || "",
            email: contact.email || "",
            phone: contact.phone || "",
            status: contact.status || "active",
            category: contact.category || "",
            description: contact.description || "",
            birthday: contact.birthday || "",
            birthdayDisplay: contact.birthday ? formatBirthday(contact.birthday) : "",
            hideYear: contact.birthday ? true : false,
            age: contact.age?.toString() || "",
            hasKids: contact.hasKids || false,
            numberOfKids: contact.numberOfKids || 0,
            maritalStatus: contact.maritalStatus || "",
            additionalDetails: contact.additionalDetails || "",
            contactType: contact.contactType || "",
            contactDate: contact.contactDate || "",
            street,
            city,
            stateProvince,
            zipPostalCode,
            country,
            notifyBirthday: contact.notifyBirthday || false,
          })
        } else {
          // If no mock data, try to fetch from API (this will likely fail in preview)
          try {
            const res = await fetch(`/api/contacts/${id}`)

            if (!res.ok) {
              throw new Error("Failed to fetch contact")
            }

            const contact: Contact = await res.json()

            // Parse address into components if it exists
            let street = ""
            let city = ""
            let stateProvince = ""
            let zipPostalCode = ""
            let country = ""

            if (contact.address) {
              const addressParts = contact.address.split(", ")
              if (addressParts.length >= 1) street = addressParts[0]
              if (addressParts.length >= 2) city = addressParts[1]
              if (addressParts.length >= 3) stateProvince = addressParts[2]
              if (addressParts.length >= 4) zipPostalCode = addressParts[3]
              if (addressParts.length >= 5) country = addressParts[4]
            }

            setFormData({
              name: contact.name || "",
              role: contact.role || "",
              email: contact.email || "",
              phone: contact.phone || "",
              status: contact.status || "active",
              category: contact.category || "",
              description: contact.description || "",
              birthday: contact.birthday || "",
              birthdayDisplay: contact.birthday ? formatBirthday(contact.birthday) : "",
              hideYear: contact.birthday ? true : false,
              age: contact.age?.toString() || "",
              hasKids: contact.hasKids || false,
              numberOfKids: contact.numberOfKids || 0,
              maritalStatus: contact.maritalStatus || "",
              additionalDetails: contact.additionalDetails || "",
              contactType: contact.contactType || "",
              contactDate: contact.contactDate || "",
              street,
              city,
              stateProvince,
              zipPostalCode,
              country,
              notifyBirthday: contact.notifyBirthday || false,
            })
          } catch (apiError) {
            console.error("API error:", apiError)
            setError(`Contact with ID ${id} not found. Please go back to the dashboard.`)
          }
        }
      } catch (err) {
        console.error(err)
        setError(`Failed to load contact with ID ${id}. Please go back to the dashboard.`)
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === "phone") {
      // Format phone number as user types
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }))
    } else if (name === "birthday") {
      // Store full date for database, but also store MM-DD format for display
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        birthdayDisplay: value ? formatBirthday(value) : "",
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setErrorDetails("")

    try {
      // Prepare address
      const address = [formData.street, formData.city, formData.stateProvince, formData.zipPostalCode, formData.country]
        .filter(Boolean)
        .join(", ")

      // Prepare data for API
      const contactData = {
        name: formData.name,
        role: formData.role || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        status: formData.status,
        category: formData.category,
        description: formData.description || undefined,
        birthday: formData.birthday || undefined,
        age: formData.age ? Number.parseInt(formData.age) : undefined,
        address: address || undefined,
        hasKids: formData.hasKids,
        numberOfKids:
          formData.hasKids && formData.numberOfKids ? Number.parseInt(formData.numberOfKids.toString()) : undefined,
        maritalStatus: formData.category === "Woman" ? formData.maritalStatus || undefined : undefined,
        additionalDetails: formData.additionalDetails || undefined,
        contactType: formData.contactType || undefined,
        contactDate: formData.contactDate || undefined,
        notifyBirthday: formData.notifyBirthday,
      }

      console.log("Submitting contact data:", contactData)
      console.log("Contact ID:", id)

      // Call the API to update the contact
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response from API:", errorData)
        throw new Error(errorData.error || "Failed to update contact")
      }

      const updatedContact = await response.json()
      console.log("Contact updated successfully:", updatedContact)

      showToast("Contact updated successfully!", "success")
      router.push("/dashboard")
    } catch (err) {
      console.error("Error updating contact:", err)

      let errorMessage = "Failed to update contact"
      let errorDetails = ""

      if (err instanceof Error) {
        errorMessage = err.message

        // Try to extract more details if available
        if (err.cause && typeof err.cause === "object") {
          errorDetails = JSON.stringify(err.cause, null, 2)
        }
      }

      setError(errorMessage)
      setErrorDetails(errorDetails || "Check the browser console for more details.")
      showToast("Failed to update contact: " + errorMessage, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Contact</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">{error}</p>
            {errorDetails && <pre className="mt-2 text-sm whitespace-pre-wrap">{errorDetails}</pre>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birthday (Month/Day)</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="notifyBirthday"
                  name="notifyBirthday"
                  checked={formData.notifyBirthday}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="notifyBirthday" className="ml-2 block text-sm text-gray-700">
                  Notify me of this birthday
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Role or position"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Date & Time</label>
              <input
                type="date"
                name="contactDate"
                value={formData.contactDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="Kitchen Table">Kitchen Table</option>
                <option value="Inside House">Inside House</option>
                <option value="Outside House">Outside House</option>
                <option value="Mentor">Mentor</option>
                <option value="Referral">Referral</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Client">Client</option>
                <option value="Employer">Employer</option>
                <option value="Woman">Woman</option>
              </select>
            </div>

            {formData.category === "Woman" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
              <select
                name="contactType"
                value={formData.contactType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select contact type</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="In-person">In-person</option>
                <option value="Video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="(000) 000-0000"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="hasKids"
                  name="hasKids"
                  checked={formData.hasKids}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="hasKids" className="ml-2 block text-sm text-gray-700">
                  Has Children
                </label>
              </div>

              {formData.hasKids && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input
                    type="number"
                    name="numberOfKids"
                    value={formData.numberOfKids}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Brief description"
            ></textarea>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="State or province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                <input
                  type="text"
                  name="zipPostalCode"
                  value={formData.zipPostalCode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Zip or postal code"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Any other relevant information"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <Link href="/dashboard">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// This is the page component that handles the async params
export default function EditContactPage({ params }: { params: paramsPromise }) {
  // In Next.js 15, we need to access the ID safely
  const {id} = use(params);

  // Render the form component with the ID
  return <EditContactForm id={id} />
}

