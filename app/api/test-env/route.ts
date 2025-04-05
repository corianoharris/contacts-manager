import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables without exposing the actual values
    const envVars = {
      AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
      AIRTABLE_PAT: !!process.env.AIRTABLE_PAT,
      AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID,
      AIRTABLE_CONTACTS_TABLE_NAME: !!process.env.AIRTABLE_CONTACTS_TABLE_NAME,
      // Include the actual table name for debugging
      tableName: process.env.AIRTABLE_CONTACTS_TABLE_NAME || "Not set",
      baseId: process.env.AIRTABLE_BASE_ID ? process.env.AIRTABLE_BASE_ID.substring(0, 5) + "..." : "Not set",
    }

    return NextResponse.json(envVars)
  } catch (error) {
    console.error("Error checking environment variables:", error)
    return NextResponse.json({ error: "Failed to check environment variables" }, { status: 500 })
  }
}

