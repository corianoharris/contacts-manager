import { NextResponse } from "next/server"
import Airtable from "airtable"

export async function GET() {
  try {
    // Get API key from environment variables
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME

    // Check if environment variables are set
    const envStatus = {
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      baseIdExists: !!baseId,
      baseIdValue: baseId ? `${baseId.substring(0, 3)}...` : "Not set",
      tableNameExists: !!tableName,
      tableNameValue: tableName || "Not set",
      nodeEnv: process.env.NODE_ENV,
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Airtable API key is not set",
          envStatus,
          success: false,
        },
        { status: 500 },
      )
    }

    if (!baseId) {
      return NextResponse.json(
        {
          error: "Airtable Base ID is not set",
          envStatus,
          success: false,
        },
        { status: 500 },
      )
    }

    if (!tableName) {
      return NextResponse.json(
        {
          error: "Airtable Contacts Table Name is not set",
          envStatus,
          success: false,
        },
        { status: 500 },
      )
    }

    // Initialize Airtable
    try {
      console.log("Initializing Airtable with API key")
      const airtable = new Airtable({ apiKey })

      // Get the base
      console.log(`Accessing base with ID: ${baseId}`)
      const base = airtable.base(baseId)

      // Try to access the table
      console.log(`Accessing table: ${tableName}`)
      const table = base(tableName)

      // Try to list tables in the base to verify connection
      try {
        // Just fetch a single record to test connection
        console.log("Fetching a record to test connection")
        const records = await table.select({ maxRecords: 1 }).firstPage()

        return NextResponse.json({
          success: true,
          message: "Successfully connected to Airtable",
          recordCount: records.length,
          tableExists: true,
          envStatus,
        })
      } catch (tableError) {
        console.error("Error accessing table:", tableError)
        return NextResponse.json(
          {
            error: "Failed to access table",
            details: tableError instanceof Error ? tableError.message : String(tableError),
            tableExists: false,
            envStatus,
            success: false,
          },
          { status: 500 },
        )
      }
    } catch (airtableError) {
      console.error("Error initializing Airtable:", airtableError)
      return NextResponse.json(
        {
          error: "Failed to initialize Airtable",
          details: airtableError instanceof Error ? airtableError.message : String(airtableError),
          envStatus,
          success: false,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in test-airtable route:", error)
    return NextResponse.json(
      {
        error: "Failed to test Airtable connection",
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 },
    )
  }
}

