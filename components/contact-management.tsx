"use client"

import { useState, useEffect } from "react"
import { useContact, type ContactFormInput } from "@/context/contact-context"
import { ContactList } from "./contact-list"
import ContactForm from "./contact-form"
import { ContactFilters } from "@/components/contact-filters"
import ContactStatistics from "./contact-statistics"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Plus, WifiOff, RefreshCw } from "lucide-react"
import { CheckNotifications } from "./check-notifications"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// Import Contact type from types/contact
import type { Contact } from "@/types/contact"
import { v4 as uuidv4 } from "uuid" // Import uuidv4

export default function ContactManagement() {
  const { state, dispatch, syncWithServer } = useContact()
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    status: "",
    category: "",
    date: "",
  })

  const { toast } = useToast()

  // Show toast when offline mode changes
  useEffect(() => {
    if (state.offlineMode) {
      toast({
        title: "Offline Mode Activated",
        description: "Changes will be saved locally but not synced to the server until connection is restored.",
        duration: 5000,
      })
    }
  }, [state.offlineMode, toast])

  // Check if we've reached Dunbar's number (150 contacts)
  const isAtContactLimit = state.contacts.length >= 150

  // Count unsynced changes
  const unsyncedChangesCount = state.contacts.filter((contact) => contact._synced === false).length

  // Handle sync button click
  const handleSync = async () => {
    toast({
      title: "Syncing...",
      description: "Attempting to sync your changes with the server.",
      duration: 10000,
    });
  
    try {
      await syncWithServer();
      // Success toast is handled in syncWithServer
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: `Error: ${(error as Error).message || "Unknown error occurred"}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Adding a new contact
  const handleAddContact = (contact: ContactFormInput) => {
    // Prevent adding if at limit
    if (isAtContactLimit) {
      toast({
        title: "Contact Limit Reached",
        description:
          "You've reached the maximum of 150 contacts (Dunbar's number). Please archive some contacts first.",
        variant: "destructive",
      })
      return
    }

    // Prepare the contact data
    const newContact = {
      ...contact,
      id: contact.id || uuidv4(), // Ensure we have an ID
      picture: contact.picture || undefined,
      address: {
        street: contact.address?.street || "",
        city: contact.address?.city || "",
        state: contact.address?.state || "",
        zipCode: contact.address?.zipCode || "",
        country: contact.address?.country || "",
      },
      hasKids: contact.hasKids || false,
      numberOfKids: contact.numberOfKids || 0,
      maritalStatus: contact.maritalStatus || undefined,
      additionalDetails: contact.additionalDetails || "",
      birthday: contact.birthday || undefined,
      age: contact.age || undefined,
      communications: [], // Initialize empty communications array
      lastContactedAt: null, // Initialize lastContactedAt as null
      createdAt: new Date().toISOString(), // Set creation date
      updatedAt: new Date().toISOString(), // Set update date
    }

    console.log("Dispatching ADD_CONTACT with:", JSON.stringify(newContact, null, 2))

    // Use local state to track the operation
    setIsAddingContact(false) // Close the form immediately for better UX

    // Show loading toast
    toast({
      title: "Adding Contact...",
      description: "Please wait while we add the contact.",
    })

    // Dispatch the action
    dispatch({
      type: "ADD_CONTACT",
      payload: newContact,
    })
  }

  // Convert context contact to types/contact format
  const convertToTypeContact = (contextContact: any): Contact => {
    return {
      id: contextContact.id,
      name: contextContact.name,
      role: contextContact.role,
      status: contextContact.status,
      category: contextContact.category,
      description: contextContact.description,
      picture: contextContact.picture,
      birthday: contextContact.birthday,
      age: contextContact.age,
      address: contextContact.address,
      hasKids: contextContact.hasKids,
      numberOfKids: contextContact.numberOfKids,
      maritalStatus: contextContact.maritalStatus,
      additionalDetails: contextContact.additionalDetails,
      communicationHistory:
        contextContact.communications?.map((comm: any) => ({
          id: comm.id,
          types: Array.isArray(comm.type) ? comm.type : [comm.type], // Ensure it's an array
          notes: comm.notes,
          timestamp: comm.date,
        })) || [],
      communications: [], // Required for type compatibility
      lastContactedAt: contextContact.lastContactedAt,
      createdAt: contextContact.createdAt,
      updatedAt: contextContact.updatedAt,
      phoneNumber: contextContact.phoneNumber,
      email: contextContact.email,
      contactType: contextContact.contactType,
      contactDate: contextContact.contactDate,
      _synced: contextContact._synced,
      _deleted: contextContact._deleted,
    } as Contact
  }

  // Editing a contact - convert back from types/contact to context/contact format
  const handleEditContact = (updatedContact: Contact) => {
    dispatch({
      type: "UPDATE_CONTACT",
      payload: {
        ...updatedContact,
        updatedAt: new Date().toISOString(),
        communications:
          updatedContact.communicationHistory?.map((entry) => ({
            id: entry.id || uuidv4(),
            date: entry.timestamp || new Date().toISOString(),
            type: entry.types,
            notes: entry.notes,
          })) || [],
        lastContactedAt: updatedContact.lastContactedAt || null,
        picture: updatedContact.picture || "",
        address: {
          street: updatedContact.address?.street || "",
          city: updatedContact.address?.city || "",
          state: updatedContact.address?.state || "",
          zipCode: updatedContact.address?.zipCode || "",
          country: updatedContact.address?.country || "",
        },
        hasKids: updatedContact.hasKids || false,
        numberOfKids: updatedContact.numberOfKids || 0,
        maritalStatus: updatedContact.maritalStatus || "Single",
        additionalDetails: updatedContact.additionalDetails || "",
        birthday: updatedContact.birthday || "",
        age: updatedContact.age || 0,
      } as any,
    })

    setEditingContact(null)

    toast({
      title: "Contact Updated",
      description: `${updatedContact.name}'s information has been updated.`,
    })
  }

  // Deleting a contact
  const handleDeleteContact = (id: string) => {
    const contactToDelete = state.contacts.find((contact) => contact.id === id)
    dispatch({ type: "DELETE_CONTACT", payload: id })
    toast({
      title: "Contact Deleted",
      description: `${contactToDelete?.name} has been removed from your contacts.`,
      variant: "destructive",
    })
  }

  // Filter contacts based on current filters
  const filteredContacts = state.contacts
    .filter((contact) => {
      // Skip contacts marked as deleted in offline mode
      if (contact._deleted) return false

      return (
        contact.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        (filters.role === "" || contact.role.toLowerCase().includes(filters.role.toLowerCase())) &&
        (filters.status === "" || contact.status === filters.status) &&
        (filters.category === "" || contact.category === filters.category)
      )
    })
    .map((contact) => convertToTypeContact(contact))

  // Implement the handleFiltersChange function
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground">Manage your contacts, track communication, and stay in touch.</p>
        </div>
        <div className="flex gap-2">
          {state.offlineMode && unsyncedChangesCount > 0 && (
            <Button
              onClick={handleSync}
              variant="outline"
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              disabled={state.syncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${state.syncing ? "animate-spin" : ""}`} />
              {state.syncing ? "Syncing..." : `Sync (${unsyncedChangesCount})`}
            </Button>
          )}
          <Button onClick={() => setIsAddingContact(true)} className="md:self-start" disabled={isAtContactLimit}>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>

      {state.offlineMode && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You're currently working offline. Changes will be saved locally but not synced to the server.
            {unsyncedChangesCount > 0 && ` You have ${unsyncedChangesCount} unsynced changes.`}
          </AlertDescription>
        </Alert>
      )}

      <ContactStatistics />

      <CheckNotifications contacts={filteredContacts} />

      <ContactFilters filters={filters} setFilters={setFilters} onFiltersChange={handleFiltersChange} />

      {(isAddingContact || editingContact) && (
        <ContactForm
          contact={editingContact}
          onSave={(contact) =>
            editingContact ? handleEditContact(contact) : handleAddContact(contact as unknown as ContactFormInput)
          }
          onCancel={() => {
            setIsAddingContact(false)
            setEditingContact(null)
          }}
        />
      )}

      <ContactList contacts={filteredContacts} onEdit={setEditingContact} onDelete={handleDeleteContact} />
    </div>
  )
}

