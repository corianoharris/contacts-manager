import type { AirtableBase } from "airtable/lib/airtable_base"
import Airtable from "airtable"

interface Contact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  status: string
  category: string
  description: string
  birthday: string
  birthdayDisplay: string
  age: number
  address: string
  hasKids: boolean
  numberOfKids: number
  maritalStatus: string
  additionalDetails: string
  contactType: string
  contactDate: string
  createdAt: string
  updatedAt: string
  notifyBirthday: boolean
  communications: string
  lastContactedAt?: string
}

// Function to get the Airtable base
const getAirtableBase = (): AirtableBase | null => {
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.warn("Airtable API key or base ID not found in environment variables. Using mock data.")
    return null
  }

  try {
    // Use the imported Airtable instead of require
    Airtable.configure({
      endpointUrl: "https://api.airtable.com",
      apiKey: process.env.AIRTABLE_API_KEY,
    })
    return Airtable.base(process.env.AIRTABLE_BASE_ID)
  } catch (error) {
    console.error("Error initializing Airtable:", error)
    return null
  }
}

const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME || "Contacts"

// Function to format the contact
const formatContact = (record: any): Contact => {
  // Format birthday to only show month and day
  let birthdayDisplay = ""
  if (record.get("birthday")) {
    try {
      const birthdayValue = record.get("birthday")

      // Check if it's in the --MM-DD format (year hidden)
      if (birthdayValue.startsWith("--")) {
        // Parse month and day from --MM-DD format
        const parts = birthdayValue.substring(2).split("-")
        if (parts.length === 2) {
          birthdayDisplay = `${parts[0]}/${parts[1]}`
        }
      } else {
        // Regular date format
        const date = new Date(birthdayValue)
        if (!isNaN(date.getTime())) {
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          const day = date.getDate().toString().padStart(2, "0")
          birthdayDisplay = `${month}/${day}`
        }
      }
    } catch (e) {
      console.warn("Error formatting birthday:", e)
    }
  }

  return {
    id: record.id,
    name: record.get("name") || "",
    role: record.get("role") || "",
    email: record.get("email") || "",
    phone: record.get("phone") || "",
    status: record.get("status") || "active",
    category: record.get("category") || "Client",
    description: record.get("description") || "",
    birthday: record.get("birthday") || "",
    birthdayDisplay: birthdayDisplay, // Use formatted birthday
    age: record.get("age") || 0,
    address: record.get("address") || "",
    hasKids: record.get("has kids") || false,
    numberOfKids: record.get("number of kids") || 0,
    maritalStatus: record.get("marital status") || "",
    additionalDetails: record.get("additional details") || "",
    contactType: record.get("contact type") || "",
    contactDate: record.get("contact date") || "",
    createdAt: record.get("created at") || "",
    updatedAt: record.get("updated at") || "",
    notifyBirthday: record.get("notify birthday") || false,
    communications: record.get("Communications") || "",
    lastContactedAt: record.get("last contacted at") || null, // Updated field name
  }
}

// Function to get all contacts
export async function getAllContacts(): Promise<Contact[]> {
  const base = getAirtableBase()
  const shouldUseMockData = !base
  const contactsTable = base ? base(tableName) : null

  const generateMockContacts = (count: number): Contact[] => {
    const mockContacts: Contact[] = []
    for (let i = 1; i <= count; i++) {
      mockContacts.push({
        id: i.toString(),
        name: `Mock Contact ${i}`,
        email: `mock${i}@example.com`,
        phone: "123-456-7890",
        role: "Mock Role",
        category: "Mock Category",
        status: "active",
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        birthday: "",
        birthdayDisplay: "",
        age: 0,
        address: "",
        hasKids: false,
        numberOfKids: 0,
        maritalStatus: "",
        additionalDetails: "",
        contactType: "",
        contactDate: "",
        notifyBirthday: false,
        communications: "",
      })
    }
    return mockContacts
  }

  // If we should use mock data, return mock data immediately
  if (shouldUseMockData || !contactsTable) {
    console.log("Using mock data for getAllContacts")
    return generateMockContacts(5) // Reduced to 5 for faster loading
  }

  try {
    console.log("Fetching all contacts from Airtable")
    const records = await contactsTable
      .select({
        sort: [{ field: "name", direction: "asc" }],
      })
      .all()
    console.log(`Successfully fetched ${records.length} contacts from Airtable`)
    return records.map(formatContact)
  } catch (error) {
    console.error("Error fetching contacts from Airtable:", error)
    return []
  }
}

