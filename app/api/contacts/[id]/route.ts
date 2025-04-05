import { type NextRequest, NextResponse } from "next/server"
import { getContactById, updateContact, deleteContact, updateLastContactedDate } from "@/lib/airtable"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`API: GET /api/contacts/${params.id} - Fetching contact`)
    const contact = await getContactById(params.id)

    if (!contact) {
      console.log(`API: GET /api/contacts/${params.id} - Contact not found`)
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    console.log(`API: GET /api/contacts/${params.id} - Successfully fetched contact`)
    return NextResponse.json(contact)
  } catch (error) {
    console.error(`API: GET /api/contacts/${params.id} - Error:`, error)
    return NextResponse.json(
      { error: "Failed to fetch contact", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`API: PUT /api/contacts/${params.id} - Updating contact`)
    const data = await request.json()
    console.log(`API: PUT /api/contacts/${params.id} - Request data:`, JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.name) {
      console.error(`API: PUT /api/contacts/${params.id} - Missing required field: name`)
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Log the ID we're trying to update
    console.log(`API: PUT /api/contacts/${params.id} - Attempting to update contact with ID: ${params.id}`)

    const updatedContact = await updateContact(params.id, data)

    if (!updatedContact) {
      console.error(`API: PUT /api/contacts/${params.id} - Failed to update contact (null returned)`)
      return NextResponse.json(
        {
          error: "Failed to update contact",
          details: "The update operation returned null. This could be due to an invalid ID or Airtable API issues.",
        },
        { status: 500 },
      )
    }

    console.log(`API: PUT /api/contacts/${params.id} - Successfully updated contact`)
    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error(`API: PUT /api/contacts/${params.id} - Error:`, error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: "Failed to update contact",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        id: params.id,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`API: DELETE /api/contacts/${params.id} - Deleting contact`)
    const success = await deleteContact(params.id)

    if (!success) {
      console.error(`API: DELETE /api/contacts/${params.id} - Failed to delete contact`)
      return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
    }

    console.log(`API: DELETE /api/contacts/${params.id} - Successfully deleted contact`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`API: DELETE /api/contacts/${params.id} - Error:`, error)
    return NextResponse.json(
      { error: "Failed to delete contact", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`API: PATCH /api/contacts/${params.id} - Processing request`)
    const { action, communicationType } = await request.json()
    console.log(`API: PATCH /api/contacts/${params.id} - Action: ${action}, Communication Type: ${communicationType}`)

    if (action === "updateLastContacted") {
      console.log(`API: PATCH /api/contacts/${params.id} - Updating last contacted date`)
      const updatedContact = await updateLastContactedDate(params.id, communicationType)

      if (!updatedContact) {
        console.error(`API: PATCH /api/contacts/${params.id} - Failed to update last contacted date (null returned)`)
        return NextResponse.json({ error: "Failed to update last contacted date" }, { status: 500 })
      }

      console.log(`API: PATCH /api/contacts/${params.id} - Successfully updated last contacted date`)
      return NextResponse.json(updatedContact)
    }

    console.log(`API: PATCH /api/contacts/${params.id} - Invalid action: ${action}`)
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error(`API: PATCH /api/contacts/${params.id} - Error:`, error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

