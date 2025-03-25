"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CommunicationType } from "@/types/contact"
import { DatePicker } from "./date-picker"

interface CommunicationFormProps {
  onSave: (types: CommunicationType[], notes: string, date?: string) => void
}

export default function CommunicationForm({ onSave }: CommunicationFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<CommunicationType[]>([])
  const [notes, setNotes] = useState("")
  const [contactDate, setContactDate] = useState<Date | undefined>(new Date())

  const handleTypeToggle = (type: CommunicationType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypes.length === 0) {
      return // Require at least one type
    }

    // Convert the date to ISO string if it exists
    const dateString = contactDate ? contactDate.toISOString() : undefined

    onSave(selectedTypes, notes, dateString)

    // Reset form
    setSelectedTypes([])
    setNotes("")
    setContactDate(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Communication</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Communication Type</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(CommunicationType).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-date">Contact Date</Label>
            <DatePicker
              value={contactDate}
              onChange={setContactDate}
              label="Contact Date"
              placeholder="Select contact date"
              maxDate={new Date()} // Can't be in the future
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter details about the communication"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={selectedTypes.length === 0}>
            Add Communication
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

