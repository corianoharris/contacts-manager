"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type { CommunicationType } from "@/types/contact"

// Define ContactFormInput type for the form
export interface ContactFormInput {
  id?: string
  name: string
  role: string
  status: string
  category: string
  description: string
  picture?: string
  birthday?: string
  age?: number | string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  hasKids?: boolean
  numberOfKids?: number
  maritalStatus?: string
  additionalDetails?: string
  phoneNumber?: string
  email?: string
  contactType?: string
  contactDate?: string
}

// Define and export the types
export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Communication {
  id: string
  type: CommunicationType | CommunicationType[]
  notes: string
  date: string
}

export interface Contact {
  id: string
  name: string
  role: string
  status: string
  category: string
  description: string
  picture?: string
  birthday?: string
  age?: number | string
  address: Address
  hasKids: boolean
  numberOfKids?: number
  maritalStatus?: string
  additionalDetails?: string
  communications?: Communication[]
  lastContactedAt: string | null
  createdAt: string
  updatedAt: string
  phoneNumber?: string
  email?: string
  contactType?: string
  contactDate?: string
  _synced?: boolean // Track if this contact is synced with the server
  _deleted?: boolean // Track if this contact was deleted while offline
}

// Define a type for pending changes
interface PendingChange {
  type: "create" | "update" | "delete"
  id: string
  data?: Contact
  timestamp: number
}

interface ContactState {
  contacts: Contact[]
  selectedContact: Contact | null
  loading: boolean
  error: string | null
  authenticated: boolean // Authentication state
  offlineMode: boolean // Flag for offline mode
  pendingChanges: PendingChange[] // Track changes made while offline
  syncing: boolean // Flag for when sync is in progress
}

type ContactAction =
  | { type: "SET_CONTACTS"; payload: Contact[] }
  | { type: "ADD_CONTACT"; payload: Contact }
  | { type: "UPDATE_CONTACT"; payload: Contact }
  | { type: "DELETE_CONTACT"; payload: string }
  | { type: "SELECT_CONTACT"; payload: string | null }
  | {
      type: "ADD_COMMUNICATION"
      payload: { contactId: string; type: CommunicationType[]; notes: string; date?: string }
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOAD_DATA"; payload: ContactState }
  | { type: "SET_AUTHENTICATED"; payload: boolean } // Authentication action
  | { type: "SET_OFFLINE_MODE"; payload: boolean } // Offline mode action
  | { type: "ADD_PENDING_CHANGE"; payload: PendingChange } // Add a pending change
  | { type: "REMOVE_PENDING_CHANGE"; payload: string } // Remove a pending change by ID
  | { type: "CLEAR_PENDING_CHANGES" } // Clear all pending changes
  | { type: "SET_SYNCING"; payload: boolean } // Set syncing state

// Initial state
const initialState: ContactState = {
  contacts: [],
  selectedContact: null,
  loading: false,
  error: null,
  authenticated: false, // Default to not authenticated
  offlineMode: false, // Default to online mode
  pendingChanges: [], // No pending changes initially
  syncing: false, // Not syncing initially
}

// Create context
const ContactContext = createContext<{
  state: ContactState
  dispatch: React.Dispatch<ContactAction>
  syncWithServer: () => Promise<void> // Add sync function to context
}>({
  state: initialState,
  dispatch: () => null,
  syncWithServer: async () => {},
})

// Custom hook to use context
export const useContact = () => useContext(ContactContext)

// Add persistent storage
const LOCAL_STORAGE_KEY = "contactManagementData"

// API functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
console.log("Using API URL:", API_URL)

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Function to check if API is available
async function checkApiAvailability(): Promise<boolean> {
  if (!isBrowser) return false

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_URL}/contacts`, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn("API availability check failed:", error)
    return false
  }
}

async function fetchContacts() {
  console.log("Fetching contacts from:", `${API_URL}/contacts`)
  try {
    const response = await fetch(`${API_URL}/contacts`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch contacts" }))
      throw new Error(errorData.error || "Failed to fetch contacts")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching contacts:", error)
    throw new Error(`Failed to fetch contacts: ${(error as Error).message}`)
  }
}

async function fetchContact(id: string) {
  console.log("Fetching contact from:", `${API_URL}/contacts/${id}`)
  try {
    const response = await fetch(`${API_URL}/contacts/${id}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch contact" }))
      throw new Error(errorData.error || "Failed to fetch contact")
    }
    return response.json()
  } catch (error) {
    console.error(`Error fetching contact ${id}:`, error)
    throw new Error(`Failed to fetch contact: ${(error as Error).message}`)
  }
}

