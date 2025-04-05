import { NextResponse } from "next/server"
import { getContactStats } from "@/lib/airtable"

export async function GET() {
  try {
    console.log("API: GET /api/stats - Fetching contact statistics")
    const stats = await getContactStats()
    console.log("API: GET /api/stats - Successfully fetched contact statistics:", stats)

    // Ensure we're returning a valid object with all required properties
    return NextResponse.json({
      total: stats.total || 0,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      recentlyContacted: stats.recentlyContacted || 0,
      neverContacted: Array.isArray(stats.neverContacted) ? stats.neverContacted : [],
    })
  } catch (error) {
    console.error("API: GET /api/stats - Error:", error)
    // Return a valid stats object even in case of error
    return NextResponse.json(
      {
        error: "Failed to fetch contact statistics",
        details: error instanceof Error ? error.message : String(error),
        // Default values to prevent UI errors
        total: 0,
        active: 0,
        inactive: 0,
        recentlyContacted: 0,
        neverContacted: [],
      },
      { status: 500 },
    )
  }
}

