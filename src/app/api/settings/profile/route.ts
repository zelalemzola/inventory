import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

// This would typically connect to a User model
// For now, we'll simulate with a simple in-memory store
let profileData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  company: "AutoParts Inc.",
  address: "123 Main St, Anytown, USA",
  avatarUrl: "/placeholder-user.jpg",
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // In a real app, you would fetch the user profile from the database
    // For now, we'll return the simulated data

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validate the data
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // In a real app, you would update the user profile in the database
    // For now, we'll update the simulated data
    profileData = {
      ...profileData,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      company: body.company || "",
      address: body.address || "",
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: profileData,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

