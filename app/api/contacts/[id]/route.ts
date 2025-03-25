import { NextResponse } from "next/server"
import { fetchContact, updateContact, deleteContact } from "@/lib/airtable"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const contact = await fetchContact(params.id)

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error(`Error in GET /api/contacts/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const contactData = await request.json()
    const updatedContact = await updateContact(params.id, contactData)

    if (!updatedContact) {
      return NextResponse.json({ error: "Failed to update contact" }, { status: 400 })
    }

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error(`Error in PUT /api/contacts/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await deleteContact(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete contact" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error in DELETE /api/contacts/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}

