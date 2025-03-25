/**
 * Formats a phone number string into (000) 000-0000 format
 * @param phoneNumber - The phone number to format (can be any string)
 * @returns Formatted phone number or empty string if invalid
 */
export function formatPhoneNumber(phoneNumber: string | undefined): string {
  if (!phoneNumber) return ""

  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "")

  // Check if we have enough digits for a US phone number
  if (digitsOnly.length < 10) {
    return digitsOnly // Return what we have if it's not enough for formatting
  }

  // Format as (000) 000-0000
  const areaCode = digitsOnly.slice(0, 3)
  const prefix = digitsOnly.slice(3, 6)
  const lineNumber = digitsOnly.slice(6, 10)

  return `(${areaCode}) ${prefix}-${lineNumber}`
}

