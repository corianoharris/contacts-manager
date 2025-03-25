import { NextResponse } from "next/server"
import { fetchContacts, createContact } from "@/lib/airtable"

export async function GET() {
  try {
    const contacts = await fetchContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error in GET /api/contacts:", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Log the request body for debugging
    const contactData = await request.json()
    console.log("POST /api/contacts received data:", JSON.stringify(contactData, null, 2))

    try {
      const newContact = await createContact(contactData)

      if (!newContact) {
        return NextResponse.json({ error: "Failed to create contact - no contact returned" }, { status: 400 })
      }

      return NextResponse.json(newContact, { status: 201 })
    } catch (error) {
      console.error("Error creating contact in Airtable:", error)
      return NextResponse.json(
        {
          error: (error as Error).message || "Failed to create contact",
          details: error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error parsing request in POST /api/contacts:", error)
    return NextResponse.json(
      {
        error: "Failed to parse request data",
        details: (error as Error).message,
      },
      { status: 400 },
    )
  }
}

