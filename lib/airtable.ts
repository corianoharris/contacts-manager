import Airtable, { type Records, type FieldSet, type Record } from "airtable";
import {
  type Contact,
  type CommunicationEntry,
  ContactStatus,
  ContactCategory,
  ContactType,
  type MaritalStatus,
} from "@/types/contact";

// Initialize Airtable with Personal Access Token
const token =
  process.env.AIRTABLE_PAT ||
  process.env.NEXT_PUBLIC_AIRTABLE_PAT ||
  process.env.AIRTABLE_API_KEY ||
  process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;

if (!token) {
  throw new Error(
    "No Airtable authentication token found in environment variables! Please set either AIRTABLE_PAT, NEXT_PUBLIC_AIRTABLE_PAT, AIRTABLE_API_KEY, or NEXT_PUBLIC_AIRTABLE_API_KEY"
  );
}

const airtable = new Airtable({ apiKey: token });

const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || "";
if (!baseId) {
  throw new Error("AIRTABLE_BASE_ID or NEXT_PUBLIC_AIRTABLE_BASE_ID environment variable is not set!");
}

const base = airtable.base(baseId);

// Table names
const CONTACTS_TABLE = "Contacts";
const COMMUNICATIONS_TABLE = "Communications";

// Define a type for Airtable fields based on your schema, with an index signature
interface AirtableContactFields {
  [key: string]: string | number | boolean | undefined;
  name?: string;
  role?: string;
  status?: ContactStatus;
  category?: ContactCategory;
  description?: string;
  birthday?: string;
  age?: string;
  address?: string;
  "has kids"?: boolean;
  "number of kids"?: number;
  "marital status"?: MaritalStatus;
  "additional details"?: string;
  "last contacted at"?: string;
  phone?: string;
  email?: string;
  "contact type"?: ContactType;
  "contact date"?: string;
}


// Helper functions to convert string values to enums
function toContactStatus(status: any): ContactStatus {
  if (!status) return ContactStatus.Active;
  const statusStr = String(status).toUpperCase();
  if (statusStr === "ACTIVE") return ContactStatus.ACTIVE;
  if (statusStr === "INACTIVE") return ContactStatus.INACTIVE;
  if (statusStr === "PENDING") return ContactStatus.PENDING;
  if (statusStr === "BLOCKED") return ContactStatus.Blocked;
  return ContactStatus.Active;
}

function toContactCategory(category: any): ContactCategory {
  if (!category) return ContactCategory.Client;
  const categoryStr = String(category);
  for (const enumValue of Object.values(ContactCategory)) {
    if (categoryStr === enumValue) return enumValue;
  }
  return ContactCategory.Client;
}

function toContactType(type: any): ContactType | undefined {
  if (!type) return undefined;
  const typeStr = String(type);
  for (const enumValue of Object.values(ContactType)) {
    if (typeStr === enumValue) return enumValue;
  }
  return undefined;
}

function toMaritalStatus(status: any): MaritalStatus | undefined {
  if (!status) return undefined;
  const statusStr = String(status);
  if (statusStr === "Single" || statusStr === "Divorced" || statusStr === "Separated" || statusStr === "Widow") {
    return statusStr as MaritalStatus;
  }
  return undefined;
}

