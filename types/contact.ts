export enum ContactStatus {
  Active = "Active",
  Inactive = "Inactive",
  Pending = "Pending",
  Blocked = "Blocked",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

export enum ContactCategory {
  KitchenTable = "Kitchen Table",
  InsideHouse = "Inside House",
  OutsideHouse = "Outside House",
  Recruiter = "Recruiter",
  Client = "Client",
  Employer = "Employer",
  Bills = "Bills",
  Health = "Health",
  Woman = "Woman",
}

export enum CommunicationType {
  Call = "Call",
  Video = "Video",
  InPerson = "In Person",
  Email = "Email",
}

export type MaritalStatus = "Single" | "Divorced" | "Separated" | "Widow" 

export interface CommunicationEntry {
  id: string
  types: CommunicationType[]
  notes: string
  timestamp: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface Contact {
  communications: CommunicationEntry[]
  lastContactedAt: string | null // Updated to match context definition
  id: string
  name: string
  role: string
  status: ContactStatus
  category: ContactCategory
  description: string
  picture?: string
  birthday?: string
  age?: string
  address: Address
  hasKids: boolean
  numberOfKids?: number
  maritalStatus?: MaritalStatus
  additionalDetails?: string
  communicationHistory?: CommunicationEntry[]
  createdAt: string
  updatedAt: string
  phoneNumber?: string
  email?: string
  contactType?: ContactType
  contactDate?: string // ISO string for date and time
}

// Add ContactType enum
export enum ContactType {
  Phone = "Phone",
  Email = "Email",
  InPerson = "In-Person",
  INDIVIDUAL = "Individual",
  COMPANY = "Company",
}

