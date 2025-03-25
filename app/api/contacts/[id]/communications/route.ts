import { NextResponse } from "next/server"
import { fetchCommunications, createCommunication } from "@/lib/airtable"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const communications = await fetchCommunications(params.id)
    return NextResponse.json(communications)
  } catch (error) {
    console.error(`Error in GET /api/contacts/${params.id}/communications:`, error)
    return NextResponse.json({ error: "Failed to fetch communications" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const communicationData = await request.json()
    const newCommunication = await createCommunication(params.id, communicationData)

    if (!newCommunication) {
      return NextResponse.json({ error: "Failed to create communication" }, { status: 400 })
    }

    return NextResponse.json(newCommunication, { status: 201 })
  } catch (error) {
    console.error(`Error in POST /api/contacts/${params.id}/communications:`, error)
    return NextResponse.json({ error: "Failed to create communication" }, { status: 500 })
  }
}

