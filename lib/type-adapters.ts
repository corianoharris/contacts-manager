import type { Contact as ContextContact, Communication, Address as ContextAddress } from "@/context/contact-context"
import type {
  Contact as TypesContact,
  CommunicationEntry,
  CommunicationType,
  ContactStatus,
  ContactCategory,
  ContactType,
  MaritalStatus,
  Address as TypesAddress,
} from "@/types/contact"

/**
 * Converts an Address from the context format to the types format
 */
function contextToTypesAddress(address: ContextAddress | undefined): TypesAddress {
  if (!address) {
    return {
      street: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
      country: undefined,
    }
  }

  return {
    street: address.street || undefined,
    city: address.city || undefined,
    state: address.state || undefined,
    zipCode: address.zipCode || undefined,
    country: address.country || undefined,
  }
}

/**
 * Converts an Address from the types format to the context format
 */
function typesToContextAddress(address: TypesAddress | undefined): ContextAddress {
  if (!address) {
    return {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    }
  }

  return {
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    zipCode: address.zipCode || "",
    country: address.country || "",
  }
}

/**
 * Converts age from context format (number) to types format (string)
 */
function contextToTypesAge(age: number | string | undefined): string | undefined {
  if (age === undefined || age === null) {
    return undefined
  }

  return String(age)
}

/**
 * Converts age from types format (string) to context format (number)
 */
function typesToContextAge(age: string | undefined): number | undefined {
  if (age === undefined || age === null || age === "") {
    return undefined
  }

  const parsedAge = Number(age)
  return isNaN(parsedAge) ? undefined : parsedAge
}

/**
 * Converts a Contact from the context format to the types format
 */
export function contextToTypesContact(contact: ContextContact): TypesContact {
  // Create a new object to avoid direct property spreading
  const typesContact: Partial<TypesContact> = {
    id: contact.id,
    name: contact.name,
    role: contact.role,
    status: contact.status as ContactStatus,
    category: contact.category as ContactCategory,
    description: contact.description,
    picture: contact.picture,
    // Convert age using the helper function
    age: contextToTypesAge(contact.age),
    birthday: contact.birthday,
    // Convert address using the helper function
    address: contextToTypesAddress(contact.address),
    hasKids: Boolean(contact.hasKids),
    numberOfKids: contact.numberOfKids,
    maritalStatus: contact.maritalStatus as MaritalStatus,
    additionalDetails: contact.additionalDetails,
    // Convert communications
    communications: contact.communications?.map(contextToTypesCommunication) || [],
    communicationHistory: contact.communications?.map(contextToTypesCommunication) || [],
    // Convert string | null to null | undefined
    lastContactedAt: contact.lastContactedAt ? null : null,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
    contactType: contact.contactType as ContactType,
    contactDate: contact.contactDate,
  }

  return typesContact as TypesContact
}

/**
 * Converts a Contact from the types format to the context format
 */
export function typesToContextContact(contact: TypesContact): ContextContact {
  // Create a new object to avoid direct property spreading
  const contextContact: Partial<ContextContact> = {
    id: contact.id,
    name: contact.name,
    role: contact.role,
    status: contact.status,
    category: contact.category,
    description: contact.description,
    picture: contact.picture,
    // Convert age using the helper function
    age: typesToContextAge(contact.age),
    birthday: contact.birthday,
    // Convert address using the helper function
    address: typesToContextAddress(contact.address),
    hasKids: contact.hasKids,
    numberOfKids: contact.numberOfKids,
    maritalStatus: contact.maritalStatus,
    additionalDetails: contact.additionalDetails,
    // Convert communications
    communications:
      contact.communications?.map(typesToContextCommunication) ||
      contact.communicationHistory?.map(typesToContextCommunication) ||
      [],
    // Convert null | undefined to string | null
    lastContactedAt: contact.lastContactedAt === undefined ? null : contact.lastContactedAt,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
    contactType: contact.contactType,
    contactDate: contact.contactDate,
  }

  return contextContact as ContextContact
}

/**
 * Converts a Communication from the context format to the CommunicationEntry format
 */
function contextToTypesCommunication(comm: Communication): CommunicationEntry {
  return {
  id: comm.id,
  types: Array.isArray(comm.type) ? (comm.type as CommunicationType[]) : [comm.type as CommunicationType],
  notes: comm.notes,
  timestamp: comm.date,
  date: comm.date,
  type: function (type: any): unknown
  {
    throw new Error("Function not implemented.")
  },
}
}

/**
 * Converts a CommunicationEntry from the types format to the Communication format
 */
function typesToContextCommunication(entry: CommunicationEntry): Communication {
  return {
    id: entry.id,
    type: entry.types,
    notes: entry.notes,
    date: entry.timestamp,
  }
}