// Function to get contact stats
export async function getContactStats(): Promise<{
  total: number
  active: number
  inactive: number
  recentlyContacted: number
  neverContacted: Contact[]
}> {
  try {
    const contacts = await getAllContacts()

    const total = contacts.length
    const active = contacts.filter((contact) => contact.status === "active").length
    const inactive = contacts.filter((contact) => contact.status === "inactive").length
    const recentlyContacted = contacts.filter((contact) => {
      if (!contact.lastContactedAt) return false
      const lastContactedDate = new Date(contact.lastContactedAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return lastContactedDate >= thirtyDaysAgo
    }).length
    const neverContacted = contacts.filter((contact) => !contact.lastContactedAt)

    return {
      total,
      active,
      inactive,
      recentlyContacted,
      neverContacted,
    }
  } catch (error) {
    console.error("Error getting contact stats:", error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      recentlyContacted: 0,
      neverContacted: [],
    }
  }
}

// Function to get a contact by ID
export async function getContactById(id: string): Promise<Contact | null> {
  const base = getAirtableBase()
  const shouldUseMockData = !base
  const contactsTable = base ? base(tableName) : null

  const generateMockContacts = (count: number): Contact[] => {
    const mockContacts: Contact[] = []
    for (let i = 1; i <= count; i++) {
      mockContacts.push({
        id: i.toString(),
        name: `Mock Contact ${i}`,
        email: `mock${i}@example.com`,
        phone: "123-456-7890",
        role: "Mock Role",
        category: "Mock Category",
        status: "active",
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        birthday: "",
        birthdayDisplay: "",
        age: 0,
        address: "",
        hasKids: false,
        numberOfKids: 0,
        maritalStatus: "",
        additionalDetails: "",
        contactType: "",
        contactDate: "",
        notifyBirthday: false,
        communications: "",
      })
    }
    return mockContacts
  }

  // If we should use mock data, return mock data immediately
  if (shouldUseMockData || !contactsTable) {
    console.log("Using mock data for getContactById")
    const mockData = generateMockContacts(5)
    const contact = mockData.find((contact) => contact.id === id)
    return contact || null
  }

  try {
    console.log(`Fetching contact with ID ${id} from Airtable`)
    const record = await contactsTable.find(id)
    console.log(`Successfully fetched contact with ID ${id} from Airtable`)
    return formatContact(record)
  } catch (error) {
    console.error(`Error fetching contact with ID ${id} from Airtable:`, error)
    return null
  }
}

// Function to update a contact
export async function updateContact(id: string, data: Partial<Contact>): Promise<Contact | null> {
  const base = getAirtableBase()
  const shouldUseMockData = !base
  const contactsTable = base ? base(tableName) : null

  const generateMockContacts = (count: number): Contact[] => {
    const mockContacts: Contact[] = []
    for (let i = 1; i <= count; i++) {
      mockContacts.push({
        id: i.toString(),
        name: `Mock Contact ${i}`,
        email: `mock${i}@example.com`,
        phone: "123-456-7890",
        role: "Mock Role",
        category: "Mock Category",
        status: "active",
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        birthday: "",
        birthdayDisplay: "",
        age: 0,
        address: "",
        hasKids: false,
        numberOfKids: 0,
        maritalStatus: "",
        additionalDetails: "",
        contactType: "",
        contactDate: "",
        notifyBirthday: false,
        communications: "",
      })
    }
    return mockContacts
  }

  // If we should use mock data, return mock data immediately
  if (shouldUseMockData || !contactsTable) {
    console.log("Using mock data for updateContact")
    const mockData = generateMockContacts(5)
    const contactIndex = mockData.findIndex((contact) => contact.id === id)
    if (contactIndex === -1) return null

    mockData[contactIndex] = { ...mockData[contactIndex], ...data, id: id, updatedAt: new Date().toISOString() }
    return mockData[contactIndex]
  }

  try {
    console.log(`Updating contact with ID ${id} in Airtable`)
    console.log("Update data:", JSON.stringify(data, null, 2))

    // Verify that the ID exists before attempting to update
    try {
      console.log(`Verifying contact with ID ${id} exists in Airtable`)
      await contactsTable.find(id)
      console.log(`Contact with ID ${id} exists in Airtable`)
    } catch (findError) {
      console.error(`Contact with ID ${id} not found in Airtable:`, findError)
      return null
    }

    // Transform the data to match Airtable field names
    const fields: Record<string, any> = {}

    // Basic fields
    if (data.name !== undefined) fields.name = data.name
    if (data.role !== undefined) fields.role = data.role
    if (data.email !== undefined) fields.email = data.email
    if (data.phone !== undefined) fields.phone = data.phone
    if (data.status !== undefined) fields.status = data.status
    if (data.category !== undefined) fields.category = data.category
    if (data.communications !== undefined) fields.Communications = data.communications
    if (data.description !== undefined) fields.description = data.description

    // Date fields - handle with care
    if (data.birthday !== undefined) {
      if (data.birthday && data.birthday.trim() !== "") {
        try {
          // Validate date format
          const date = new Date(data.birthday)
          if (!isNaN(date.getTime())) {
            fields.birthday = data.birthday
          } else {
            console.warn(`Invalid birthday format: ${data.birthday}, skipping field`)
          }
        } catch (e) {
          console.warn(`Error parsing birthday: ${e}, skipping field`)
        }
      } else {
        // If birthday is empty string or null, clear the field
        fields.birthday = null
      }
    }

    if (data.contactDate !== undefined) {
      if (data.contactDate && data.contactDate.trim() !== "") {
        try {
          // Validate date format
          const date = new Date(data.contactDate)
          if (!isNaN(date.getTime())) {
            fields["contact date"] = data.contactDate
          } else {
            console.warn(`Invalid contact date format: ${data.contactDate}, skipping field`)
          }
        } catch (e) {
          console.warn(`Error parsing contact date: ${e}, skipping field`)
        }
      } else {
        // If contact date is empty string or null, clear the field
        fields["contact date"] = null
      }
    }

    // Other fields
    if (data.birthdayDisplay !== undefined) fields["birthday display"] = data.birthdayDisplay
    if (typeof data.age === "number") fields.age = data.age
    if (data.address !== undefined) fields.address = data.address
    if (typeof data.hasKids === "boolean") fields["has kids"] = data.hasKids
    if (typeof data.numberOfKids === "number") fields["number of kids"] = data.numberOfKids
    if (data.maritalStatus !== undefined) fields["marital status"] = data.maritalStatus
    if (data.additionalDetails !== undefined) fields["additional details"] = data.additionalDetails
    if (data.contactType !== undefined) fields["contact type"] = data.contactType

    // System fields
    fields["updated at"] = new Date().toISOString()

    if (typeof data.notifyBirthday === "boolean") fields["notify birthday"] = data.notifyBirthday

    console.log("Airtable fields to update:", JSON.stringify(fields, null, 2))

    const record = await contactsTable.update(id, fields)
    console.log(`Successfully updated contact with ID ${id} in Airtable`)
    return formatContact(record)
  } catch (error) {
    console.error(`Error updating contact with ID ${id} in Airtable:`, error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)

      // Check for specific Airtable error messages
      if (error.message.includes("NOT_FOUND")) {
        console.error(`Contact with ID ${id} not found in Airtable`)
      } else if (error.message.includes("INVALID_FIELD_NAME")) {
        console.error("One or more field names are invalid in Airtable")
      }
    }
    return null
  }
}

