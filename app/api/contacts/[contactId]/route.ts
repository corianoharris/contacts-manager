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

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const contactData = await request.json()
//     const updatedContact = await updateContact(params.id, contactData)

//     if (!updatedContact) {
//       return NextResponse.json({ error: "Failed to update contact" }, { status: 400 })
//     }

//     return NextResponse.json(updatedContact)
//   } catch (error) {
//     console.error(`Error in PUT /api/contacts/${params.id}:`, error)
//     return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
//   }
// }

// PUT handler for updating a contact
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure ID is valid before proceeding
    if (!params.id || params.id === "undefined") {
      console.error("Contact ID is missing or invalid:", params.id);
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    // Get the contact data from the request body
    const contactData = await request.json();
    console.log("Updating contact with ID:", params.id, "Data:", JSON.stringify(contactData, null, 2));

    // Await the result of the update operation
    const updatedContact = await updateContact(params.id, contactData);

    // If updateContact returns null, return an error response
    if (!updatedContact) {
      console.error("UpdateContact returned null for ID:", params.id);
      return NextResponse.json({ error: "Failed to update contact" }, { status: 400 });
    }

    // If update is successful, return the updated contact
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error(`Error in PUT /api/contacts/${params.id}:`, error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a contact
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Await the result of the delete operation
    const success = await deleteContact(params.id);

    // If deleteContact returns false, return an error response
    if (!success) {
      return NextResponse.json({ error: "Failed to delete contact" }, { status: 400 });
    }

    // If deletion is successful, return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/contacts/${params.id}:`, error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}


