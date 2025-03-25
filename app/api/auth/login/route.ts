import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Get password from environment variable - now server-side only
    const validPassword = process.env.APP_PASSWORD

    if (!validPassword) {
      console.error("APP_PASSWORD environment variable is not set!")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (password === validPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error in login API route:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

