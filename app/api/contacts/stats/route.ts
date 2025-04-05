import { NextResponse } from "next/server"
import { getContactStats } from "@/lib/airtable"

export async function GET() {
  try {
    console.log("Fetching contact stats from API")
    const stats = await getContactStats()
    console.log("Successfully fetched contact stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching contact stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch contact stats",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

