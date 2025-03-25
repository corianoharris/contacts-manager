import { NextResponse } from "next/server"
import { fetchContact, updateContact, deleteContact } from "@/lib/airtable"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Attempting to fetch contact with ID: ${params.id}`)
    
    const contact = await fetchContact(params.id)

    if (!contact) {
      console.warn(`Contact not found with ID: ${params.id}`)
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    console.log(`Successfully fetched contact: ${contact.name}`)
    return NextResponse.json(contact)
  } catch (error) {
    console.error(`Detailed error in GET /api/contacts/${params.id}:`, {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json({ 
      error: "Failed to fetch contact", 
      details: (error as Error).message 
    }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const contactData = await request.json()
    
    console.log(`Attempting to update contact with ID: ${params.id}`, contactData)
    
    const updatedContact = await updateContact(params.id, contactData)

    if (!updatedContact) {
      console.warn(`Update failed for contact ID: ${params.id}`)
      return NextResponse.json({ error: "Failed to update contact" }, { status: 400 })
    }

    console.log(`Successfully updated contact: ${updatedContact.name}`)
    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error(`Detailed error in PUT /api/contacts/${params.id}:`, {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json({ 
      error: "Failed to update contact", 
      details: (error as Error).message 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Attempting to delete contact with ID: ${params.id}`)
    
    const success = await deleteContact(params.id)

    if (!success) {
      console.warn(`Delete failed for contact ID: ${params.id}`)
      return NextResponse.json({ error: "Failed to delete contact" }, { status: 400 })
    }

    console.log(`Successfully deleted contact with ID: ${params.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Detailed error in DELETE /api/contacts/${params.id}:`, {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json({ 
      error: "Failed to delete contact", 
      details: (error as Error).message 
    }, { status: 500 })
  }
}