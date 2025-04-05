export interface Contact {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  category?: string
  status?: string
  lastContactedAt?: string | null
  description?: string
  birthday?: string
  birthdayDisplay?: string
  age?: number
  address?: string
  hasKids?: boolean
  numberOfKids?: number
  maritalStatus?: string
  additionalDetails?: string
  contactType?: string
  contactDate?: string
  createdAt?: string
  updatedAt?: string
  notifyBirthday?: boolean
  communications?: string
}

