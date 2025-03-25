"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { ContactCategory, ContactStatus, ContactType } from "@/types/contact"

interface FilterState {
  name: string
  role: string
  status: string
  category: string
  date: string
}

interface ContactFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
  filters?: FilterState
  setFilters?: React.Dispatch<React.SetStateAction<FilterState>>
}

const categories = Object.values(ContactCategory)
const statuses = Object.values(ContactStatus)
const contactTypes = Object.values(ContactType)

const getStatusColor = (status: ContactStatus) => {
  switch (status) {
    case ContactStatus.ACTIVE:
    case ContactStatus.Active:
      return "bg-green-500"
    case ContactStatus.INACTIVE:
    case ContactStatus.Inactive:
      return "bg-red-500"
    case ContactStatus.PENDING:
    case ContactStatus.Pending:
      return "bg-yellow-500"
    case ContactStatus.Blocked:
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

export function ContactFilters({ onFiltersChange, className, filters, setFilters }: ContactFiltersProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  // Initialize local filters state from props or with default values if props are undefined
  const [localFilters, setLocalFilters] = useState<FilterState>({
    name: filters?.name || "",
    role: filters?.role || "",
    status: filters?.status || "",
    category: filters?.category || "",
    date: filters?.date || "",
  })

  // Use local filters if props filters are undefined
  const currentFilters = filters || localFilters

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (setFilters) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value,
      }))
    } else {
      setLocalFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value,
      }))
    }
  }

  const handleSelectChange = (value: string, filterName: string) => {
    if (setFilters) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: value === "all" ? "" : value,
      }))
    } else {
      setLocalFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: value === "all" ? "" : value,
      }))
    }
  }

  const applyFilters = useCallback(() => {
    const filtersToApply = filters || localFilters

    // Only call onFiltersChange if it's a function
    if (typeof onFiltersChange === "function") {
      onFiltersChange(filtersToApply)

      toast({
        title: "Filters applied.",
        description: "Contacts list updated based on the selected filters.",
      })
    } else {
      console.warn("onFiltersChange is not a function or is undefined")

      toast({
        title: "Filters applied locally.",
        description: "Note: Filter changes won't affect the contact list until onFiltersChange is provided.",
      })
    }

    setOpen(false)
  }, [filters, localFilters, onFiltersChange, toast])

  const resetFilters = () => {
    const emptyFilters = {
      name: "",
      role: "",
      status: "",
      category: "",
      date: "",
    }

    if (setFilters) {
      setFilters(emptyFilters)
    } else {
      setLocalFilters(emptyFilters)
    }

    // Only call onFiltersChange if it's a function
    if (typeof onFiltersChange === "function") {
      onFiltersChange(emptyFilters)

      toast({
        title: "Filters reset.",
        description: "All filters have been cleared.",
      })
    } else {
      console.warn("onFiltersChange is not a function or is undefined")

      toast({
        title: "Filters reset locally.",
        description: "Note: Filter changes won't affect the contact list until onFiltersChange is provided.",
      })
    }

    setOpen(false)
  }

  const hasActiveFilters =
    currentFilters.name !== "" ||
    currentFilters.role !== "" ||
    currentFilters.status !== "" ||
    currentFilters.category !== "" ||
    currentFilters.date !== ""

  return (
    <Accordion type="single" collapsible className={cn("w-full", className)} value={open ? "item-1" : ""}>
      <AccordionItem value="item-1">
        <AccordionTrigger onClick={() => setOpen((o) => !o)}>
          Filters
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              Active
            </span>
          )}
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md bg-background">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Name</Label>
              <Input
                id="filter-name"
                name="name"
                placeholder="Search by name"
                value={currentFilters.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-role">Role</Label>
              <Input
                id="filter-role"
                name="role"
                placeholder="Search by role"
                value={currentFilters.role}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={currentFilters.status || "all"}
                onValueChange={(value) => handleSelectChange(value, "status")}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`} />
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Select
                value={currentFilters.category || "all"}
                onValueChange={(value) => handleSelectChange(value, "category")}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-date">Date</Label>
              <Input
                id="filter-date"
                name="date"
                type="date"
                placeholder="Filter by date"
                value={currentFilters.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 p-4">
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button type="button" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

