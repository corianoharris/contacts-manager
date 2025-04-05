import { type NextRequest, NextResponse } from "next/server"
import { updateLastContactedDate } from "@/lib/airtable"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()
    const type = body.type || "" // Default to empty string instead of "Other"

    console.log(`Updating last contacted date for contact ${id} with type ${type}`)

    // Call the updateLastContactedDate function
    const updatedContact = await updateLastContactedDate(id, type)

    if (!updatedContact) {
      console.error(`Failed to update last contacted date for contact ${id}`)
      return NextResponse.json(
        { error: "Failed to update last contacted date", details: "Contact not found or update failed" },
        { status: 500 },
      )
    }

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error("Error updating last contacted date:", error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : ""

    // Check for field name errors specifically
    const statusCode = errorMessage.includes("Unknown field name") ? 422 : 500
    const errorResponse = {
      error: "Failed to update last contacted date",
      details: errorMessage,
      suggestion: errorMessage.includes("Unknown field name")
        ? "The field name in the code doesn't match the field name in Airtable. Please check your Airtable schema."
        : undefined,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
    }

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

