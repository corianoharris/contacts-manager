"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatPhoneNumber } from "@/lib/format-utils"
import { getStatusColor } from "@/lib/ui-helpers"
import type { Contact } from "@/types/contact"
import { useState, useEffect } from "react"

interface ContactListProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
  pageSize?: number
}

export function ContactList({ contacts, onEdit, onDelete, pageSize = 6 }: ContactListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedContacts, setPaginatedContacts] = useState<Contact[]>([])

  // Calculate total pages and paginated contacts whenever contacts or page size changes
  useEffect(() => {
    const total = Math.ceil(contacts.length / pageSize)
    setTotalPages(total || 1) // Ensure at least 1 page even if no contacts

    // Adjust current page if it's now out of bounds
    if (currentPage > total && total > 0) {
      setCurrentPage(total)
    }

    // Slice the contacts array for the current page
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setPaginatedContacts(contacts.slice(startIndex, endIndex))
  }, [contacts, pageSize, currentPage])

  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-background">
        <p className="text-muted-foreground">No contacts found. Add a new contact to get started.</p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedContacts.map((contact) => (
          <Card key={contact.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.picture} alt={contact.name} />
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{contact.role}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary">{contact.category}</Badge>
                    <Badge className={`text-white ${getStatusColor(contact.status)}`}>{contact.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="px-4 pb-2">
                {(contact.phoneNumber || contact.email) && (
                  <div className="flex flex-col gap-1 text-sm">
                    {contact.phoneNumber && (
                      <div className="flex items-center">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        <span>{formatPhoneNumber(contact.phoneNumber)}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center">
                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 py-2 bg-muted/50 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {contact.lastContactedAt && contact.lastContactedAt !== null
                    ? `Last contacted ${formatDistanceToNow(new Date(contact.lastContactedAt), { addSuffix: true })}`
                    : "Never contacted"}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(contact)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {/* Generate page buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1

              // Show ellipsis for gaps
              if (!shouldShow) {
                // Only show one ellipsis between gaps
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page info */}
      {contacts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {paginatedContacts.length} of {contacts.length} contacts
        </div>
      )}
    </div>
  )
}