// Function to delete a contact
export async function deleteContact(id: string): Promise<boolean> {
  const base = getAirtableBase()
  const shouldUseMockData = !base
  const contactsTable = base ? base(tableName) : null

  const generateMockContacts = (count: number): Contact[] => {
    const mockContacts: Contact[] = []
    for (let i = 1; i <= count; i++) {
      mockContacts.push({
        id: i.toString(),
        name: `Mock Contact ${i}`,
        email: `mock${i}@example.com`,
        phone: "123-456-7890",
        role: "Mock Role",
        category: "Mock Category",
        status: "active",
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        birthday: "",
        birthdayDisplay: "",
        age: 0,
        address: "",
        hasKids: false,
        numberOfKids: 0,
        maritalStatus: "",
        additionalDetails: "",
        contactType: "",
        contactDate: "",
        notifyBirthday: false,
        communications: "",
      })
    }
    return mockContacts
  }

  // If we should use mock data, return mock data immediately
  if (shouldUseMockData || !contactsTable) {
    console.log("Using mock data for deleteContact")
    const mockData = generateMockContacts(5)
    const contactIndex = mockData.findIndex((contact) => contact.id === id)
    if (contactIndex === -1) return false

    mockData.splice(contactIndex, 1)
    return true
  }

  try {
    console.log(`Deleting contact with ID ${id} from Airtable`)
    await contactsTable.destroy(id)
    console.log(`Successfully deleted contact with ID ${id} from Airtable`)
    return true
  } catch (error) {
    console.error(`Error deleting contact with ID ${id} from Airtable:`, error)
    return false
  }
}

