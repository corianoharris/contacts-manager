"use client"

import { useState } from "react"
import { useContact } from "@/context/contact-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, formatDistanceToNow } from "date-fns"
import { Edit, Trash2, Phone, Mail } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ContactForm from "./contact-form"
import CommunicationForm from "./communication-form"
import type { CommunicationType, Contact as TypesContact } from "@/types/contact"
import { getStatusColor, getCommunicationIcon } from "@/lib/ui-helpers"
import { contextToTypesContact, typesToContextContact } from "@/lib/type-adapters"
import { formatPhoneNumber } from "@/lib/format-utils"

export default function ContactDetails() {
  const { state, dispatch } = useContact()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const contextContact = state.selectedContact
  if (!contextContact) return null

  // Convert the context contact to the types contact format for the form
  const contact = contextToTypesContact(contextContact)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    dispatch({ type: "DELETE_CONTACT", payload: contact.id })
    setIsDeleteDialogOpen(false)
  }

  const handleSaveContact = (updatedTypesContact: TypesContact) => {
    // Create a merged contact that preserves important properties from the original
    const mergedContact: TypesContact = {
      ...updatedTypesContact,
      id: contextContact.id,
      createdAt: contextContact.createdAt,
      communications: contact.communications,
      lastContactedAt: contextContact.lastContactedAt, // Preserve the original lastContactedAt
    }

    // Convert back to context format before dispatching
    const updatedContextContact = typesToContextContact(mergedContact)

    dispatch({
      type: "UPDATE_CONTACT",
      payload: updatedContextContact,
    })
    setIsEditing(false)
  }

  const handleAddCommunication = (types: CommunicationType[], notes: string, date?: string) => {
    dispatch({
      type: "ADD_COMMUNICATION",
      payload: {
        contactId: contact.id,
        type: types,
        notes: notes,
        date: date,
      },
    })
  }

  // Determine if contact has been contacted before
  const hasBeenContacted = contextContact.communications && contextContact.communications.length > 0

  // Get last contacted date from communications if lastContactedAt is null
  const lastContactedDate =
    contextContact.lastContactedAt || (hasBeenContacted ? contextContact.communications[0].date : null)

  return (
    <>
      {isEditing ? (
        <ContactForm contact={contact} onSave={handleSaveContact} onCancel={() => setIsEditing(false)} />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={contact.picture} alt={contact.name} />
                  <AvatarFallback className="text-lg">{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{contact.name}</CardTitle>
                  <CardDescription>{contact.role}</CardDescription>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge variant="secondary">{contact.category}</Badge>
                    <Badge className={`text-white ${getStatusColor(contact.status)}`}>{contact.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleEditClick}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDeleteClick} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Contact quick info with phone and email */}
            {(contact.phoneNumber || contact.email) && (
              <div className="flex flex-wrap gap-4 mb-6">
                {contact.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatPhoneNumber(contact.phoneNumber)}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>
            )}

            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Birthday</p>
                    <p>{contact.birthday ? format(new Date(contact.birthday), "MMMM d, yyyy") : "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p>{contact.age || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>
                      {contact.address?.street && `${contact.address.street}, `}
                      {contact.address?.city && `${contact.address.city}, `}
                      {contact.address?.state && `${contact.address.state}, `}
                      {contact.address?.zipCode && `${contact.address.zipCode}, `}
                      {contact.address?.country || "Not specified"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Kids</p>
                    <p>{contact.hasKids ? `Yes (${contact.numberOfKids})` : "No"}</p>
                  </div>
                  {contact.category === "Woman" && contact.maritalStatus && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                      <p>{contact.maritalStatus}</p>
                    </div>
                  )}

                  {/* Phone number and email in details section too */}
                  {contact.phoneNumber && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p>{formatPhoneNumber(contact.phoneNumber)}</p>
                    </div>
                  )}
                  {contact.email && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{contact.email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="whitespace-pre-line">{contact.description || "No description"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Additional Details</p>
                  <p className="whitespace-pre-line">{contact.additionalDetails || "No additional details"}</p>
                </div>

                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{format(new Date(contact.createdAt), "PPpp")}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{format(new Date(contact.updatedAt), "PPpp")}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Contacted</p>
                  <p>
                    {lastContactedDate && lastContactedDate !== null
                      ? `${format(new Date(lastContactedDate), "PPpp")} (${formatDistanceToNow(new Date(lastContactedDate), { addSuffix: true })})`
                      : "Never contacted"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="communications" className="space-y-6">
                <CommunicationForm onSave={handleAddCommunication} />

                <div className="space-y-4">
                  <h3 className="font-medium">Communication History</h3>

                  {!contextContact.communications || contextContact.communications.length === 0 ? (
                    <p className="text-muted-foreground">No communication history</p>
                  ) : (
                    <div className="space-y-4">
                      {contextContact.communications?.map((comm) => (
                        <div key={comm.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(comm.type) ? (
                                  comm.type.map((type) => (
                                    <div
                                      key={type}
                                      className="flex items-center space-x-1 bg-muted px-2 py-1 rounded-md"
                                    >
                                      {getCommunicationIcon(type)}
                                      <span className="text-sm capitalize">{type}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center space-x-1 bg-muted px-2 py-1 rounded-md">
                                    {getCommunicationIcon(comm.type)}
                                    <span className="text-sm capitalize">{comm.type}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(comm.date), "PPpp")} (
                                {formatDistanceToNow(new Date(comm.date), { addSuffix: true })})
                              </p>
                            </div>
                          </div>
                          {comm.notes && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="whitespace-pre-line text-sm">{comm.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {contact.name} from your contacts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

