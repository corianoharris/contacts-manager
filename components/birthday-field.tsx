"use client"

import type React from "react"
import { useEffect } from "react"
import { DatePicker } from "./date-picker"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface BirthdayFieldProps {
  birthday: Date | undefined
  onBirthdayChange: (date: Date | undefined) => void
  age: number | undefined
  onAgeChange: (age: number | undefined) => void
  className?: string
}

export function BirthdayField({
  birthday,
  onBirthdayChange,
  age,
  onAgeChange,
  className,
}: BirthdayFieldProps) {
  // Calculate age from birthday, adjusting the year if necessary
  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let birthYear = birthDate.getFullYear()
    const birthMonth = birthDate.getMonth()
    const birthDay = birthDate.getDate()

    // If the birthday is in the future (e.g., March 5, 2025, when today is March 25, 2025),
    // adjust the year backward to get a reasonable age
    let adjustedBirthDate = new Date(birthYear, birthMonth, birthDay)
    while (adjustedBirthDate > today) {
      birthYear -= 1
      adjustedBirthDate = new Date(birthYear, birthMonth, birthDay)
    }

    let calculatedAge = today.getFullYear() - adjustedBirthDate.getFullYear()
    const monthDiff = today.getMonth() - adjustedBirthDate.getMonth()

    // If birthday hasn't occurred yet this year, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < adjustedBirthDate.getDate())) {
      calculatedAge--
    }

    // Update the birthday with the adjusted year
    if (birthYear !== birthDate.getFullYear()) {
      const newBirthday = new Date(birthDate)
      newBirthday.setFullYear(birthYear)
      onBirthdayChange(newBirthday)
    }

    return calculatedAge
  }

 
  // Handle manual age input
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = e.target.value ? Number.parseInt(e.target.value) : undefined

    if (newAge === undefined) {
      // If the user clears the age field, clear the birthday as well
      onAgeChange(undefined)
      return
    }

    if (!isNaN(newAge) && newAge >= 0) {
      onAgeChange(newAge)

      // Only update the birthday if one already exists
      if (birthday) {
        const today = new Date()
        const birthYear = today.getFullYear() - newAge
        const newBirthday = new Date(birthday)
        newBirthday.setFullYear(birthYear)
        onBirthdayChange(newBirthday)
      }
    }
  }

  return (
    <div className={className}>
      <div className="space-y-2 mb-4">
        <Label htmlFor="birthday">Birthday</Label>
        <DatePicker
          value={birthday}
          onChange={onBirthdayChange}
          label="Birthday"
          placeholder="Select birthday"
          minDate={new Date(1900, 0, 1)}
          isBirthday={true} // Ensure year is hidden
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min="0"
          value={age ?? ""}
          onChange={handleAgeChange}
          placeholder="Age"
          className="appearance-none"
        />
      </div>

      {/* Optional: Add CSS to hide number input spinners */}
      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  )
}