// Function to update the last contacted date
export async function updateLastContactedDate(id: string, communicationType = ""): Promise<Contact | null> {
  const base = getAirtableBase()
  const shouldUseMockData = !base
  const contactsTable = base ? base(tableName) : null

  const generateMockContacts = (count: number): Contact[] => {
    const mockContacts: Contact[] = []
    for (let i = 1; i <= count; i++) {
      mockContacts.push({
        id: i.toString(),
        name: `Mock Contact ${i}`,
        email: `mock${i}@example.com`,
        phone: "123-456-7890",
        role: "Mock Role",
        category: "Mock Category",
        status: "active",
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        birthday: "",
        birthdayDisplay: "",
        age: 0,
        address: "",
        hasKids: false,
        numberOfKids: 0,
        maritalStatus: "",
        additionalDetails: "",
        contactType: "",
        contactDate: "",
        notifyBirthday: false,
        communications: "",
      })
    }
    return mockContacts
  }

  // If we should use mock data, return mock data immediately
  if (shouldUseMockData || !contactsTable) {
    console.log("Using mock data for updateLastContactedDate")
    const mockData = generateMockContacts(5)
    const contactIndex = mockData.findIndex((contact) => contact.id === id)
    if (contactIndex === -1) return null

    mockData[contactIndex] = {
      ...mockData[contactIndex],
      lastContactedAt: new Date().toISOString(),
      id: id,
      updatedAt: new Date().toISOString(),
    }
    return mockData[contactIndex]
  }

  try {
    console.log(`Updating last contacted date for contact with ID ${id} in Airtable`)

    // Get the current date in ISO format
    const currentDate = new Date().toISOString()

    // Create the fields object with the correct field name
    const fields: Record<string, any> = {
      "last contacted at": currentDate, // Updated field name
      "updated at": currentDate,
    }

    // Add communication type if provided and not "Other"
    if (communicationType && communicationType.trim() !== "" && communicationType !== "Other") {
      fields["contact type"] = communicationType
    }

    // Log the fields being updated
    console.log("Updating fields:", fields)

    // Update the record
    const record = await contactsTable.update(id, fields)
    console.log(`Successfully updated last contacted date for contact with ID ${id} in Airtable`)
    return formatContact(record)
  } catch (error) {
    console.error(`Error updating last contacted date for contact with ID ${id} from Airtable:`, error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }

    // Return null to indicate failure
    return null
  }
}

