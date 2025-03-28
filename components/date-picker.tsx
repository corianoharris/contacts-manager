"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  label: string
  placeholder?: string
  className?: string
  maxDate?: Date
  minDate?: Date
  disabled?: boolean
  isBirthday?: boolean // New prop to indicate if it's a birthday picker
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className,
  maxDate,
  minDate,
  disabled = false,
  isBirthday = false, // Default to false
}: DatePickerProps) {
  // Choose format based on whether it's a birthday
  const dateFormat = isBirthday ? "MMMM d" : "PPP"; // "MMMM d" for birthday (no year), "PPP" for full date

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          disabled={(date) => {
            if (maxDate && date > maxDate) return true
            if (minDate && date < minDate) return true
            return false
          }}
        />
      </PopoverContent>
    </Popover>
  )
}