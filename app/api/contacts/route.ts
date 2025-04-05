import { type NextRequest, NextResponse } from "next/server"
import { getAllContacts, createContact } from "@/lib/airtable"

export async function GET() {
  try {
    console.log("API: GET /api/contacts - Fetching all contacts")
    const contacts = await getAllContacts()
    console.log(`API: GET /api/contacts - Successfully fetched ${contacts.length} contacts`)

    // Ensure we're returning an array, even if empty
    return NextResponse.json(Array.isArray(contacts) ? contacts : [])
  } catch (error) {
    console.error("API: GET /api/contacts - Error:", error)
    // Return an empty array in case of error to prevent UI errors
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: POST /api/contacts - Creating new contact")
    const data = await request.json()
    console.log("API: POST /api/contacts - Request data:", data)

    // Validate required fields
    if (!data.name) {
      console.error("API: POST /api/contacts - Missing required field: name")
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newContact = await createContact(data)

    if (!newContact) {
      console.error("API: POST /api/contacts - Failed to create contact (null returned)")
      return NextResponse.json({ error: "Failed to create contact in Airtable" }, { status: 500 })
    }

    console.log("API: POST /api/contacts - Successfully created contact:", newContact.id)
    return NextResponse.json(newContact, { status: 201 })
  } catch (error) {
    console.error("API: POST /api/contacts - Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create contact",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

