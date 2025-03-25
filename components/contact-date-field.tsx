"use client"
import { DatePicker } from "./date-picker"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContactType } from "@/types/contact"

interface ContactDateFieldProps {
  contactDate: Date | undefined
  onContactDateChange: (date: Date | undefined) => void
  contactType: ContactType | undefined
  onContactTypeChange: (type: ContactType) => void
  className?: string
}

export function ContactDateField({
  contactDate,
  onContactDateChange,
  contactType,
  onContactTypeChange,
  className,
}: ContactDateFieldProps) {
  return (
    <div className={className}>
      <div className="space-y-2 mb-4">
        <Label htmlFor="contactDate">Contact Date & Time</Label>
        <DatePicker
          value={contactDate}
          onChange={onContactDateChange}
          label="Contact Date"
          placeholder="Select contact date"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactType">Contact Type</Label>
        <Select value={contactType} onValueChange={(value) => onContactTypeChange(value as ContactType)}>
          <SelectTrigger id="contactType">
            <SelectValue placeholder="Select contact type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ContactType).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

