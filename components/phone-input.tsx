"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { formatPhoneNumber } from "@/lib/format-utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
  name?: string
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Phone number",
  className,
  required,
  id,
  name,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(formatPhoneNumber(value))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Store the raw input for the parent component
    onChange(input.replace(/\D/g, ""))

    // Format for display
    setDisplayValue(formatPhoneNumber(input))
  }

  const handleBlur = () => {
    // Ensure the display value is formatted when the user leaves the field
    setDisplayValue(formatPhoneNumber(value))
  }

  return (
    <Input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      required={required}
      id={id}
      name={name}
    />
  )
}

