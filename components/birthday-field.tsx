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
  onAgeChange: (age: number) => void
  className?: string
}

export function BirthdayField({ birthday, onBirthdayChange, age, onAgeChange, className }: BirthdayFieldProps) {
  // Calculate age from birthday
  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let calculatedAge = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    // If birthday hasn't occurred yet this year, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--
    }

    return calculatedAge
  }

  // Update age when birthday changes
  useEffect(() => {
    if (birthday) {
      const calculatedAge = calculateAge(birthday)
      onAgeChange(calculatedAge)
    }
  }, [birthday, onAgeChange])

  // Handle manual age input
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = Number.parseInt(e.target.value)
    if (!isNaN(newAge) && newAge >= 0) {
      onAgeChange(newAge)

      // If age is changed manually, estimate a birthday
      if (birthday) {
        const today = new Date()
        const birthYear = today.getFullYear() - newAge
        const newBirthday = new Date(birthday)
        newBirthday.setFullYear(birthYear)
        onBirthdayChange(newBirthday)
      } else {
        // If no birthday set, create one based on age
        const today = new Date()
        const birthYear = today.getFullYear() - newAge
        const newBirthday = new Date(today)
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
          maxDate={new Date()} // Prevent future dates
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input id="age" type="number" min="0" value={age || ""} onChange={handleAgeChange} placeholder="Age" />
      </div>
    </div>
  )
}

