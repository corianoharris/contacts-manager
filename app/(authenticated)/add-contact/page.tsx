"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { set } from "react-hook-form"

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

export default function AddContactPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [errorDetails, setErrorDetails] = useState("")
  const [hasKids, setHasKids] = useState(false)
  const [notifyBirthday, setNotifyBirthday] = useState(false)
  const [birthdayValue, setBirthdayValue] = useState("")
  const [phoneValue, setPhoneValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Client")

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneValue(formatted)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setErrorDetails("")

    try {
      const form = e.target as HTMLFormElement

      const elements = form.elements as HTMLFormControlsCollection & {
        name: HTMLInputElement;
        role: HTMLInputElement;
        email: HTMLInputElement;
        phone: HTMLInputElement;
        status: HTMLSelectElement;
        category: HTMLSelectElement;
        description: HTMLTextAreaElement;
        hideYear: HTMLInputElement;
        hasKids: HTMLInputElement;
        birthdayValue: HTMLInputElement;
        birthday: HTMLInputElement;
        age: HTMLInputElement;
        numberOfKids: HTMLInputElement;
        maritalStatus: HTMLSelectElement;
        additionalDetails: HTMLTextAreaElement;
        contactType: HTMLSelectElement;
        contactDate: HTMLInputElement;
        street: HTMLInputElement;
        city: HTMLInputElement;
        stateProvince: HTMLInputElement;
        zipPostalCode: HTMLInputElement;
        country: HTMLInputElement;
      }

      // Prepare address
      const street = form.street?.value || ""
      const city = form.city?.value || ""
      const stateProvince = form.stateProvince?.value || ""
      const zipPostalCode = form.zipPostalCode?.value || ""
      const country = form.country?.value || ""

      const address = [street, city, stateProvince, zipPostalCode, country].filter(Boolean).join(", ")


      // Check if we should hide the year
      const hideYear = form.hideYear?.checked
      let birthdayValue = form.birthday?.value || undefined

      // If hiding year and birthday is provided, extract only month and day
      if (hideYear && birthdayValue) {
        try {
          const date = new Date(birthdayValue)
          if (!isNaN(date.getTime())) {
            // Format as MM-DD
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const day = date.getDate().toString().padStart(2, "0")
            birthdayValue = `--${month}-${day}` // ISO 8601 format for month-day
            setBirthdayValue(birthdayValue) 
          }
        } catch (e) {
          console.warn(`Error processing birthday: ${e}`)
        }
      }

      // Prepare data for API
      const contactData = {
        name: elements.name.value || "",
        role: elements.role?.value || "",
        email: elements.email.value || "",
        phone: elements.phone.value || "",
        status: elements.status.value,
        category: elements.category.value,
        description: elements.description?.value || "",
        birthday: elements.birthdayValue || "",
        age: elements.age?.value ? Number.parseInt(elements.age.value) : "",
        address: address || "",
        hasKids: hasKids,
        numberOfKids: hasKids && elements.numberOfKids?.value ? Number.parseInt(elements.numberOfKids.value) : "",
        maritalStatus: selectedCategory === "Woman" ? elements.maritalStatus?.value || "" : "",
        additionalDetails: elements.additionalDetails?.value || "",
        contactType: elements.contactType?.value || "",
        contactDate: elements.contactDate?.value || "",
        notifyBirthday: notifyBirthday,
        communications: elements.contactType?.value || "",
      }
      console.log("Submitting contact data:", contactData)

      // Send to API
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("API error response:", responseData)
        throw new Error(responseData.error || "Failed to create contact")
      }

      // After successful contact creation
      console.log("Contact created successfully:", responseData)

      // Clear any form state
      setIsSubmitting(false)
      setError("")
      setErrorDetails("")

      // Show success message (optional)
      alert("Contact created successfully!")

      // Redirect to dashboard
      console.log("Redirecting to dashboard...")
      router.push("/dashboard")
      router.refresh() // Force a refresh to show the new contact
    } catch (err) {
      console.error("Error creating contact:", err)

      // Extract more detailed error information
      let errorMessage = "An unknown error occurred"
      let errorDetails = ""

      if (err instanceof Error) {
        errorMessage = err.message

        // Try to parse the response data if it's in the error
        if (err.cause && typeof err.cause === "object") {
          errorDetails = JSON.stringify(err.cause, null, 2)
        }
      }

      // If the error is from the API and has details
      if (typeof err === "object" && err !== null && "details" in err) {
        errorDetails = String(err.details)
      }

      setError(errorMessage)
      setErrorDetails(errorDetails || "Check the console for more information.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function formattedBirthday(birthday: any): string | number | readonly string[] | undefined
  {
    throw new Error("Function not implemented.")
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Contact</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">{error}</p>
            {errorDetails && <p className="mt-2 text-sm">{errorDetails}</p>}
            <p className="mt-2 text-sm">
              Please check the form and try again. If the problem persists, contact support.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
              <input type="date" name="birthday" className="w-full border border-gray-300 rounded-md p-2" value={formattedBirthday(birthdayValue || "")}/>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="notifyBirthday"
                  name="notifyBirthday"
                  checked={notifyBirthday}
                  onChange={() => setNotifyBirthday(!notifyBirthday)}
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
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Role or position"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Age"
                min="0"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" className="w-full border border-gray-300 rounded-md p-2" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Date</label>
              <input type="date" name="contactDate" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                className="w-full border border-gray-300 rounded-md p-2"
                defaultValue="Client"
                onChange={handleCategoryChange}
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
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {selectedCategory === "Woman" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select name="maritalStatus" className="w-full border border-gray-300 rounded-md p-2">
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
              <select name="contactType" className="w-full border border-gray-300 rounded-md p-2">
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
                value={phoneValue}
                onChange={handlePhoneChange}
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
                  checked={hasKids}
                  onChange={() => setHasKids(!hasKids)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="hasKids" className="ml-2 block text-sm text-gray-700">
                  Has Children
                </label>
              </div>

              {hasKids && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input
                    type="number"
                    name="numberOfKids"
                    min="0"
                    defaultValue="0"
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
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
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
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  name="stateProvince"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="State or province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                <input
                  type="text"
                  name="zipPostalCode"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Zip or postal code"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
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
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Contact
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

