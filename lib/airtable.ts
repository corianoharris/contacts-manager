import Airtable from "airtable"
import type { Contact, CommunicationEntry } from "@/types/contact"

// Initialize Airtable with Personal Access Token
// Check for both possible environment variable names with the new NEXT_PUBLIC_ prefix
const token = process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY
console.log("Airtable authentication present:", !!token)

if (!token) {
  console.error("No Airtable authentication token found in environment variables!")
  console.error("Please set either AIRTABLE_PAT or AIRTABLE_API_KEY")
}

// The Airtable library still uses "apiKey" parameter even for PATs
const airtable = new Airtable({
  apiKey: token || "", // Provide empty string as fallback to avoid undefined
})

// Get the base with updated environment variable name
const baseId = process.env.AIRTABLE_BASE_ID || ""
console.log("Airtable base ID present:", !!baseId)

if (!baseId) {
  console.error("AIRTABLE_BASE_ID environment variable is not set!")
}

const base = airtable.base(baseId)

// Table names
const CONTACTS_TABLE = "Contacts"
const COMMUNICATIONS_TABLE = "Communications"

// Convert Airtable record to Contact
export function airtableToContact(record: any): Contact {
  return {
    id: record.id,
    name: record.get("Name") || "",
    role: record.get("Role") || "",
    status: record.get("Status") || "Active",
    category: record.get("Category") || "Client",
    description: record.get("Description") || "",
    picture: undefined, // Not in Airtable schema
    birthday: record.get("Birthday") || undefined,
    age: record.get("Age")?.toString() || undefined,
    address: {
      street: "", // Address is a single field in Airtable
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    hasKids: record.get("Has Kids") || false,
    numberOfKids: record.get("Number of Kids") || 0,
    maritalStatus: record.get("Marital Status") || undefined,
    additionalDetails: record.get("Additional Details") || "",
    communications: [], // Will be populated separately
    lastContactedAt: record.get("Last Contacted At") || null,
    createdAt: record.get("Created At") || new Date().toISOString(),
    updatedAt: record.get("Updated At") || new Date().toISOString(),
    phoneNumber: record.get("Phone") || "",
    email: record.get("Email") || "",
    contactType: undefined, // Not in Airtable schema
    contactDate: undefined, // Not in Airtable schema
  }
}

// Convert Contact to Airtable fields
export function contactToAirtable(contact: Contact): Record<string, any> {
  // Combine address fields into a single string for Airtable
  const addressString = [
    contact.address?.street,
    contact.address?.city,
    contact.address?.state,
    contact.address?.zipCode,
    contact.address?.country,
  ]
    .filter(Boolean)
    .join(", ")

  // Create a clean object with only the fields that exist in Airtable
  const fields: Record<string, any> = {
    Name: contact.name,
    Role: contact.role || "",
    Status: contact.status || "Active",
    Category: contact.category || "Client",
    Description: contact.description || "",
    Phone: contact.phoneNumber || "",
    Email: contact.email || "",
  }

  // Only add fields if they have values
  if (contact.birthday) fields.Birthday = contact.birthday
  if (contact.age) fields.Age = Number.parseInt(contact.age.toString())
  if (addressString) fields.Address = addressString
  if (contact.hasKids !== undefined) fields["Has Kids"] = contact.hasKids
  if (contact.numberOfKids !== undefined) fields["Number of Kids"] = contact.numberOfKids
  if (contact.maritalStatus) fields["Marital Status"] = contact.maritalStatus
  if (contact.additionalDetails) fields["Additional Details"] = contact.additionalDetails
  if (contact.lastContactedAt) fields["Last Contacted At"] = contact.lastContactedAt

  // Always include timestamps
  fields["Created At"] = contact.createdAt || new Date().toISOString()
  fields["Updated At"] = new Date().toISOString()

  console.log("Prepared Airtable fields:", JSON.stringify(fields, null, 2))
  return fields
}

// Create a new contact
export async function createContact(contact: Omit<Contact, "id">): Promise<Contact | null> {
  try {
    console.log("Creating contact in Airtable:", JSON.stringify(contact, null, 2))
    const fields = contactToAirtable(contact as Contact)

    // Log the exact data being sent to Airtable
    console.log("Sending to Airtable:", JSON.stringify(fields, null, 2))

    const record = await base(CONTACTS_TABLE).create(fields)
    return airtableToContact(record)
  } catch (error) {
    console.error("Error creating contact in Airtable:", error)
    // Enhance error message with more details
    const errorMessage = (error as any).message || "Unknown error"
    const statusCode = (error as any).statusCode
    const errorDetails = (error as any).error

    throw new Error(
      `Failed to create contact: ${errorMessage}. Status: ${statusCode}. Details: ${JSON.stringify(errorDetails)}`,
    )
  }
}

// Fetch all contacts
export async function fetchContacts(): Promise<Contact[]> {
  try {
    const records = await base(CONTACTS_TABLE).select().all()
    const contacts = records.map(airtableToContact)

    // Fetch communications for each contact
    for (const contact of contacts) {
      contact.communications = await fetchCommunications(contact.id)
    }

    return contacts
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return []
  }
}

// Fetch a single contact by ID
export async function fetchContact(id: string): Promise<Contact | null> {
  try {
    const record = await base(CONTACTS_TABLE).find(id)
    const contact = airtableToContact(record)

    // Fetch communications for this contact
    contact.communications = await fetchCommunications(id)

    return contact
  } catch (error) {
    console.error(`Error fetching contact ${id}:`, error)
    return null
  }
}

// Update an existing contact
export async function updateContact(id: string, contact: Partial<Contact>): Promise<Contact | null> {
  try {
    const fields = contactToAirtable(contact as Contact)
    const record = await base(CONTACTS_TABLE).update(id, fields)
    return airtableToContact(record)
  } catch (error) {
    console.error(`Error updating contact ${id}:`, error)
    throw new Error(`Failed to update contact: ${(error as Error).message}`)
  }
}

// Delete a contact
export async function deleteContact(id: string): Promise<boolean> {
  try {
    await base(CONTACTS_TABLE).destroy(id)
    return true
  } catch (error) {
    console.error(`Error deleting contact ${id}:`, error)
    throw new Error(`Failed to delete contact: ${(error as Error).message}`)
  }
}

// Fetch communications for a contact
export async function fetchCommunications(contactId: string): Promise<CommunicationEntry[]> {
  try {
    const records = await base(COMMUNICATIONS_TABLE)
      .select({
        filterByFormula: `FIND("${contactId}", ARRAYJOIN(Contact, ",")) > 0`,
      })
      .all()

    return records.map(airtableToCommunication)
  } catch (error) {
    console.error(`Error fetching communications for contact ${contactId}:`, error)
    return []
  }
}

// Convert Airtable record to Communication
export function airtableToCommunication(record: any): CommunicationEntry {
  return {
    id: record.id,
    types: record.get("Type") || [],
    notes: record.get("Notes") || "",
    timestamp: record.get("Date") || new Date().toISOString(),
  }
}

// Convert Communication to Airtable fields
export function communicationToAirtable(comm: CommunicationEntry, contactId: string): Record<string, any> {
  return {
    Contact: [contactId],
    Type: comm.types,
    Notes: comm.notes,
    Date: comm.timestamp,
  }
}

// Create a new communication
export async function createCommunication(
  contactId: string,
  communication: Omit<CommunicationEntry, "id">,
): Promise<CommunicationEntry | null> {
  try {
    const fields = communicationToAirtable(communication as CommunicationEntry, contactId)
    const record = await base(COMMUNICATIONS_TABLE).create(fields)

    // Update the LastContactedAt field for the contact
    await base(CONTACTS_TABLE).update(contactId, {
      "Last Contacted At": new Date().toISOString(),
    })

    return airtableToCommunication(record)
  } catch (error) {
    console.error(`Error creating communication for contact ${contactId}:`, error)
    throw new Error(`Failed to create communication: ${(error as Error).message}`)
  }
}

