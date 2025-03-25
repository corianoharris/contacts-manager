"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BirthdayField } from "./birthday-field"
import { ContactDateField } from "./contact-date-field"
import { type Contact, ContactCategory, ContactStatus, type ContactType } from "@/types/contact"
import { formatPhoneNumber } from "@/lib/format-utils"
import { useContact } from "@/context/contact-context"
import { Loader2 } from "lucide-react"

interface ContactFormProps {
  contact?: Contact | null
  onSave: (contact: Contact) => void
  onCancel: () => void
}

export default function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const { state } = useContact()
  const [formData, setFormData] = useState<Partial<Contact>>({
    id: contact?.id || crypto.randomUUID(),
    name: contact?.name || "",
    role: contact?.role || "",
    status: contact?.status || ContactStatus.Active,
    category: contact?.category || ContactCategory.Client,
    description: contact?.description || "",
    picture: contact?.picture || "",
    birthday: contact?.birthday || "",
    age: contact?.age || "",
    address: contact?.address || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    hasKids: contact?.hasKids || false,
    numberOfKids: contact?.numberOfKids || 0,
    maritalStatus: contact?.maritalStatus || "Single",
    additionalDetails: contact?.additionalDetails || "",
    communications: contact?.communications || [],
    lastContactedAt: contact?.lastContactedAt || null,
    createdAt: contact?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phoneNumber: contact?.phoneNumber || "",
    email: contact?.email || "",
  })

  // Separate state for date objects
  const [birthdayDate, setBirthdayDate] = useState<Date | undefined>(
    formData.birthday ? new Date(formData.birthday) : undefined,
  )

  const [contactDate, setContactDate] = useState<Date | undefined>(
    formData.contactDate ? new Date(formData.contactDate) : undefined,
  )

  const [contactType, setContactType] = useState<ContactType | undefined>(formData.contactType)

  const [age, setAge] = useState<number | undefined>(
    formData.age ? Number.parseInt(formData.age.toString()) : undefined,
  )

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle phone number input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Store raw digits in state
    setFormData({
      ...formData,
      phoneNumber: input.replace(/\D/g, ""),
    })

    // Format for display
    e.target.value = formatPhoneNumber(input)
  }

  // Handle select changes
  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  // Handle switch changes
  const handleSwitchChange = (checked: boolean, field: string) => {
    setFormData({
      ...formData,
      [field]: checked,
    })
  }

  // Update form data when date fields change
  useEffect(() => {
    if (birthdayDate) {
      setFormData((prev) => ({
        ...prev,
        birthday: birthdayDate.toISOString(),
      }))
    }
  }, [birthdayDate])

  useEffect(() => {
    if (contactDate) {
      setFormData((prev) => ({
        ...prev,
        contactDate: contactDate.toISOString(),
      }))
    }
  }, [contactDate])

  useEffect(() => {
    if (contactType) {
      setFormData((prev) => ({
        ...prev,
        contactType,
      }))
    }
  }, [contactType])

  useEffect(() => {
    if (age !== undefined) {
      setFormData((prev) => ({
        ...prev,
        age: age.toString(),
      }))
    }
  }, [age])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as Contact)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{contact ? "Edit Contact" : "Add New Contact"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Role or position"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange(value, "status")}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ContactStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ContactCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formatPhoneNumber(formData.phoneNumber || "")}
                  onChange={handlePhoneChange}
                  placeholder="(000) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              {/* Birthday and Age - Using the new component */}
              <BirthdayField
                birthday={birthdayDate}
                onBirthdayChange={setBirthdayDate}
                age={age}
                onAgeChange={setAge}
                className="space-y-4"
              />

              {/* Contact Date and Type - Using the new component */}
              <ContactDateField
                contactDate={contactDate}
                onContactDateChange={setContactDate}
                contactType={contactType}
                onContactTypeChange={setContactType}
                className="space-y-4 mt-6"
              />

              {/* Only show Marital Status for Woman category */}
              {formData.category === ContactCategory.Woman && (
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleSelectChange(value, "maritalStatus")}
                  >
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                      <SelectItem value="Widow">Widow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasKids"
                  checked={formData.hasKids}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "hasKids")}
                />
                <Label htmlFor="hasKids">Has Children</Label>
              </div>

              {formData.hasKids && (
                <div className="space-y-2">
                  <Label htmlFor="numberOfKids">Number of Children</Label>
                  <Input
                    id="numberOfKids"
                    name="numberOfKids"
                    type="number"
                    min="0"
                    value={formData.numberOfKids}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address.street">Street</Label>
                <Input
                  id="address.street"
                  name="address.street"
                  value={formData.address?.street}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.city">City</Label>
                <Input
                  id="address.city"
                  name="address.city"
                  value={formData.address?.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.state">State/Province</Label>
                <Input
                  id="address.state"
                  name="address.state"
                  value={formData.address?.state}
                  onChange={handleChange}
                  placeholder="State or province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.zipCode">Zip/Postal Code</Label>
                <Input
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address?.zipCode}
                  onChange={handleChange}
                  placeholder="Zip or postal code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.country">Country</Label>
                <Input
                  id="address.country"
                  name="address.country"
                  value={formData.address?.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              placeholder="Any other relevant information"
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={state.loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Contact"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