async function createContact(contact: Omit<Contact, "id">) {
  try {
    console.log("Creating contact at:", `${API_URL}/contacts`)
    console.log("Creating contact with data:", JSON.stringify(contact, null, 2))

    const response = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("Create contact error response:", errorData)
      throw new Error(errorData.error || `Failed to create contact: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error in createContact:", error)
    throw new Error(`Failed to create contact: ${(error as Error).message || "Network error"}`)
  }
}

async function updateContactApi(id: string, contact: Partial<Contact>) {
  try {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to update contact" }))
      throw new Error(errorData.error || "Failed to update contact")
    }

    return response.json()
  } catch (error) {
    console.error(`Error updating contact ${id}:`, error)
    throw new Error(`Failed to update contact: ${(error as Error).message}`)
  }
}

async function deleteContactApi(id: string) {
  try {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete contact" }))
      throw new Error(errorData.error || "Failed to delete contact")
    }

    return response.json()
  } catch (error) {
    console.error(`Error deleting contact ${id}:`, error)
    throw new Error(`Failed to delete contact: ${(error as Error).message}`)
  }
}

async function createCommunication(contactId: string, type: CommunicationType[], notes: string) {
  try {
    const response = await fetch(`${API_URL}/contacts/${contactId}/communications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        types: type,
        notes,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to create communication" }))
      throw new Error(errorData.error || "Failed to create communication")
    }

    return response.json()
  } catch (error) {
    console.error(`Error creating communication for contact ${contactId}:`, error)
    throw new Error(`Failed to create communication: ${(error as Error).message}`)
  }
}

