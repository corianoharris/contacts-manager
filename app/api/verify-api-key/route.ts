import { NextResponse } from "next/server"
import Airtable from "airtable"

export async function GET() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT

    if (!apiKey) {
      return NextResponse.json({
        valid: false,
        message: "API key is not set in environment variables",
      })
    }

    // Try to initialize Airtable with the API key
    const airtable = new Airtable({ apiKey })

    // Try to list bases to verify the API key works
    try {
      // We don't actually need to do anything with the result,
      // just check if the request succeeds
      await airtable.request({
        method: "GET",
        path: "/",
      })

      return NextResponse.json({
        valid: true,
        message: "API key is valid",
      })
    } catch (error) {
      return NextResponse.json({
        valid: false,
        message: "API key is invalid or has insufficient permissions",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  } catch (error) {
    return NextResponse.json({
      valid: false,
      message: "Error verifying API key",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