// Convert Airtable record to Contact
export function airtableToContact(record: Record<FieldSet>): Contact {
  console.log("Processing record:", record.id, JSON.stringify(record.fields, null, 2));
  return {
    id: record.id,
    name: String(record.fields.name || ""),
    role: String(record.fields.role || ""),
    status: toContactStatus(record.fields.status),
    category: toContactCategory(record.fields.category),
    description: String(record.fields.description || ""),
    picture: undefined, // Not in Airtable schema
    birthday: record.fields.birthday ? String(record.fields.Birthday) : undefined,
    age: record.fields.age ? String(record.fields.age) : undefined,
    address: {
      street: String(record.fields.address || ""),
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    hasKids: Boolean(record.fields["has kids"] || false),
    numberOfKids: Number(record.fields["number of kids"] || 0),
    maritalStatus: toMaritalStatus(record.fields["marital status"]),
    additionalDetails: String(record.fields["additional details"] || ""),
    communications: [], // Will be populated separately
    lastContactedAt: record.fields["last contacted at"] ? String(record.fields["last contacted at"]) : null,
    createdAt: String(record.fields["created at"] || new Date().toISOString()),
    updatedAt: String(record.fields["updated at"] || new Date().toISOString()),
    phoneNumber: String(record.fields.phone || ""),
    email: String(record.fields.email || ""),
    contactType: toContactType(record.fields["contact type"]),
    contactDate: record.fields["contact date"] ? String(record.fields["contact date"]) : undefined,
  };
}

// Convert Airtable record to CommunicationEntry
export function airtableToCommunication(record: Record<FieldSet>): CommunicationEntry {
  console.log("Processing communication record:", record.id, JSON.stringify(record.fields, null, 2));
  const typeValue = record.fields.type || [];
  const notesValue = record.fields.notes || "";
  const dateValue = record.fields.date || new Date().toISOString();
  return {
  id: record.id,
  types: Array.isArray(typeValue) ? typeValue : [typeValue],
  notes: String(notesValue),
  timestamp: String(dateValue),
  date: "",
  type: function (type: any): unknown
  {
    throw new Error("Function not implemented.");
  },
  };
};

// Fetch all contacts (real data)
export async function fetchContacts(): Promise<Contact[]> {
  try {
    console.log("Fetching contacts from Airtable...");
    const table = base(CONTACTS_TABLE);
    const records = await table.select({ maxRecords: 1 }).firstPage();
    if (records.length > 0) {
      console.log("Sample record fields:", Object.keys(records[0].fields));
    } else {
      console.log("No records found in Contacts table.");
      return [];
    }

    const allRecords = await table.select().all();
    console.log(`Retrieved ${allRecords.length} contact records from Airtable`);

    if (allRecords.length > 0) {
      console.log("First record:", JSON.stringify(allRecords[0].fields, null, 2));
      if (allRecords.length > 1) {
        console.log("Second record:", JSON.stringify(allRecords[1].fields, null, 2));
      }
    }

    return allRecords.map((record) => airtableToContact(record));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

// Fetch all communications (real data)
export async function fetchAllCommunications(): Promise<CommunicationEntry[]> {
  try {
    console.log("Fetching communications from Airtable...");
    const table = base(COMMUNICATIONS_TABLE);
    const records = await table.select().all();
    console.log(`Retrieved ${records.length} communication records from Airtable`);

    if (records.length > 0) {
      console.log("First communication record:", JSON.stringify(records[0].fields, null, 2));
      if (records.length > 1) {
        console.log("Second communication record:", JSON.stringify(records[1].fields, null, 2));
      }
    }

    return records.map((record) => airtableToCommunication(record));
  } catch (error) {
    console.error("Error fetching communications:", error);
    return [];
  }
}

// Fetch a single contact by ID and its communications
export async function fetchContact(id: string): Promise<Contact | null> {
  try {
    const record = await base(CONTACTS_TABLE).find(id);
    if (!record || !record.fields) {
      console.error(`No record found with ID ${id} or record has no fields`);
      return null;
    }
    const contact = airtableToContact(record);
    contact.communications = await fetchCommunications(id);
    return contact;
  } catch (error) {
    console.error(`Error fetching contact ${id}:`, error);
    return null;
  }
}

// Fetch communications for a specific contact
export async function fetchCommunications(contactId: string): Promise<CommunicationEntry[]> {
  try {
    console.log(`Fetching communications for contact ${contactId}`);
    const records = await base(COMMUNICATIONS_TABLE)
      .select({
        filterByFormula: `{Contact} = '${contactId}'`,
      })
      .all();

    console.log(`Found ${records.length} communications for contact ${contactId}`);
    if (records.length > 0) {
      console.log("First communication for contact:", JSON.stringify(records[0].fields, null, 2));
    }

    return records.map((record) => airtableToCommunication(record));
  } catch (error) {
    console.error(`Error fetching communications for contact ${contactId}:`, error);
    return [];
  }
}

// Create a new contact
export async function createContact(
  contact: Omit<Contact, "id" | "communications" | "createdAt" | "updatedAt">
): Promise<Contact> {
  try {
    console.log("Creating contact in Airtable:", contact);
    const fields: AirtableContactFields = {
      name: contact.name,
      role: contact.role,
      status: contact.status,
      category: contact.category,
      description: contact.description,
      birthday: contact.birthday,
      age: contact.age ? String(contact.age) : undefined,
      address: JSON.stringify(contact.address) || contact.address.street,
      "has kids": contact.hasKids,
      "number of kids": contact.numberOfKids,
      "marital status": contact.maritalStatus,
      "additional details": contact.additionalDetails,
      "last contacted at": contact.contactDate || contact.lastContactedAt || undefined, // Use contactDate if available
      phone: contact.phoneNumber,
      email: contact.email,
      "contact type": contact.contactType,
      "contact date": contact.contactDate,
    };

    Object.keys(fields).forEach(
      (key) => fields[key as keyof AirtableContactFields] === undefined && delete fields[key as keyof AirtableContactFields]
    );

    const createdRecords: Records<FieldSet> = await base(CONTACTS_TABLE).create([{ fields }]);
    const record = createdRecords[0];
    return airtableToContact(record);
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

// Update an existing contact
export async function updateContact(id: string, contactData: Partial<Contact>): Promise<Contact | null> {
  try {
    console.log(`Updating contact ${id} in Airtable:`, contactData);
    const fields: AirtableContactFields = {
      name: contactData.name,
      role: contactData.role,
      status: contactData.status,
      category: contactData.category,
      description: contactData.description,
      birthday: contactData.birthday,
      age: contactData.age ? String(contactData.age) : undefined,
      address: JSON.stringify(contactData.address) || contactData.address?.street,
      "has kids": contactData.hasKids,
      "number of kids": contactData.numberOfKids,
      "marital status": contactData.maritalStatus,
      "additional details": contactData.additionalDetails,
      "last contacted at": contactData.contactDate || contactData.lastContactedAt || undefined, // Use contactDate if available
      phone: contactData.phoneNumber,
      email: contactData.email,
      "contact type": contactData.contactType,
      "contact date": contactData.contactDate,
    };

    Object.keys(fields).forEach(
      (key) => fields[key as keyof AirtableContactFields] === undefined && delete fields[key as keyof AirtableContactFields]
    );

    const updatedRecords: Records<FieldSet> = await base(CONTACTS_TABLE).update([{ id, fields }]);
    const updatedRecord = updatedRecords[0];
    return updatedRecord ? airtableToContact(updatedRecord) : null;
  } catch (error) {
    console.error(`Error updating contact ${id}:`, error);
    throw error;
  }
}

// Delete a contact
export async function deleteContact(id: string): Promise<boolean> {
  try {
    console.log(`Deleting contact ${id} from Airtable`);
    
    // Verify the contact exists
    const record = await base(CONTACTS_TABLE).find(id).catch(() => null);
    if (!record) {
      console.log(`Contact ${id} not found in Airtable`);
      return false; // Return false if not found instead of throwing
    }

    // Delete associated communications (optional, adjust based on your needs)
    const communications = await base(COMMUNICATIONS_TABLE)
      .select({
        filterByFormula: `{Contact} = '${id}'`,
      })
      .all();

    if (communications.length > 0) {
      const communicationIds = communications.map((rec) => rec.id);
      await base(COMMUNICATIONS_TABLE).destroy(communicationIds);
      console.log(`Deleted ${communicationIds.length} communications for contact ${id}`);
    }

    // Delete the contact
    await base(CONTACTS_TABLE).destroy([id]);
    console.log(`Successfully deleted contact ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting contact ${id}:`, error);
    throw error;
  }
}

// Example function to fetch and log all data
export async function fetchAndLogAllData() {
  console.log("=== Fetching All Data ===");
  
  // Fetch and log all contacts
  console.log("\nFetching Contacts...");
  const contacts = await fetchContacts();
  console.log("Contacts Data:", JSON.stringify(contacts, null, 2));

  // Fetch and log all communications
  console.log("\nFetching Communications...");
  const communications = await fetchAllCommunications();
  console.log("Communications Data:", JSON.stringify(communications, null, 2));

  // Optionally, fetch communications for a specific contact
  if (contacts.length > 0) {
    const firstContactId = contacts[0].id;
    console.log(`\nFetching communications for contact ${firstContactId}...`);
    const contactCommunications = await fetchCommunications(firstContactId);
    console.log(`Communications for contact ${firstContactId}:`, JSON.stringify(contactCommunications, null, 2));
  }
}