// Reducer function
function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case "SET_CONTACTS":
      return { ...state, contacts: action.payload }

    case "ADD_CONTACT":
      return {
        ...state,
        contacts: [...state.contacts, { ...action.payload, _synced: !state.offlineMode }],
      }

    case "UPDATE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.map((contact) =>
          contact.id === action.payload.id ? { ...action.payload, _synced: !state.offlineMode } : contact,
        ),
        selectedContact:
          state.selectedContact?.id === action.payload.id
            ? { ...action.payload, _synced: !state.offlineMode }
            : state.selectedContact,
      }

    case "DELETE_CONTACT": {
      // If we're offline, mark the contact as deleted but keep it in the array
      if (state.offlineMode) {
        return {
          ...state,
          contacts: state.contacts.map((contact) =>
            contact.id === action.payload ? { ...contact, _deleted: true, _synced: false } : contact,
          ),
          selectedContact: state.selectedContact?.id === action.payload ? null : state.selectedContact,
        }
      }

      // If we're online, actually remove it
      return {
        ...state,
        contacts: state.contacts.filter((contact) => contact.id !== action.payload),
        selectedContact: state.selectedContact?.id === action.payload ? null : state.selectedContact,
      }
    }

    case "SELECT_CONTACT":
      return {
        ...state,
        selectedContact: action.payload
          ? state.contacts.find((contact) => contact.id === action.payload) || null
          : null,
      }

    case "ADD_COMMUNICATION":
      const newCommunication: Communication = {
        id: uuidv4(),
        type: action.payload.type,
        notes: action.payload.notes,
        date: action.payload.date || new Date().toISOString(),
      }

      // Use the provided date from the communication or current date
      const communicationDate = action.payload.date || new Date().toISOString()

      return {
        ...state,
        contacts: state.contacts.map((contact) => {
          if (contact.id === action.payload.contactId) {
            const updatedContact = {
              ...contact,
              communications: [newCommunication, ...(contact.communications || [])],
              lastContactedAt: communicationDate,
              _synced: !state.offlineMode,
            }
            return updatedContact
          }
          return contact
        }),
        selectedContact:
          state.selectedContact?.id === action.payload.contactId
            ? {
                ...state.selectedContact,
                communications: [newCommunication, ...(state.selectedContact.communications || [])],
                lastContactedAt: communicationDate,
                _synced: !state.offlineMode,
              }
            : state.selectedContact,
      }

    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "LOAD_DATA":
      return action.payload

    case "SET_AUTHENTICATED":
      return { ...state, authenticated: action.payload }

    case "SET_OFFLINE_MODE":
      return { ...state, offlineMode: action.payload }

    case "ADD_PENDING_CHANGE":
      // Don't add duplicate changes for the same ID and type
      const existingChangeIndex = state.pendingChanges.findIndex(
        (change) => change.id === action.payload.id && change.type === action.payload.type,
      )

      if (existingChangeIndex >= 0) {
        // Replace the existing change with the new one
        const updatedChanges = [...state.pendingChanges]
        updatedChanges[existingChangeIndex] = action.payload
        return { ...state, pendingChanges: updatedChanges }
      }

      return {
        ...state,
        pendingChanges: [...state.pendingChanges, action.payload],
      }

    case "REMOVE_PENDING_CHANGE":
      return {
        ...state,
        pendingChanges: state.pendingChanges.filter((change) => change.id !== action.payload),
      }

    case "CLEAR_PENDING_CHANGES":
      return { ...state, pendingChanges: [] }

    case "SET_SYNCING":
      return { ...state, syncing: action.payload }

    default:
      return state
  }
}

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState)
  const [apiChecked, setApiChecked] = useState(false)
  const [connectionCheckInterval, setConnectionCheckInterval] = useState<NodeJS.Timeout | null>(null)

  // Check API availability on mount
  useEffect(() => {
    if (isBrowser && !apiChecked) {
      checkApiAvailability().then((available) => {
        if (!available) {
          console.warn("API is not available. Switching to offline mode.")
          dispatch({ type: "SET_OFFLINE_MODE", payload: true })

          // Show a user-friendly message
          dispatch({
            type: "SET_ERROR",
            payload: "Unable to connect to the server. Working in offline mode.",
          })
        }
        setApiChecked(true)
      })
    }
  }, [apiChecked])

  // Set up periodic connection check if in offline mode
  useEffect(() => {
    if (state.offlineMode && !connectionCheckInterval) {
      // Check connection every 30 seconds
      const interval = setInterval(() => {
        checkApiAvailability().then((available) => {
          if (available && state.offlineMode) {
            console.log("Connection restored. Ready to sync.")
            // Don't automatically switch to online mode, just notify
            dispatch({
              type: "SET_ERROR",
              payload: "Connection restored. Click 'Sync' to upload your changes.",
            })
          }
        })
      }, 30000) // 30 seconds

      setConnectionCheckInterval(interval)
    } else if (!state.offlineMode && connectionCheckInterval) {
      // Clear interval when back online
      clearInterval(connectionCheckInterval)
      setConnectionCheckInterval(null)
    }

    return () => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval)
      }
    }
  }, [state.offlineMode, connectionCheckInterval])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: parsedData })
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load saved contacts" })
    }
  }, [])

  // Save data to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to save contacts" })
    }
  }, [state])

  // Function to sync local changes with the server
  const syncWithServer = async () => {
    // First check if we can connect to the API
    const isApiAvailable = await checkApiAvailability()

    if (!isApiAvailable) {
      dispatch({
        type: "SET_ERROR",
        payload: "Cannot sync: Server is still unavailable.",
      })
      return
    }

    // Set syncing state
    dispatch({ type: "SET_SYNCING", payload: true })

    try {
      // Process all unsynced contacts
      const unsyncedContacts = state.contacts.filter((contact) => contact._synced === false)
      console.log(`Found ${unsyncedContacts.length} unsynced contacts to sync`)

      // Track successful and failed syncs
      let successCount = 0
      let failureCount = 0

      // Process each unsynced contact
      for (const contact of unsyncedContacts) {
        try {
          // Skip contacts marked for deletion
          if (contact._deleted) {
            try {
              await deleteContactApi(contact.id)
              successCount++
            } catch (error) {
              console.error(`Failed to delete contact ${contact.id}:`, error)
              failureCount++
            }
            continue
          }

          // Clean up internal tracking properties before sending to API
          const cleanContact = { ...contact }
          delete cleanContact._synced
          delete cleanContact._deleted

          // Check if this is a new contact (no server ID) or an update
          const isNew = state.pendingChanges.some((change) => change.id === contact.id && change.type === "create")

          if (isNew) {
            // Create new contact on server
            const newContact = await createContact(cleanContact)
            dispatch({
              type: "UPDATE_CONTACT",
              payload: { ...newContact, _synced: true },
            })
            successCount++
          } else {
            // Update existing contact
            const updatedContact = await updateContactApi(contact.id, cleanContact)
            dispatch({
              type: "UPDATE_CONTACT",
              payload: { ...updatedContact, _synced: true },
            })
            successCount++
          }
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error)
          failureCount++
        }
      }

      // If all syncs were successful, switch back to online mode
      if (failureCount === 0 && successCount > 0) {
        dispatch({ type: "SET_OFFLINE_MODE", payload: false })
        dispatch({
          type: "SET_ERROR",
          payload: `Successfully synced ${successCount} contacts with the server.`,
        })

        // Clear pending changes
        dispatch({ type: "CLEAR_PENDING_CHANGES" })

        // Refresh all contacts from server to ensure we're in sync
        try {
          const serverContacts = await fetchContacts()
          dispatch({ type: "SET_CONTACTS", payload: serverContacts })
        } catch (error) {
          console.error("Failed to refresh contacts after sync:", error)
        }
      } else if (successCount > 0) {
        dispatch({
          type: "SET_ERROR",
          payload: `Partially synced: ${successCount} succeeded, ${failureCount} failed.`,
        })
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: "Sync failed. Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error during sync:", error)
      dispatch({
        type: "SET_ERROR",
        payload: `Sync error: ${(error as Error).message}`,
      })
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false })
    }
  }

  // Enhanced dispatch with API calls and offline tracking
  const enhancedDispatch = async (action: ContactAction) => {
    // Don't set loading for certain actions
    if (
      action.type !== "SET_AUTHENTICATED" &&
      action.type !== "SET_OFFLINE_MODE" &&
      action.type !== "ADD_PENDING_CHANGE" &&
      action.type !== "REMOVE_PENDING_CHANGE" &&
      action.type !== "CLEAR_PENDING_CHANGES" &&
      action.type !== "SET_SYNCING"
    ) {
      dispatch({ type: "SET_LOADING", payload: true })
    }

    try {
      // Track changes for offline mode
      if (state.offlineMode) {
        switch (action.type) {
          case "ADD_CONTACT":
            // Add to pending changes
            dispatch({
              type: "ADD_PENDING_CHANGE",
              payload: {
                type: "create",
                id: action.payload.id,
                data: action.payload,
                timestamp: Date.now(),
              },
            })
            // Update local state
            dispatch(action)
            break

          case "UPDATE_CONTACT":
            // Add to pending changes
            dispatch({
              type: "ADD_PENDING_CHANGE",
              payload: {
                type: "update",
                id: action.payload.id,
                data: action.payload,
                timestamp: Date.now(),
              },
            })
            // Update local state
            dispatch(action)
            break

          case "DELETE_CONTACT":
            // Add to pending changes
            dispatch({
              type: "ADD_PENDING_CHANGE",
              payload: {
                type: "delete",
                id: action.payload,
                timestamp: Date.now(),
              },
            })
            // Update local state
            dispatch(action)
            break

          case "ADD_COMMUNICATION":
            // This will be handled as an update to the contact
            dispatch(action)

            // Find the updated contact
            const updatedContact = state.contacts.find((contact) => contact.id === action.payload.contactId)

            if (updatedContact) {
              // Add to pending changes
              dispatch({
                type: "ADD_PENDING_CHANGE",
                payload: {
                  type: "update",
                  id: updatedContact.id,
                  data: updatedContact,
                  timestamp: Date.now(),
                },
              })
            }
            break

          default:
            dispatch(action)
        }

        dispatch({ type: "SET_LOADING", payload: false })
        return
      }

      // Online mode - normal API operations
      switch (action.type) {
        case "ADD_CONTACT":
          try {
            console.log("Dispatching ADD_CONTACT with payload:", action.payload)

            // First, add the contact to local state for immediate feedback
            dispatch({ type: "ADD_CONTACT", payload: action.payload })

            // Then try to save to the API
            try {
              const newContact = await createContact(action.payload)
              // Update with the server-returned data if successful
              dispatch({ type: "UPDATE_CONTACT", payload: { ...newContact, _synced: true } })
            } catch (apiError) {
              console.error("API Error in ADD_CONTACT:", apiError)

              // If we get a network error, switch to offline mode
              if ((apiError as Error).message.includes("Failed to fetch")) {
                console.warn("Network error detected. Switching to offline mode.")
                dispatch({ type: "SET_OFFLINE_MODE", payload: true })

                // Add to pending changes
                dispatch({
                  type: "ADD_PENDING_CHANGE",
                  payload: {
                    type: "create",
                    id: action.payload.id,
                    data: action.payload,
                    timestamp: Date.now(),
                  },
                })

                dispatch({
                  type: "SET_ERROR",
                  payload: "Network connection lost. Working in offline mode.",
                })
              } else {
                // Otherwise just show the error
                dispatch({ type: "SET_ERROR", payload: (apiError as Error).message })
              }
            }
          } catch (error) {
            console.error("Error in ADD_CONTACT:", error)
            dispatch({ type: "SET_ERROR", payload: (error as Error).message })
          }
          break

        case "UPDATE_CONTACT":
          try {
            // Update local state first
            dispatch({ type: "UPDATE_CONTACT", payload: action.payload })

            // Then try API
            try {
              const updatedContact = await updateContactApi(action.payload.id, action.payload)
              // Update again with server data if needed
              dispatch({ type: "UPDATE_CONTACT", payload: { ...updatedContact, _synced: true } })
            } catch (apiError) {
              console.error("API Error in UPDATE_CONTACT:", apiError)

              // Check for network error
              if ((apiError as Error).message.includes("Failed to fetch")) {
                dispatch({ type: "SET_OFFLINE_MODE", payload: true })

                // Add to pending changes
                dispatch({
                  type: "ADD_PENDING_CHANGE",
                  payload: {
                    type: "update",
                    id: action.payload.id,
                    data: action.payload,
                    timestamp: Date.now(),
                  },
                })

                dispatch({
                  type: "SET_ERROR",
                  payload: "Network connection lost. Working in offline mode.",
                })
              } else {
                dispatch({ type: "SET_ERROR", payload: (apiError as Error).message })
              }
            }
          } catch (error) {
            console.error("Error in UPDATE_CONTACT:", error)
            dispatch({ type: "SET_ERROR", payload: (error as Error).message })
          }
          break

        case "DELETE_CONTACT":
          try {
            // Delete locally first
            dispatch({ type: "DELETE_CONTACT", payload: action.payload })

            // Then try API
            try {
              await deleteContactApi(action.payload)
            } catch (apiError) {
              console.error("API Error in DELETE_CONTACT:", apiError)

              // Check for network error
              if ((apiError as Error).message.includes("Failed to fetch")) {
                dispatch({ type: "SET_OFFLINE_MODE", payload: true })

                // Add to pending changes
                dispatch({
                  type: "ADD_PENDING_CHANGE",
                  payload: {
                    type: "delete",
                    id: action.payload,
                    timestamp: Date.now(),
                  },
                })

                dispatch({
                  type: "SET_ERROR",
                  payload: "Network connection lost. Working in offline mode.",
                })
              } else {
                dispatch({ type: "SET_ERROR", payload: (apiError as Error).message })
              }
            }
          } catch (error) {
            console.error("Error in DELETE_CONTACT:", error)
            dispatch({ type: "SET_ERROR", payload: (error as Error).message })
          }
          break

        case "ADD_COMMUNICATION":
          try {
            const { contactId, type, notes } = action.payload

            // Add communication locally first
            dispatch({ type: "ADD_COMMUNICATION", payload: { contactId, type, notes } })

            // Then try API
            try {
              const newCommunication = await createCommunication(contactId, type, notes)
              // Refresh the contact to get updated data
              const refreshedContact = await fetchContact(contactId)
              dispatch({ type: "UPDATE_CONTACT", payload: { ...refreshedContact, _synced: true } })
            } catch (apiError) {
              console.error("API Error in ADD_COMMUNICATION:", apiError)

              // Check for network error
              if ((apiError as Error).message.includes("Failed to fetch")) {
                dispatch({ type: "SET_OFFLINE_MODE", payload: true })

                // Find the updated contact
                const updatedContact = state.contacts.find((contact) => contact.id === contactId)

                if (updatedContact) {
                  // Add to pending changes
                  dispatch({
                    type: "ADD_PENDING_CHANGE",
                    payload: {
                      type: "update",
                      id: updatedContact.id,
                      data: updatedContact,
                      timestamp: Date.now(),
                    },
                  })
                }

                dispatch({
                  type: "SET_ERROR",
                  payload: "Network connection lost. Working in offline mode.",
                })
              } else {
                dispatch({ type: "SET_ERROR", payload: (apiError as Error).message })
              }
            }
          } catch (error) {
            console.error("Error in ADD_COMMUNICATION:", error)
            dispatch({ type: "SET_ERROR", payload: (error as Error).message })
          }
          break

        default:
          dispatch(action)
      }
    } catch (error) {
      console.error("API error:", error)
      dispatch({ type: "SET_ERROR", payload: (error as Error).message })
    } finally {
      if (
        action.type !== "SET_AUTHENTICATED" &&
        action.type !== "SET_OFFLINE_MODE" &&
        action.type !== "ADD_PENDING_CHANGE" &&
        action.type !== "REMOVE_PENDING_CHANGE" &&
        action.type !== "CLEAR_PENDING_CHANGES" &&
        action.type !== "SET_SYNCING"
      ) {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }
  }

  return (
    <ContactContext.Provider
      value={{
        state,
        dispatch: enhancedDispatch,
        syncWithServer,
      }}
    >
      {children}
    </ContactContext.Provider>
  )
}