// Function to create a contact
export async function createContact(data: Partial<Contact>): Promise<Contact | null> {
  const base = getAirtableBase()
  const shouldUseMockData = !base
  const contactsTable = base ? base(tableName) : null

  const generateMockContacts = (count: number): Contact[] => {
    const mockContacts: Contact[] = []
    for (let i = 1; i <= count; i++) {
      mockContacts.push({
        id: i.toString(),
        name: `Mock Contact ${i}`,
        email: `mock${i}@example.com`,
        phone: "123-456-7890",
        role: "Mock Role",
        category: "Mock Category",
        status: "active",
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        birthday: "",
        birthdayDisplay: "",
        age: 0,
        address: "",
        hasKids: false,
        numberOfKids: 0,
        maritalStatus: "",
        additionalDetails: "",
        contactType: "",
        contactDate: "",
        notifyBirthday: false,
        communications: "",
      })
    }
    return mockContacts
  }

  // If we should use mock data, return mock data immediately
  if (shouldUseMockData || !contactsTable) {
    console.log("Using mock data for createContact")
    const mockData = generateMockContacts(5)
    const newId = (mockData.length + 1).toString()

    const newContact: Contact = {
      id: newId,
      name: data.name || `Mock Contact ${newId}`,
      email: data.email || `mock${newId}@example.com`,
      phone: data.phone || "123-456-7890",
      role: data.role || "Mock Role",
      category: data.category || "Mock Category",
      status: data.status || "active",
      lastContactedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: data.description || "",
      birthday: data.birthday || "",
      birthdayDisplay: data.birthdayDisplay || "",
      age: data.age || 0,
      address: data.address || "",
      hasKids: data.hasKids || false,
      numberOfKids: data.numberOfKids || 0,
      maritalStatus: data.maritalStatus || "",
      additionalDetails: data.additionalDetails || "",
      contactType: data.contactType || "",
      contactDate: data.contactDate || "",
      notifyBirthday: data.notifyBirthday || false,
      communications: data.communications || "",
    }

    mockData.push(newContact)
    return newContact
  }

  try {
    console.log("Creating contact in Airtable")

    // Transform the data to match Airtable field names
    const fields: any = {}

    // Basic fields
    if (data.name) fields.name = data.name
    if (data.role) fields.role = data.role
    if (data.email) fields.email = data.email
    if (data.phone) fields.phone = data.phone
    if (data.status) fields.status = data.status
    if (data.category) fields.category = data.category
    if (data.communications) fields.Communications = data.communications
    if (data.description) fields.description = data.description

    // Add created_at timestamp
    fields["created at"] = new Date().toISOString()

    // Boolean and numeric fields
    if (typeof data.hasKids === "boolean") fields["has kids"] = data.hasKids
    if (typeof data.numberOfKids === "number") fields["number of kids"] = data.numberOfKids

    // Date fields - handle with care
    if (data.birthday && data.birthday.trim() !== "") {
      try {
        // Validate date format
        const date = new Date(data.birthday)
        if (!isNaN(date.getTime())) {
          fields.birthday = data.birthday
        } else {
          console.warn(`Invalid birthday format: ${data.birthday}, skipping field`)
        }
      } catch (e) {
        console.warn(`Error parsing birthday: ${e}, skipping field`)
      }
    }

    if (data.contactDate && data.contactDate.trim() !== "") {
      try {
        // Validate date format
        const date = new Date(data.contactDate)
        if (!isNaN(date.getTime())) {
          fields["contact date"] = data.contactDate
        } else {
          console.warn(`Invalid contact date format: ${data.contactDate}, skipping field`)
        }
      } catch (e) {
        console.warn(`Error parsing contact date: ${e}, skipping field`)
      }
    }

    // Other fields
    if (data.birthdayDisplay) fields["birthday display"] = data.birthdayDisplay // Updated field name
    if (typeof data.age === "number") fields.age = data.age
    if (data.address) fields.address = data.address
    if (typeof data.hasKids === "boolean") fields["has kids"] = data.hasKids
    if (typeof data.numberOfKids === "number") fields["number of kids"] = data.numberOfKids
    if (data.maritalStatus) fields["marital status"] = data.maritalStatus
    if (data.additionalDetails) fields["additional details"] = data.additionalDetails
    if (data.contactType) fields["contact type"] = data.contactType

    if (typeof data.notifyBirthday === "boolean") fields["notify birthday"] = data.notifyBirthday

    try {
      const record = await contactsTable.create(fields)
      console.log("Successfully created contact in Airtable")
      return formatContact(record)
    } catch (error) {
      console.error("Error creating contact in Airtable:", error)

      // Log detailed error information
      if (error instanceof Error) {
        console.error("Error details:", error.message)
        console.error("Error stack:", error.stack)
      }

      // If we're in development or testing, return a mock contact
      if (process.env.NODE_ENV !== "production") {
        console.log("Returning mock contact as fallback")
        return {
          id: `mock-${Date.now()}`,
          name: data.name || "Mock Contact",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
          category: data.category || "Client",
          status: data.status || "active",
          lastContactedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: data.description || "",
          birthday: data.birthday || "",
          birthdayDisplay: data.birthdayDisplay || "",
          age: data.age || 0,
          address: data.address || "",
          hasKids: data.hasKids || false,
          numberOfKids: data.numberOfKids || 0,
          maritalStatus: data.maritalStatus || "",
          additionalDetails: data.additionalDetails || "",
          contactType: data.contactType || "",
          contactDate: data.contactDate || "",
          notifyBirthday: data.notifyBirthday || false,
          communications: data.communications || "",
        }
      }

      return null
    }
  } catch (error) {
    console.error("Error creating contact in Airtable:", error)
    return null
  }
}

export type { Contact }

